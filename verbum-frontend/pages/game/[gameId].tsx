import { NextPage } from "next"
import { useRouter } from "next/router";
import { Box, Center, Container, Text } from '@chakra-ui/react'
import { useEffect, useState } from "react";
import GameHostClient from "../../logic/client";
import { GamePhase, MessageType, Player, PlayerEnter, PlayerExit, ScoreChange, ToFinished, ToOnGoing, ToStarting } from "../../logic/entities";
import React from "react";
import { ScoreTable } from "../../components/score";
import { GameBox } from "../../components/gameBox";
import { inBrowser, LS_USERNAME_KEY } from "../../logic/utils";

type GameState = {
    gamePhase: GamePhase,
    players: Player[],
    letters: string[],
    client: GameHostClient | null
};

const Game: NextPage = () => {
    var [state, setState] = useState<GameState>({
        gamePhase: "Connecting",
        players: [],
        letters: [],
        client: null
    });
    const router = useRouter();
    const gameId = router.query['gameId'];
    var username: string;

    useEffect(() => {
        if (gameId == null || typeof (gameId) != "string" || gameId.length <= 0 || state.client != null) return;

        console.log("Creating new client");

        var client = new GameHostClient(username, gameId);

        client.onDisconnect(() => setState((state) => ({ ...state, gamePhase: "Connecting" })));
        client.onConnect(() => {
            // Weird, I know. State is the initial object when the useEffect first runs, while s is the most recent state.
            client.hookGameCallbacks(handler, () => {setState((s) => ({...s, players: state.players, letters: state.letters, gamePhase: state.gamePhase}))});
        });
        client.connect();

        console.log("Setting client for room " + gameId);

        setState((state) => ({ ...state, client: client }))

        return () => {
            client.disconnect();
        }
    }, [gameId]);

    if (inBrowser()) {
        username = localStorage.getItem(LS_USERNAME_KEY) ?? "";
        if (username == "") {
            router.push("/"); //TODO - Better feedback ("need username!") and redirect back to same game once username is filled
            return <Box />;
        }
    }

    function playerEnter(msg: PlayerEnter, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => {
            var player = s.players.find(p => p.name == msg.PlayerName);
            if (player != null){
                player = {...player, connected: true}
            }else{
                player = { name: msg.PlayerName, score: 0, connected: true }
            }

            return { ...s, players: [...s.players.filter(p => p.name != msg.PlayerName), player] }
        });
    }

    function playerExit(msg: PlayerExit, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({ ...s, players: s.players.map(p => {
            if(p.name == msg.PlayerName){
                return {...p, connected: false}
            }else{
                return {...p}
            }
        }) }));
    }

    function scoreChange(msg: ScoreChange, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({
            ...s,
            players: s.players.map((p,i,a) => {
                var newScore = p.score;
                if (p.name == msg.PlayerName) {
                    newScore += msg.ScoreDiff;
                }
                return {...p, score: newScore};
            })
        }));
    }

    function toFinished(msg: ToFinished, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({
            ...s,
            gamePhase: "Finished"
        }));
    }

    function toOnGoing(msg: ToOnGoing, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({
            ...s,
            gamePhase: "OnGoing",
            letters: msg.Letters.map(n => String.fromCharCode(n))
        }));
    }

    function toStarting(msg: ToStarting, modifyState: (call: React.SetStateAction<GameState>) => void) {
        modifyState(s => ({
            ...s,
            gamePhase: "Starting"
        }));
    }

    async function sendAttempt(word: string): Promise<[boolean, number]> {
        if (!state.client) {
            return [false, 0];
        }

        return state.client.attemptWord(word);
    }

    const modifyStateNoRerender = (s: React.SetStateAction<GameState>) => {
        if(s instanceof Function){
            state = s(state)
        }else{
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

        if(isHistory){
            modifyState = modifyStateNoRerender;
        }

        switch (msgType) {
            case "PlayerEnter":
                console.log("PlayerEnter", ctx);
                playerEnter(ctx.data as PlayerEnter, modifyState);
                break;
            case "PlayerExit":
                console.log("PlayerExit", ctx);
                playerExit(ctx.data as PlayerExit, modifyState);
                break;
            case "ScoreChange":
                console.log("ScoreChange", ctx);
                scoreChange(ctx.data as ScoreChange, modifyState);
                break;
            case "ToFinished":
                console.log("ToFinished", ctx);
                toFinished(ctx.data as ToFinished, modifyState);
                break;
            case "ToOnGoing":
                console.log("ToOnGoing", ctx);
                toOnGoing(ctx.data as ToOnGoing, modifyState);
                break;
            case "ToStarting":
                console.log("ToStarting", ctx);
                toStarting(ctx.data as ToStarting, modifyState);
                break;
        }
    }

    return (
        <Center w='100%' h='100%' flexDirection="column" justifyContent="space-between">
            <Box display="flex" marginTop="3.5em">
                <Text className='antialiased' userSelect="none" as='i' fontSize='3xl' fontWeight='bold' marginTop="-1.5em">Verbum</Text>
                <Text className='antialiased' userSelect="none" as='i' fontSize='3xl' fontWeight='bold' marginTop="-1.5em" color="vgreen.500">.io</Text>
            </Box>
            <Container maxW='container.lg'>
                <Box display="flex">
                    <GameBox gamePhase={state.gamePhase} letters={state.letters} sendAttempt={sendAttempt} />
                    <ScoreTable players={state.players} />
                </Box>
            </Container>
            <Box />
        </Center>
    )
}

export default Game;