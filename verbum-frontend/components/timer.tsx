import { Progress } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

const measure = 1;

export const Timer = React.memo((props: {time: number, initialTime: number, withWarning: boolean, growing: boolean}) => {
    const percentPerMeasure = 100.0 * measure / props.time;
    
    console.log(props.time, props.initialTime);

    const [progress, setProgress] = useState<number>((100.0 * props.initialTime) / props.time);

    console.log("Initialized at", progress);

    useEffect(() => {
        //setProgress(progress + percentPerMeasure); //TODO - WTF
        var intervalId = setInterval(() => {
            console.log("Added ", percentPerMeasure, "to", progress, "got", progress + percentPerMeasure);
            setProgress(progress + percentPerMeasure);
        },measure * 1000);

        if(progress >= 100){
            clearInterval(intervalId);
            return () => {}
        }

        return () => {
            clearInterval(intervalId);
        }
    })

    var visualProgress;

    if (props.growing){
        visualProgress = progress;
    }else{
        visualProgress = 100 - progress;
    }

    visualProgress = Math.min(Math.max(visualProgress, 0), 100);

    return (
        <Progress transition="1s ease" sx={{
            "& > div:first-of-type": {
              transition: `${measure}s linear`
            },
          }} width="100%" size='xs' value={visualProgress} colorScheme={props.withWarning && progress > 80 ? "red" : "vgreen"} />
    )
});