import { Tag, Tr, Td, Table, Thead, Th, Tbody, Box } from "@chakra-ui/react";
import React from "react";
import { ReactElement } from "react";
import { Player } from "../logic/entities";

export const ScoreTable = React.memo(
    (props: { players: Player[] }) => {
        return (
            <Box>
                <Table variant='simple' margin="1em" width="auto">
                    <Thead>
                        <Tr>
                            <Th paddingRight="0"></Th>
                            <Th paddingLeft="0">Player</Th>
                            <Th>Score</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            props.players.sort((a, b) => b.score - a.score).map((p, i) =>
                                <ScoreLine p={p} pos={i + 1} key={i}></ScoreLine>
                            )
                        }
                    </Tbody>
                </Table>
            </Box>
        );
    }
);

const ScoreLine = (props: { p: Player, pos: number }) => {
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
        <Tr>
            <Td whiteSpace="nowrap" paddingRight="0.4em">{tag}</Td>
            <Td whiteSpace="nowrap" paddingLeft="0">{props.p.name}</Td>
            <Td whiteSpace="nowrap">{props.p.score} words</Td>
        </Tr>
    );
}