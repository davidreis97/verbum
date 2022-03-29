import { Box, Center, Divider, Input, Wrap, WrapItem, Text, AlertIcon, Alert, Progress, BoxProps, CircularProgress } from "@chakra-ui/react";
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
import toast from "react-hot-toast";

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

    useEffect(() => {
        if(props.gamePhase == "Starting"){
            setWordsUsed(() => []);
            setWord(() => "");
        }
    }, [props.gamePhase]);

    async function processEnter(e: React.KeyboardEvent<HTMLInputElement>): Promise<void> {
        if (e.key == "Enter" && word.length > 0) {
            if (wordsUsed.includes(word)) {
                toast.error('Word already played.');
                return;
            }

            for (var i = 0; i < word.length; i++) {
                if (!props.letters.includes(word.charAt(i).toUpperCase())) {
                    toast.error(`Letter "${word.charAt(i)}" not in game set.`);
                    return;
                }
            }

            var [validWord, _] = await props.sendAttempt(word);
            if (validWord) {
                setWordsUsed((wordsUsed) => [...wordsUsed, word]);
                setWord(() => "");
                return;
            }

            toast.error(`"${word}" not in word list.`);
        }
    }

    return (
        <MotionBox margin="0em 1em 1em 1em" layout flexGrow="1">
            <MotionBox marginBottom="1em" layout initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} overflow="hidden" minHeight="92px" backgroundColor="vgreen.800" boxShadow="2xl" borderRadius="2xl" display="flex" width="auto" style={{ justifyContent: "space-evenly" }}>    
                {
                    (() => {
                        if (props.gamePhase == "Connecting") {
                            return (
                                <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} width="100%" display="flex" flexDir="column" alignItems="center" justifyContent="center">
                                    <CircularProgress isIndeterminate color="vgreen.200" trackColor="rgb(0,0,0,0)" />
                                </MotionBox>
                            )
                        } else if (props.gamePhase == "Starting") {
                            return (
                                <Box width="100%" display="flex" flexDir="column" alignItems="center">
                                    <Box flexGrow="1"/>
                                    <MotionText flexGrow="1" initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} fontSize="3xl">Waiting for players...</MotionText>
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
            <MotionBox marginBottom="1em" layout boxShadow="2xl" borderRadius="2xl" initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition}>
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
            <MotionBox layout initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} boxShadow="2xl" backgroundColor="#2C394B" borderRadius="2xl" padding="1em">
                <MotionText initial="hidden" animate="show" variants={smoothIn(0, 0)} transition={springTransition} fontWeight="bold" color="gray.400" fontSize="xs">{wordsUsed.length == 0 ? "NO WORDS PLAYED YET" : "WORDS PLAYED"}</MotionText>
                <Wrap marginTop="0.6em">
                    {wordsUsed.map((s, i) =>
                        <WrapItem key={i}>
                            <MotionText initial="hidden" animate="show" variants={successIn()} transition={springTransition} >{capitalizeFirstLetter(s)}</MotionText>
                        </WrapItem>
                    )}
                </Wrap>
            </MotionBox>
        </MotionBox>
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