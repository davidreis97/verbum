import { NextPage } from "next"
import { useRouter } from "next/router";
import { Box, Button, Center, Container, Text } from '@chakra-ui/react'
import { useEffect, useState } from "react";
import GameHostClient from "../../logic/client";
import { Errors, GamePhase, MessageType, Player, PlayerEnter, PlayerExit, ScoreChange, ToFinished, ToOnGoing, ToStarting, WordsSoFar } from "../../logic/entities";
import React from "react";
import { ScoreTable } from "../../components/score";
import { GameBox } from "../../components/gameBox";
import { inBrowser, LS_USERNAME_KEY } from "../../logic/utils";
import { LinkIcon } from "@chakra-ui/icons";
import { MotionBox, smoothIn, springTransition } from "../../logic/animations";
import dynamic from "next/dynamic";
import unusedModule from "../../components/verbumConfetti";
type ClientConfettiType = typeof unusedModule;
const VerbumConfetti = dynamic(
    () => import('../../components/verbumConfetti').then((mod) => mod.VerbumConfetti) as Promise<ClientConfettiType>,
    { ssr: false },
)
import toast from "react-hot-toast";

type GameState = {
    gamePhase: GamePhase,
    phaseDuration: number,
    phaseStart: number
    players: Player[],
    letters: string[],
    client: GameHostClient | null,
    userPlace: number,
    // If the player is reconnecting, the words that he previously played will be here. 
    // This value will not be kept up to date throughout the game.
    initialWordsUsed: string[] 
};

const Game: NextPage = () => {
    var [state, setState] = useState<GameState>({
        gamePhase: "Connecting",
        phaseDuration: 0,
        phaseStart: 0,
        players: [],
        letters: [],
        client: null,
        userPlace: 1,
        initialWordsUsed: []
    });
    const router = useRouter();
    const gameId = router.query['gameId'];
    var username: string;

    var connectionValid : Promise<void>;
    var resolveConnectionPromise: Function;


    function showConnectingToast() {
        toast.promise(connectionValid, {
            loading: "Connection Lost. Retrying...",
            error: "Connection Failed. Check your connection and refresh.",
            success: "Connection Reestablished."
        })
    }

    useEffect(() => {
        if (gameId == null || typeof (gameId) != "string" || gameId.length <= 0 || state.client != null) return;

        console.log("Creating new client");

        var client = new GameHostClient(username, gameId);

        client.onDisconnect((ctx) => {
            if(ctx.reason != "client" || ctx.reconnect != false){
                connectionValid = new Promise<void>((res) => {
                    resolveConnectionPromise = res;
                });
                showConnectingToast();
            }
        });
        client.onConnect(() => {
            if(resolveConnectionPromise != null){
                resolveConnectionPromise();
            }
            // Weird, I know. State is the initial object when the useEffect first runs, while s is the most recent state.
            client.hookGameCallbacks(handleGameMessages, () => {
                setState((s) =>
                ({
                    ...s,
                    players: state.players,
                    letters: state.letters,
                    gamePhase: state.gamePhase,
                    phaseDuration: state.phaseDuration,
                    phaseStart: state.phaseStart,
                    userPlace: state.userPlace
                }))
            }, errorHandler);
        });

        client.hookDirectMessageCallbacks(handleDirectMessages);

        client.connect();

        console.log("Setting client for room " + gameId);

        setState((state) => ({ ...state, client: client }))

        return () => {
            client.disconnect();
        }
    }, [gameId]);

    if (inBrowser() && gameId != null) {
        username = localStorage.getItem(LS_USERNAME_KEY) ?? "";
        if (username == "") {
            router.push({
                pathname: "/",
                query: {
                    gameId,
                    error: Errors.NoUsername
                }
            });
        }
    }
    
    function playerEnter(msg: PlayerEnter, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => {
            var player = s.players.find(p => p.name == msg.PlayerName);
            if (player != null) {
                player = { ...player, connected: true }
            } else {
                player = { name: msg.PlayerName, score: 0, connected: true }
            }

            return { ...s, players: [...s.players.filter(p => p.name != msg.PlayerName), player] }
        });
    }

    function playerExit(msg: PlayerExit, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({
            ...s, players: s.players.map(p => {
                if (p.name == msg.PlayerName) {
                    return { ...p, connected: false }
                } else {
                    return { ...p }
                }
            })
        }));
    }

    function scoreChange(msg: ScoreChange, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({
            ...s,
            players: s.players.map((p, i, a) => {
                var newScore = p.score;
                if (p.name == msg.PlayerName) {
                    newScore += msg.ScoreDiff;
                }
                return { ...p, score: newScore };
            })
        }));
    }

    function toFinished(msg: ToFinished, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({
            ...s,
            userPlace: s.players.sort((a, b) => b.score - a.score).findIndex(p => p.name == username) + 1,
            gamePhase: "Finished",
            phaseDuration: msg.Duration,
            phaseStart: msg.Timestamp,
        }));
    }

    function toOnGoing(msg: ToOnGoing, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({
            ...s,
            gamePhase: "OnGoing",
            letters: msg.Letters.map(n => String.fromCharCode(n)),
            phaseDuration: msg.Duration,
            phaseStart: msg.Timestamp,
        }));
    }

    function toStarting(msg: ToStarting, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({
            ...s,
            players: s.players.filter(p => p.connected).map(p => ({ ...p, score: 0 })),
            gamePhase: "Starting",
            phaseDuration: msg.Duration,
            phaseStart: msg.Timestamp,
        }));
    }

    async function sendAttempt(word: string): Promise<[boolean, number]> {
        if (!state.client) {
            return [false, 0];
        }

        return state.client.attemptWord(word);
    }

    function wordsSoFar(data: WordsSoFar) {
        console.log("THINGS");
        setState((s) => ({...s, initialWordsUsed: data.Words}));
    }    

    const modifyStateNoRerender = (s: React.SetStateAction<GameState>) => {
        if (s instanceof Function) {
            state = s(state)
        } else {
            state = s
        }
    }

    function handleDirectMessages(data: any){
        var msgType = data?.Type as MessageType;

        if (msgType == null) {
            console.log("Strange game message!", data);
            return;
        }

        console.log("Direct", msgType, data);

        switch (msgType){
            case "WordsSoFar":
                wordsSoFar(data as WordsSoFar);
                break;
            default:
                console.log("Not a direct message, wrong callback!", data);
        }
    }

    function handleGameMessages(ctx: any, isHistory: boolean) {
        var msgType = ctx?.data?.Type as MessageType;

        if (msgType == null) {
            console.log("Strange game message!", ctx);
            return;
        }

        var modifyState = setState;

        if (isHistory) {
            modifyState = modifyStateNoRerender;
        }

        console.log(msgType, ctx);

        switch (msgType) {
            case "PlayerEnter":
                playerEnter(ctx.data as PlayerEnter, modifyState);
                break;
            case "PlayerExit":
                playerExit(ctx.data as PlayerExit, modifyState);
                break;
            case "ScoreChange":
                scoreChange(ctx.data as ScoreChange, modifyState);
                break;
            case "ToFinished":
                toFinished(ctx.data as ToFinished, modifyState);
                break;
            case "ToOnGoing":
                toOnGoing(ctx.data as ToOnGoing, modifyState);
                break;
            case "ToStarting":
                toStarting(ctx.data as ToStarting, modifyState);
                break;
            default:
                console.log("Not a game message, wrong callback!", ctx);
        }
    }

    function errorHandler(code: number){
        if(code == 108){ //Room not available
            router.push({
                pathname: "/",
                query: {
                    error: Errors.RoomUnavailable
                }
            });
        }else if(code == 106){
            router.push({
                pathname: "/",
                query: {
                    gameId,
                    error: Errors.UserAlreadyExists
                }
            });
        }
    }

    function shareGame(){
        navigator.clipboard.writeText(window.location.href);
        toast.success("Copied game link to clipboard");
    }

    return (
        <Center w='100%' h='100%' flexDirection="column" justifyContent="space-between">
            <VerbumConfetti run={state.gamePhase == "Finished" && state.userPlace == 1}/>   
            <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -10)} transition={{ ...springTransition}} display="flex" marginTop="1em">
                <Button variant="unstyled" onClick={() => router.push("/")}>
                    <Text className='antialiased' userSelect="none" as='i' fontSize='3xl' fontWeight='bold' marginTop="-1.5em">Verbum</Text>
                    <Text className='antialiased' userSelect="none" as='i' fontSize='3xl' fontWeight='bold' marginTop="-1.5em" color="vgreen.500">.io</Text>
                </Button>
            </MotionBox>
            <Container maxW='container.lg'>
                <MotionBox layout margin="0em 0em 0.4em 1.8em"  initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition}>
                    <Button onClick={shareGame} size="sm" rightIcon={<LinkIcon />} colorScheme='vgreen' variant='ghost'>
                        Share game link
                    </Button>
                </MotionBox>
                <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} layout display="flex" flexWrap="wrap" justifyContent="center">
                    <GameBox initialWordsUsed={state.initialWordsUsed} gamePhase={state.gamePhase} phaseDuration={state.phaseDuration} phaseStart={new Date().getTime() / 1000 - state.phaseStart} letters={state.letters} sendAttempt={sendAttempt} userPlace={state.userPlace} />
                    <ScoreTable players={state.players} />
                </MotionBox>
            </Container>
            <Box />
        </Center>
    )
}

export default Game;