import { NextPage } from "next"
import { useRouter } from "next/router";
import { Box, Center, Container, Divider } from '@chakra-ui/react'
import { useEffect, useState } from "react";
import GameHostClient from "../../logic/client";
import { GamePhase, MessageType, Player, PlayerEnter, PlayerExit, ScoreChange, ToFinished, ToOnGoing, ToStarting } from "../../logic/entities";
import React from "react";
import { ScoreTable } from "../../components/score";
import { GameBox } from "../../components/gameBox";
import { inBrowser, LS_USERNAME_KEY, LS_UUID_KEY } from "../../logic/utils";

type GameState = {
    gamePhase: GamePhase,
    players: Player[],
    letters: string[]
};

const Game: NextPage = () => {
    const [state, setState] = useState<GameState>({
        gamePhase: "Connecting",
        players: [],
        letters: []
    });
    const router = useRouter();
    const gameIdString = router.query['gameId'];
    var gameId = Number.parseInt(gameIdString as string);
    var username: string;
    var uuid: string;

    if(inBrowser()){
        username = localStorage.getItem(LS_USERNAME_KEY) ?? "";
        uuid = localStorage.getItem(LS_UUID_KEY) ?? "";
        if(username == "" || uuid == ""){
            router.push("/"); //TODO - Better feedback ("need username!") and redirect back to same game once username is filled
            return <Box></Box>;
        }
    }

    useEffect(() => {
        if (isNaN(gameId) && typeof gameId === 'number') return;

        const client = new GameHostClient(username + "/&&/" + uuid, gameId);

        client.onConnect(() => setState((state) => ({ ...state, gamePhase: "Starting" })));
        client.onDisconnect(() => setState((state) => ({ ...state, gamePhase: "Connecting" })));
        client.hookGameCallbacks(handler);
        client.connect();

        console.log("Setting client for room " + gameId);
    }, [gameId]);

    function playerEnter(msg: PlayerEnter){
        setState(s => ({...s, players: [...s.players, {id: msg.PlayerId, name: msg.PlayerName, score: 0}] }));
    }

    function playerExit(msg: PlayerExit){
        setState(s => ({...s, players: s.players.filter(p => p.id != msg.PlayerId) }));
    }

    function scoreChange(msg: ScoreChange){
        setState(s => ({
            ...s,
            players: s.players.map(p => {
                if (p.id == msg.PlayerId){
                    p.score += msg.ScoreDiff;
                }
                return p;
            })
        }));
    }

    function toFinished(msg: ToFinished){
        setState(s => ({
            ...s,
            gamePhase: "Finished"
        }));
    }

    function toOnGoing(msg: ToOnGoing){
        setState(s => ({
            ...s,
            gamePhase: "OnGoing",
            letters: msg.Letters
        }));
    }

    function toStarting(msg: ToStarting){
        setState(s => ({
            ...s,
            gamePhase: "Starting"
        }));
    }

    function handler(ctx: any) {
        var msgType = ctx?.data?.Type as MessageType;

        if (msgType == null) {
            console.log("Strange game message!", ctx);
            return;
        }

        switch (msgType) {
            case "PlayerEnter":
                console.log("PlayerEnter", ctx);
                playerEnter(ctx.data as PlayerEnter);
                break;
            case "PlayerExit":
                console.log("PlayerExit", ctx);
                playerExit(ctx.data as PlayerExit);
                break;
            case "ScoreChange":
                console.log("ScoreChange", ctx);
                scoreChange(ctx.data as ScoreChange);
                break;
            case "ToFinished":
                console.log("ToFinished", ctx);
                toFinished(ctx.data as ToFinished);
                break;
            case "ToOnGoing":
                console.log("ToOnGoing", ctx);
                toOnGoing(ctx.data as ToOnGoing);
                break;
            case "ToStarting":
                console.log("ToStarting", ctx);
                toStarting(ctx.data as ToStarting);
        }
    }

    return (
        <Center w='100%' h='100%'>
            <Container maxW='container.lg'>
                <Box borderWidth='1px' borderRadius='lg' display="flex">
                    <GameBox gamePhase={state.gamePhase} letters={state.letters}/>
                    <Divider h="auto" orientation="vertical" />
                    <ScoreTable players={state.players} />
                </Box>
            </Container>
        </Center>
    )
}

export default Game;