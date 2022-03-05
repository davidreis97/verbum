import { Box, Center, Divider, Input, Wrap, WrapItem, Text } from "@chakra-ui/react";
import React from "react";
import { GamePhase } from "../logic/entities";

const LetterBox = (props: { letter: string }) => {
    return (
        <Box borderWidth='0px' padding="1em" borderRadius='lg' width="3em">
            <Center>
                <Text fontSize="4xl" fontWeight="bold">{props.letter}</Text>
            </Center>
        </Box>
    );
}

export const GameBox = React.memo((props: {gamePhase: GamePhase, letters: string[]}) => {
    return (
        <Box flexGrow="1">
            <Box padding="0 1em 0 1em" display="flex" width="auto" style={{ justifyContent: "space-evenly" }}>
                {
                    (() => {
                        if (props.gamePhase == "Connecting") {
                            return (
                                <Box padding="1em">
                                    <Text fontSize="4xl">Connecting...</Text>
                                </Box>
                            )
                        } else if (props.gamePhase == "Starting") {
                            return (
                                <Box padding="1em">
                                    <Text fontSize="4xl">Starting...</Text>
                                </Box>
                            )
                        } else if (props.gamePhase == "OnGoing") {
                            return (
                                <Box display="flex" style={{ justifyContent: "space-evenly" }}>
                                    {props.letters.map((l, i) => <LetterBox letter={l} key={i} />)}
                                </Box>
                            )
                        } else if (props.gamePhase == "Finished") {
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
                <Input isDisabled={props.gamePhase != "OnGoing"} variant="filled" size="lg" textAlign="center" placeholder="Type words..." />
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
    )
});