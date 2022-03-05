import { NextPage } from "next"
import { useRouter } from "next/router";
import { Box, Center, Input, Text, Container, Button, GridItem, Grid, Divider, Tag, Wrap, WrapItem, Badge } from '@chakra-ui/react'
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
} from '@chakra-ui/react'
import { useEffect, useState } from "react";
import GameHostClient from "../../logic/client";
import { MessageType } from "../../logic/messagePayloads";

type GamePhase = "Connecting" | "Starting" | "OnGoing" | "Finished"

type GameState = {
    gamePhase: GamePhase,
};

const Game: NextPage = () => {
    const [state, setState] = useState<GameState>({
        gamePhase: "OnGoing"
    });
    const router = useRouter();
    const gameIdString = router.query['gameId'];
    var gameId = Number.parseInt(gameIdString as string);

    const [client, setClient] = useState<GameHostClient | null>(null);

    useEffect(() => {
        if(gameId == NaN) return;

        const newClient = new GameHostClient();
        
        newClient.onConnect(() => setState((state) => ({...state, gamePhase: "Starting"})));
        newClient.onDisconnect(() => setState((state) => ({...state, gamePhase: "Connecting"})));
        newClient.hookGameCallbacks(gameId, handler);
        newClient.connect();

        console.log("Setting client for room " + gameId);

        setClient(newClient);
    }, [gameId]);

    function handler(ctx: any) {
        var msgType = ctx?.data?.Type as MessageType;

        if(msgType == null){
            console.log("Strange game message!", ctx);
            return;
        }

        switch(msgType){
            case "PlayerEnter":
                console.log("PlayerEnter", ctx);
                break;
            case "PlayerExit":
                console.log("PlayerExit", ctx);
                break;
            case "ScoreChange":
                console.log("ScoreChange", ctx);
                break;
            case "ToFinished":
                console.log("ToFinished", ctx);
                break;
            case "ToOnGoing":
                console.log("ToOnGoing", ctx);
                break;
            case "ToStarting":
                console.log("ToStarting", ctx);
        }
    }

    return (
        <Center w='100%' h='100%'>
            <Container maxW='container.lg'>
                <Box borderWidth='1px' borderRadius='lg' display="flex">
                    <Box flexGrow="1">
                        <Box padding="0 1em 0 1em" display="flex" width="auto" style={{ justifyContent: "space-evenly" }}>
                            {
                                (() => {
                                    if(state.gamePhase == "Connecting"){
                                        return (
                                            <Box padding="1em">
                                                <Text fontSize="4xl">Connecting...</Text>
                                            </Box>
                                            )
                                    }else if(state.gamePhase == "Starting"){
                                        return (
                                            <Box padding="1em">
                                                <Text fontSize="4xl">Starting...</Text>
                                            </Box>
                                            )
                                    }else if(state.gamePhase == "OnGoing"){
                                        return (
                                            <Box display="flex" style={{ justifyContent: "space-evenly" }}>
                                                <LetterBox letter="P" />
                                                <LetterBox letter="E" />
                                                <LetterBox letter="L" />
                                                <LetterBox letter="O" />
                                                <LetterBox letter="Q" />
                                                <LetterBox letter="I" />
                                                <LetterBox letter="R" />
                                            </Box>
                                        )
                                    }else if(state.gamePhase == "Finished"){
                                        return (
                                            <Box padding="1em">
                                                <Text fontSize="4xl">Game Ended, You Were 1st! 🎉</Text>
                                            </Box>
                                            )
                                    }
                                })()
                            }
                        </Box>
                        <Divider />
                        <Box padding="1em">
                            <Input isDisabled={state.gamePhase != "OnGoing"} variant="filled" size="lg" textAlign="center" placeholder="Type words..." />
                        </Box>
                        <Divider />
                        <Box padding="1em">
                            <Text as='i' fontWeight="bold">Words Written</Text>
                            <Wrap marginTop="0.6em">
                                {[...Array(20)].map((_, i) => 
                                    <WrapItem key={i}>
                                        <Text>MyWord{i}</Text>
                                    </WrapItem>
                                )}
                            </Wrap>
                        </Box>
                    </Box>
                    <Divider h="auto" orientation="vertical" />
                    <Box>
                        <ScoreTable />
                    </Box>
                </Box>
            </Container>
        </Center>
    )
}

const LetterBox = (props: { letter: string }) => {
    return (
        <Box borderWidth='0px' padding="1em" borderRadius='lg' width="3em">
            <Center>
                <Text fontSize="4xl" fontWeight="bold">{props.letter}</Text>
            </Center>
        </Box>
    );
}

const ScoreTable = () => {
    return (
        <Table variant='simple' margin="1em" width="auto">
            <Thead>
                <Tr>
                    <Th paddingRight="0"></Th>
                    <Th paddingLeft="0">Player</Th>
                    <Th>Score</Th>
                </Tr>
            </Thead>
            <Tbody>
                <Tr>
                    <Td whiteSpace="nowrap" paddingRight="0.4em"><Tag colorScheme='yellow'>1.</Tag></Td>
                    <Td whiteSpace="nowrap" paddingLeft="0" >davidreis97</Td>
                    <Td whiteSpace="nowrap">24 words</Td>
                </Tr>
                <Tr>
                    <Td whiteSpace="nowrap" paddingRight="0.4em"><Tag colorScheme='gray'>2.</Tag></Td>
                    <Td whiteSpace="nowrap" paddingLeft="0">davidreis97</Td>
                    <Td whiteSpace="nowrap">21 words</Td>
                </Tr>
                <Tr>
                    <Td whiteSpace="nowrap" paddingRight="0.4em"><Tag colorScheme='bronze'>3.</Tag></Td>
                    <Td whiteSpace="nowrap" paddingLeft="0">davidreis97</Td>
                    <Td whiteSpace="nowrap">17 words</Td>
                </Tr>
                <Tr>
                    <Td whiteSpace="nowrap" paddingRight="0.4em"><Tag bgColor="rgba(0,0,0,0)">4.</Tag></Td>
                    <Td whiteSpace="nowrap" paddingLeft="0">davidreis97</Td>
                    <Td whiteSpace="nowrap">14 words</Td>
                </Tr>
            </Tbody>
        </Table>
    );
}

export default Game;