import { Box, Center, Divider, Input, Wrap, WrapItem, Text, AlertIcon, Alert, Progress, BoxProps, CircularProgress, Button, ButtonProps, Icon } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { GamePhase } from "../logic/entities";
import { MotionBox, MotionText, smoothIn, springTransition, successIn } from "../logic/animations";
import { Timer } from "./timer";
import toast from "react-hot-toast";
import { IoReturnDownBackOutline, IoBackspaceOutline } from "react-icons/io5"
import { AllWordsPlayed, SelfWordsPlayed } from "./wordsPlayed";
import { capitalizeFirstLetter, ordinal } from "../logic/utils";

interface LetterBoxProps extends ButtonProps {
    letter: string,
    setLetter?: (letter :string) => void
}

export const LetterBox = (props: LetterBoxProps) => {
    var {letter,setLetter, ...other} = props;

    return (
        <Button {...other} onMouseDown={()=>{props.setLetter?.(props.letter);}} boxShadow="2xl" margin="1em 0.5em 1em 0.5em" padding="0em 1.6em 0em 1.6em" backgroundColor="vgreen.999" borderRadius='2xl' height="3.3em" width="3em">
            <Center>
                <Text marginTop="3px" marginRight="1px" fontFamily="Varela Round, Helvetica, sans-serif" fontSize="4xl" fontWeight="bold">{props.letter}</Text>
            </Center>
        </Button>
    );
}

export const GameBox = (props: { allWordsPlayed:{[username: string]: string[]}, initialWordsUsed: string[], gamePhase: GamePhase, phaseDuration: number, phaseStart: number, letters: string[], sendAttempt: (word: string) => Promise<[boolean, number]>, userPlace: number }) => {
    var [wordsUsed, setWordsUsed] = useState<string[]>(props.initialWordsUsed);
    var [word, setWord] = useState<string>("");

    useEffect(() => {
        if(props.gamePhase == "Starting"){
            setWordsUsed(() => []);
            setWord(() => "");
        }
    }, [props.gamePhase]);

    useEffect(() => {
        setWordsUsed(() => props.initialWordsUsed);
    }, [props.initialWordsUsed]);

    async function sendWord(): Promise<void> {
        if (word.length > 0) {
            if (word.at(-1) == "s") {
                toast.error('Plural with "s" not allowed.');
                return;
            }

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
        }else{
            toast.error(`Type a word to play!`);
        }
    }

    return (
        <MotionBox margin="0em 1em 1em 1em" layout flexGrow="1">
            <MotionBox marginBottom="1em" layout overflow="hidden" minHeight="92px" backgroundColor="vgreen.800" boxShadow="2xl" borderRadius="2xl" display="flex" width="auto" style={{ justifyContent: "space-evenly" }}>    
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
                                            <MotionBox display="flex" alignItems="center" key={i} initial="hidden" animate="show" variants={smoothIn(0, -10)} transition={{ ...springTransition, delay: i * 0.1 }}>
                                                <LetterBox setLetter={(letter: string) => {setWord((w) => capitalizeFirstLetter((w+letter).replace(/[^a-zA-Z]/gi, '')))}} letter={l} key={i} />
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
            <MotionBox position="relative" marginBottom="1em" layout boxShadow="xl" borderRadius="2xl">
                <Input id="wordinput"
                    onBlur={(e) => e.target.placeholder = "Type here!"}
                    onFocus={(e) => e.target.placeholder = ""}
                    autoComplete="off"
                    focusBorderColor="vgreen.999"
                    backgroundColor="#2C394B"
                    borderRadius="2xl"
                    value={word}
                    onChange={(e) => setWord(() => capitalizeFirstLetter(e.target.value.replace(/[^a-zA-Z]/gi, '')))}
                    onKeyDown={(e) => e.key == "Enter" ? sendWord() : null}
                    isDisabled={props.gamePhase != "OnGoing"}
                    variant="filled"
                    size="lg"
                    textAlign="center"
                    placeholder="Type here!" />
                <Box height="3em" width="6.3em" position="absolute" top="0em" right="0em" /> {/*Stops input below the buttons */}
                <Button isDisabled={props.gamePhase != "OnGoing"} onClick={() => sendWord()} padding="0 12px 0 12px" position="absolute" borderRadius="1em" right="0.2em" top="0.229em" colorScheme="vgreen" ><Icon boxSize="1.3em" as={IoReturnDownBackOutline} /></Button>
                <Button isDisabled={props.gamePhase != "OnGoing"} onClick={() => setWord((w) => w.slice(0,-1))} padding="0 12px 0 12px" position="absolute" borderRadius="1em" right="3.2em" top="0.229em"><Icon boxSize="1.3em" as={IoBackspaceOutline} /></Button>
            </MotionBox>
            {props.gamePhase == "Finished" ? <AllWordsPlayed wordsPlayed={props.allWordsPlayed}/> : <SelfWordsPlayed wordsUsed={wordsUsed}/>}
        </MotionBox>
    )
};