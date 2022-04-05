import { Text, Wrap, WrapItem, Popover, PopoverTrigger, PopoverCloseButton, PopoverArrow, PopoverBody, PopoverContent } from "@chakra-ui/react";
import { MotionBox, MotionText, successIn, springTransition } from "../logic/animations";
import { capitalizeFirstLetter, LS_USERNAME_KEY } from "../logic/utils";

export const AllWordsPlayed = (props: {wordsPlayed: {[username: string]: string[]}}) => {
    const localUsername = localStorage.getItem(LS_USERNAME_KEY) ?? "";

    var wordsToUsernames: {[word: string]: string[]} = {}

    for(var username in props.wordsPlayed){
        for(var word of props.wordsPlayed[username]){
            if(wordsToUsernames[word] == null){
                wordsToUsernames[word] = [];
            }

            wordsToUsernames[word].push(username);
        }
    }

    return (
        <MotionBox layout boxShadow="2xl" backgroundColor="#2C394B" borderRadius="2xl" padding="1em">
            <MotionText fontWeight="bold" color="gray.400" fontSize="xs">WORDS PLAYED BY ALL PLAYERS</MotionText>
            <Wrap marginTop="0.6em">
                {Object.keys(wordsToUsernames).map((word, i) => 
                <WrapItem key={i}>
                    <Popover trigger="hover">
                        <PopoverTrigger>
                            <MotionText textDecoration="underline dashed var(--chakra-colors-whiteAlpha-700) 1px" initial="hidden" animate="show" variants={successIn()} transition={springTransition}>{capitalizeFirstLetter(word)}</MotionText>
                        </PopoverTrigger>
                        <PopoverContent width="auto">
                            <PopoverArrow />
                            <PopoverBody paddingLeft="0.6em" paddingRight="0.6em">
                                {wordsToUsernames[word].map((username, i) => <Text borderRadius="1em" padding="0 0.3em 0 0.3em" backgroundColor={localUsername == username ? "rgb(255,255,255,0.1)" : ""} key={i}>{username}</Text>)}
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </WrapItem>)}
            </Wrap>
        </MotionBox>
    )
}

export const SelfWordsPlayed = (props: {wordsUsed: string[]}) => {
    return <MotionBox layout boxShadow="2xl" backgroundColor="#2C394B" borderRadius="2xl" padding="1em">
        <MotionText fontWeight="bold" color="gray.400" fontSize="xs">{props.wordsUsed.length == 0 ? "NO WORDS PLAYED YET" : "WORDS PLAYED"}</MotionText>
        <Wrap marginTop="0.6em">
            {props.wordsUsed.map((word, i) => 
            <WrapItem key={i}>
                <MotionText initial="hidden" animate="show" variants={successIn()} transition={springTransition}>{capitalizeFirstLetter(word)}</MotionText>
            </WrapItem>
            )}
        </Wrap>
    </MotionBox>;
}