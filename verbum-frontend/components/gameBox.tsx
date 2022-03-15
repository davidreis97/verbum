import { Box, Center, Divider, Input, Wrap, WrapItem, Text, AlertIcon, Alert, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { GamePhase } from "../logic/entities";
import { MotionBox, MotionText, smoothIn, springTransition, successIn } from "../logic/animations";

const LetterBox = (props: { letter: string }) => {
    return (
        <Box boxShadow="2xl" margin="1em 0.5em 1em 0.5em" padding="0.1em 1.6em 0em 1.6em" backgroundColor="vgreen.999" borderWidth='0px' borderRadius='2xl' width="3em">
            <Center>
                <Text fontSize="4xl" fontWeight="bold">{props.letter}</Text>
            </Center>
        </Box>
    );
}

export const GameBox = React.memo((props: { gamePhase: GamePhase, letters: string[], sendAttempt: (word: string) => Promise<[boolean, number]> }) => {
    var [wordsUsed, setWordsUsed] = useState<string[]>([]);
    var [word, setWord] = useState<string>("");
    const toast = useToast();

    if (props.gamePhase != "OnGoing") {
        word = "";
    }

    //TODO - TEST THIS SHIT WITHOUT CLIENT SIDE VALIDATION
    async function processEnter(e: React.KeyboardEvent<HTMLInputElement>): Promise<void> {
        if (e.key == "Enter" && word.length > 0) {
            if (wordsUsed.includes(word)) {
                toast({
                    title: 'Word already played.',
                    status: 'error',
                    duration: 1500,
                    isClosable: false,
                })
                return;
            }

            for (var i = 0; i < word.length; i++) {
                if (!props.letters.includes(word.charAt(i).toUpperCase())) {
                    toast({
                        title: `Letter "${word.charAt(i)}" not in game set.`,
                        status: 'error',
                        duration: 1500,
                        isClosable: false,
                    })
                    return;
                }
            }

            var [validWord, _] = await props.sendAttempt(word);
            if (validWord) {
                setWordsUsed((wordsUsed) => [...wordsUsed, word]);
                setWord(() => "");
                return;
            }

            toast({
                title: `Not in word list.`,
                status: 'error',
                duration: 1500,
                isClosable: false,
            })
        }
    }

    return (
        <Box flexGrow="1">
            <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} margin="1em" backgroundColor="vgreen.800" boxShadow="2xl" borderRadius="2xl" padding="0 1em 0 1em" display="flex" width="auto" style={{ justifyContent: "space-evenly" }}>
                {
                    (() => {
                        if (props.gamePhase == "Connecting") {
                            return (
                                <Box padding="1em">
                                    <MotionText initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} fontSize="4xl">Connecting...</MotionText>
                                </Box>
                            )
                        } else if (props.gamePhase == "Starting") {
                            return (
                                <Box padding="1em">
                                    <MotionText initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} fontSize="4xl">Starting...</MotionText>
                                </Box>
                            )
                        } else if (props.gamePhase == "OnGoing") {
                            return (
                                <Box display="flex" style={{ justifyContent: "space-evenly" }}>
                                    {props.letters.map((l, i) =>
                                        <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -10)} transition={{...springTransition,delay: i * 0.1}}>
                                            <LetterBox letter={l} key={i} />
                                        </MotionBox>)}
                                </Box>
                            )
                        } else if (props.gamePhase == "Finished") {
                            return (
                                <Box padding="1em">
                                    <MotionText initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} fontSize="4xl">Game Ended, You Were 1st! 🎉</MotionText>
                                </Box>
                            )
                        }
                    })()
                }
            </MotionBox>
            <MotionBox margin="2em 1em 2em 1em" boxShadow="2xl" borderRadius="2xl" initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition}>
                <Input id="wordinput"
                    onBlur={(e) => e.target.placeholder = "Type words..."}
                    onFocus={(e) => e.target.placeholder = ""}
                    focusBorderColor="#278282"
                    backgroundColor="#2C394B"
                    borderRadius="2xl"
                    value={word}
                    onChange={(e) => setWord(() => capitalizeFirstLetter(e.target.value.replace(/[^a-zA-Z]/gi, '')))}
                    onKeyDown={(e) => processEnter(e)}
                    isDisabled={props.gamePhase != "OnGoing"}
                    variant="filled"
                    size="lg"
                    textAlign="center"
                    placeholder="Type words..." />
            </MotionBox>
            <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} margin="1em" boxShadow="2xl" backgroundColor="#2C394B" borderRadius="2xl" padding="1em">
                {wordsUsed.length == 0 ? <Text fontWeight="bold" color="gray.400" fontSize="xs">NO WORDS PLAYED YET</Text> :
                    <Box>
                        <MotionText initial="hidden" animate="show" variants={smoothIn(0, 0)} transition={springTransition} fontWeight="bold" color="gray.400" fontSize="xs">WORDS PLAYED</MotionText>
                        <Wrap marginTop="0.6em">
                            {wordsUsed.map((s, i) =>
                                <WrapItem key={i}>
                                    <MotionText initial="hidden" animate="show" variants={successIn()} transition={springTransition} >{capitalizeFirstLetter(s)}</MotionText>
                                </WrapItem>
                            )}
                        </Wrap>
                    </Box>
                }
            </MotionBox>
        </Box>
    )
});

function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}