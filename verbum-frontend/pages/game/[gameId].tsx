import { NextPage } from "next"
import { useRouter } from "next/router";
import { Box, Button, Center, Container, Text, ToastId, useToast } from '@chakra-ui/react'
import { useEffect, useState } from "react";
import GameHostClient from "../../logic/client";
import { Errors, GamePhase, MessageType, Player, PlayerEnter, PlayerExit, ScoreChange, ToFinished, ToOnGoing, ToStarting } from "../../logic/entities";
import React from "react";
import { ScoreTable } from "../../components/score";
import { GameBox } from "../../components/gameBox";
import { inBrowser, LS_USERNAME_KEY } from "../../logic/utils";
import { LinkIcon } from "@chakra-ui/icons";
import { MotionBox, smoothIn, springTransition } from "../../logic/animations";

type GameState = {
    gamePhase: GamePhase,
    phaseDuration: number,
    phaseStart: number
    players: Player[],
    letters: string[],
    client: GameHostClient | null,
    userPlace: number,
};

const Game: NextPage = () => {
    var [state, setState] = useState<GameState>({
        gamePhase: "Connecting",
        phaseDuration: 0,
        phaseStart: 0,
        players: [],
        letters: [],
        client: null,
        userPlace: 1
    });
    const router = useRouter();
    const gameId = router.query['gameId'];
    var username: string;

    const toast = useToast();
    const connectionToastIdRef = React.useRef<ToastId>();

    function closeConnectingToast() {
        if (connectionToastIdRef.current) {
            toast.close(connectionToastIdRef.current)
        }
    }

    function showConnectingToast() {
        connectionToastIdRef.current = toast({
            title: "Connection Lost. Retrying...",
            status: "error",
            isClosable: false,
            duration: null
        });
    }

    useEffect(() => {
        if (gameId == null || typeof (gameId) != "string" || gameId.length <= 0 || state.client != null) return;

        console.log("Creating new client");

        var client = new GameHostClient(username, gameId);

        client.onDisconnect((ctx) => {
            if(ctx.reason != "client" || ctx.reconnect != false){
                showConnectingToast();
            }
        });
        client.onConnect(() => {
            closeConnectingToast();
            // Weird, I know. State is the initial object when the useEffect first runs, while s is the most recent state.
            client.hookGameCallbacks(handler, () => {
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

    const modifyStateNoRerender = (s: React.SetStateAction<GameState>) => {
        if (s instanceof Function) {
            state = s(state)
        } else {
            state = s
        }
    }

    function handler(ctx: any, isHistory: boolean) {
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
        toast({
            title: "Copied game link to clipboard",
            isClosable: true,
            status: "success",
            variant: "subtle"
        });
    }

    return (
        <Center w='100%' h='100%' flexDirection="column" justifyContent="space-between">
            <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -10)} transition={{ ...springTransition}} display="flex" marginTop="1em">
                <Button variant="unstyled" onClick={() => router.push("/")}>
                    <Text className='antialiased' userSelect="none" as='i' fontSize='3xl' fontWeight='bold' marginTop="-1.5em">Verbum</Text>
                    <Text className='antialiased' userSelect="none" as='i' fontSize='3xl' fontWeight='bold' marginTop="-1.5em" color="vgreen.500">.io</Text>
                </Button>
            </MotionBox>
            <Container maxW='container.lg'>
                <MotionBox layout initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition}>
                    <Button onClick={shareGame} marginLeft="1.8em" marginBottom="-1em" size="sm" rightIcon={<LinkIcon />} colorScheme='vgreen' variant='ghost'>
                        Share game link
                    </Button>
                </MotionBox>
                <Box display="flex" flexWrap="wrap" justifyContent="center">
                    <GameBox gamePhase={state.gamePhase} phaseDuration={state.phaseDuration} phaseStart={new Date().getTime() / 1000 - state.phaseStart} letters={state.letters} sendAttempt={sendAttempt} userPlace={state.userPlace} />
                    <ScoreTable players={state.players} />
                </Box>
            </Container>
            <Box />
        </Center>
    )
}

export default Game;