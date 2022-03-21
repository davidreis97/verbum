import { Tag, Box, Text } from "@chakra-ui/react";
import React from "react";
import { Player } from "../logic/entities";
import { MotionBox, smoothIn, springTransition } from "../logic/animations";
import { inBrowser, LS_USERNAME_KEY } from "../logic/utils";

function getTag(pos: number){
    if (pos == 1) {
        return <Tag borderRadius='full' colorScheme='yellow'>1.</Tag>
    } else if (pos == 2) {
        return <Tag borderRadius='full' colorScheme='gray'>2.</Tag>
    } else if (pos == 3) {
        return <Tag borderRadius='full' colorScheme='bronze'>3.</Tag>
    } else {
        return <Tag borderRadius='full' bgColor="rgba(0,0,0,0)">{pos}.</Tag>
    }
}

export const ScoreTable = (props: { players: Player[] }) => {
    var username: string;

    if (inBrowser()) {
        username = localStorage.getItem(LS_USERNAME_KEY) ?? "";
    }

    return (
        <MotionBox layout initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} scrollPadding="10px" margin="1em 0em 1em 0" width="280px" maxHeight="35em" overflowY="scroll" boxShadow="2xl" backgroundColor="#2C394B" borderRadius="2xl" paddingTop="1em" paddingBottom="1em">
            <Box display="flex" margin="0 0.5em 0 0.5em">
                <Box width="45px" paddingRight="0"></Box>
                <Text width="130px" paddingLeft="0" fontWeight="bold" color="gray.400" fontSize="xs">PLAYER</Text>
                <Text fontWeight="bold" color="gray.400" fontSize="xs">SCORE</Text>
            </Box>
            <Box>
                {
                    props.players.sort((a, b) => b.score - a.score).map((p, i) =>
                        <MotionBox borderRadius="1em" backgroundColor={p.name == username ? "rgb(255,255,255,0.1)" : ""} padding="0.25em 0 0.25em 0" margin="0 0.5em 0 0.5em" display="flex" key={p.name} layout initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition}>
                            <Box width="45px" textAlign="end" paddingRight="0.4em" whiteSpace="nowrap">{getTag(i+1)}</Box>
                            <Text opacity={p.connected ? 1 : 0.5} width="130px" paddingRight="0.5em">{p.name}{p.name == username}</Text>
                            <Text opacity={p.connected ? 1 : 0.5} whiteSpace="nowrap">{p.score} points</Text>
                        </MotionBox>
                    )
                }
            </Box>
        </MotionBox>
    );
}