import { Box } from "@chakra-ui/react"
import React from "react";
import { MotionBox, smoothIn, springTransition } from "../logic/animations";
import { getScreenDimensions, getWindowDimensions, inBrowser } from "../logic/utils";
import { LetterBox } from "./gameBox"

const xVariety = 200;
const yVariety = 200;
const scaleVariety = 1.5;
const scaleMin = 0.8;
const separation = 200;

export const Background = React.memo(() => {
    if(!inBrowser()){
        throw "This component is client-side only";
    }

    const screenDimensions = getScreenDimensions();

    var screenDimensionFactor = 0.8 + 250000 / (screenDimensions.height * screenDimensions.width);

    var letterBoxes: JSX.Element[] = []

    var uniqueKey = 0;

    for(var x = 0; x < screenDimensions.width + separation / screenDimensionFactor; x += separation / screenDimensionFactor){
        for(var y = 0; y < screenDimensions.height; y += separation / screenDimensionFactor){
            letterBoxes.push(
                <MotionBox key={uniqueKey} initial="hidden" animate="show" variants={smoothIn(0, -10)} transition={{ ...springTransition, delay: uniqueKey * 0.01 }}>
                    <LetterBox boxShadow='2xl' transform={`rotate(${360 * Math.random()}deg) scale(${scaleMin + (Math.random() * (scaleVariety / screenDimensionFactor))})`} position="absolute" left={x + (xVariety / screenDimensionFactor * (0.5 - Math.random()))} top={y + (yVariety / screenDimensionFactor * (0.5 - Math.random()))} letter={String.fromCharCode(65+Math.floor(Math.random()*26))}/>
                </MotionBox>
            );
            uniqueKey++;
        }
    }

    return (
        <Box overflow="hidden" zIndex={-100} position="fixed" width="100%" height="100%" opacity="0.2" filter="blur(4px)">
            { letterBoxes }
        </Box>
    )
});

export default Background;