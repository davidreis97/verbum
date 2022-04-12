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
    var [state, setState] = useState<{wordsUsed: string[], word: string}>({wordsUsed: props.initialWordsUsed, word: ""});

    useEffect(() => {
        if(props.gamePhase == "Starting"){
            setState(() => ({wordsUsed: [], word: ""}));
        }
    }, [props.gamePhase]);

    useEffect(() => {
        setState((s) => ({...s, wordsUsed: props.initialWordsUsed}));
    }, [props.initialWordsUsed]);

    function sendWord() {
        if (state.word.length > 0) {
            console.log("big enough");
            if (state.word[state.word.length-1] == "s") {
                console.log("plural");
                toast.error('Plural with "s" not allowed.');
                return;
            }

            if (state.wordsUsed.includes(state.word)) {
                console.log("already");
                toast.error('Word already played.');
                return;
            }

            for (var i = 0; i < state.word.length; i++) {
                if (!props.letters.includes(state.word.charAt(i).toUpperCase())) {
                    console.log("not in set");
                    toast.error(`Letter "${state.word.charAt(i)}" not in game set.`);
                    return;
                }
            }

            props.sendAttempt(state.word).then(([validWord, _]) => {
                if (validWord) {
                    console.log("valid, set state");
                    setState((s) => ({word: "", wordsUsed: [...s.wordsUsed, state.word]}));
                }else{
                    console.log("not in word list");
                    toast.error(`"${state.word}" not in word list.`);
                }
            }).catch((e) => {
                console.error(e);
                toast.error(`Unspecified error.`);
            });            
        }else{
            console.log("not big enough");
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
                                                <LetterBox setLetter={(letter: string) => {setState((s) => ({...s, word:capitalizeFirstLetter((s.word+letter).replace(/[^a-zA-Z]/gi, ''))}))}} letter={l} key={i} />
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
                    value={state.word}
                    onChange={(e) => setState((s) => ({...s,word: capitalizeFirstLetter(e.target.value.replace(/[^a-zA-Z]/gi, ''))}))}
                    onKeyDown={(e) => e.key == "Enter" ? sendWord() : null}
                    isDisabled={props.gamePhase != "OnGoing"}
                    variant="filled"
                    size="lg"
                    textAlign="center"
                    placeholder="Type here!" />
                <Box height="3em" width="6.3em" position="absolute" top="0em" right="0em" /> {/*Stops input below the buttons */}
                <Button isDisabled={props.gamePhase != "OnGoing"} onClick={() => {console.log("OnCLick");sendWord();}} padding="0 12px 0 12px" position="absolute" borderRadius="1em" right="0.2em" top="0.229em" colorScheme="vgreen" ><Icon boxSize="1.3em" as={IoReturnDownBackOutline} /></Button>
                <Button isDisabled={props.gamePhase != "OnGoing"} onClick={() => setState((s) => ({...s,word:s.word.slice(0,-1)}))} padding="0 12px 0 12px" position="absolute" borderRadius="1em" right="3.2em" top="0.229em"><Icon boxSize="1.3em" as={IoBackspaceOutline} /></Button>
            </MotionBox>
            {props.gamePhase == "Finished" ? <AllWordsPlayed wordsPlayed={props.allWordsPlayed}/> : <SelfWordsPlayed wordsUsed={state.wordsUsed}/>}
        </MotionBox>
    )
};