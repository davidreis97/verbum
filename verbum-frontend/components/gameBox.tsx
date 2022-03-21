import { Box, Center, Divider, Input, Wrap, WrapItem, Text, AlertIcon, Alert, useToast, Progress, BoxProps } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { GamePhase } from "../logic/entities";
import { MotionBox, MotionText, smoothIn, springTransition, successIn } from "../logic/animations";
import dynamic from "next/dynamic";
import unusedModule from "./verbumConfetti";
type ClientConfettiType = typeof unusedModule;
const VerbumConfetti = dynamic(
    () => import('./verbumConfetti').then((mod) => mod.VerbumConfetti) as Promise<ClientConfettiType>,
    { ssr: false },
)
import { Timer } from "./timer";

interface LetterBoxProps extends BoxProps {
    letter: string
}

export const LetterBox = (props: LetterBoxProps) => {
    return (
        <Box {...props} boxShadow="2xl" margin="1em 0.5em 1em 0.5em" padding="0.1em 1.6em 0em 1.6em" backgroundColor="vgreen.999" borderWidth='0px' borderRadius='2xl' width="3em">
            <Center>
                <Text fontSize="4xl" fontWeight="bold">{props.letter}</Text>
            </Center>
        </Box>
    );
}

export const GameBox = (props: { gamePhase: GamePhase, phaseDuration: number, phaseStart: number, letters: string[], sendAttempt: (word: string) => Promise<[boolean, number]>, userPlace: number }) => {
    var [wordsUsed, setWordsUsed] = useState<string[]>([]);
    var [word, setWord] = useState<string>("");

    const toast = useToast();

    useEffect(() => {
        if(props.gamePhase == "Starting"){
            setWordsUsed(() => []);
        }
    }, [props.gamePhase]);

    if (props.gamePhase != "OnGoing") {
        word = "";
    }

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
            <VerbumConfetti run={props.gamePhase == "Finished" && props.userPlace == 1}/>   
            <MotionBox layout initial="hidden" animate="show" overflow="hidden" variants={smoothIn(0, -50)} transition={springTransition} minHeight="92px" margin="1em" backgroundColor="vgreen.800" boxShadow="2xl" borderRadius="2xl" display="flex" width="auto" style={{ justifyContent: "space-evenly" }}>    
                {
                    (() => {
                        if (props.gamePhase == "Connecting") {
                            return (
                                <Box width="100%" display="flex" flexDir="column" alignItems="center">
                                    <MotionText alignContent="center" flexGrow="1" initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} fontSize="4xl">Connecting...</MotionText>
                                </Box>
                            )
                        } else if (props.gamePhase == "Starting") {
                            return (
                                <Box width="100%" display="flex" flexDir="column" alignItems="center">
                                    <Box flexGrow="1"/>
                                    <MotionText flexGrow="1" initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} fontSize="4xl">Starting...</MotionText>
                                    <Timer key={0} growing={true} initialTime={props.phaseStart} time={props.phaseDuration} withWarning={false} />
                                </Box>
                            )
                        } else if (props.gamePhase == "OnGoing") {
                            return (
                                <Box width="100%" display="flex" flexDir="column" alignItems="center">
                                    <Box flexGrow="1" flexWrap="wrap" display="flex" style={{ justifyContent: "space-evenly" }}>
                                        {props.letters.map((l, i) =>
                                            <MotionBox key={i} initial="hidden" animate="show" variants={smoothIn(0, -10)} transition={{ ...springTransition, delay: i * 0.1 }}>
                                                <LetterBox letter={l} key={i} />
                                            </MotionBox>)}
                                    </Box>
                                    <Timer key={1} growing={false} initialTime={props.phaseStart} time={props.phaseDuration} withWarning={true} />
                                </Box>
                            )
                        } else if (props.gamePhase == "Finished") {
                            return (
                                <Box width="100%" display="flex" flexDir="column" alignItems="center">
                                    <Box flexGrow="1"/>
                                    <MotionText flexGrow="1" initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} fontSize="4xl">{ordinal(props.userPlace)} Place! 🎉</MotionText>
                                    <Timer key={2} growing={true} initialTime={props.phaseStart} time={props.phaseDuration} withWarning={false} />
                                </Box>
                            )
                        }
                    })()
                }
            </MotionBox>
            <MotionBox layout margin="2em 1em 2em 1em" boxShadow="2xl" borderRadius="2xl" initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition}>
                <Input id="wordinput"
                    onBlur={(e) => e.target.placeholder = "Type words..."}
                    onFocus={(e) => e.target.placeholder = ""}
                    autoComplete="off"
                    focusBorderColor="vgreen.999"
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
            <MotionBox initial="hidden" layout animate="show" variants={smoothIn(0, -50)} transition={springTransition} margin="1em" boxShadow="2xl" backgroundColor="#2C394B" borderRadius="2xl" padding="1em">
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
};

function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const english_ordinal_rules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes = {
    zero: "",
    one: "st",
    two: "nd",
    few: "rd",
    many: "",
    other: "th"
};
function ordinal(n: number) {
    const suffix = suffixes[english_ordinal_rules.select(n)]
    return (n + suffix)
}