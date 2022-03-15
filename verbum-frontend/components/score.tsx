import { Tag, Tr, Td, Table, Thead, Th, Tbody, Box } from "@chakra-ui/react";
import React from "react";
import { ReactElement } from "react";
import { Player } from "../logic/entities";
import { motion } from "framer-motion"
import { MotionBox, MotionTr, smoothIn, springTransition } from "../logic/animations";

export const ScoreTable = React.memo(
    (props: { players: Player[] }) => {
        return (
            <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} scrollPadding="10px" margin="1em 1em 1em 0" width="20em" maxHeight="35em" overflowY="scroll" boxShadow="2xl" backgroundColor="#2C394B" borderRadius="2xl" paddingTop="1em" paddingBottom="1em">
                <Table variant='unstyled' width="100%">
                    <Thead>
                        <Tr>
                            <Th paddingRight="0"></Th>
                            <Th paddingLeft="0" color="gray.400">Player</Th>
                            <Th color="gray.400">Score</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            props.players.sort((a, b) => b.score - a.score).map((p, i) =>
                                <ScoreLine p={p} pos={i + 1}></ScoreLine>
                            )
                        }
                    </Tbody>
                </Table>
            </MotionBox>
        );
    }
);

const ScoreLine = motion((props: { p: Player, pos: number }) => {
    var tag: ReactElement<any, any>;

    if (props.pos == 1) {
        tag = <Tag colorScheme='yellow'>1.</Tag>
    } else if (props.pos == 2) {
        tag = <Tag colorScheme='gray'>2.</Tag>
    } else if (props.pos == 3) {
        tag = <Tag colorScheme='bronze'>3.</Tag>
    } else {
        tag = <Tag bgColor="rgba(0,0,0,0)">{props.pos}.</Tag>
    }

    return (
        <MotionTr key={props.pos} layout initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition}>
            <Td padding="0.7em 0 0.7em 1.5em" whiteSpace="nowrap">{tag}</Td>
            <Td padding="0.7em 0.4em 0.7em 0" whiteSpace="nowrap">{props.p.name}</Td>
            <Td padding="0.7em 0.4em 0.7em 1.5em" whiteSpace="nowrap">{props.p.score} points</Td>
        </MotionTr>
    );
})