import { Progress } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

export const Timer = React.memo((props: {time: number, initialTime: number, withWarning: boolean, growing: boolean}) => {    
    var [progress, setProgress] = useState<number>((100.0 * props.initialTime) / props.time);

    useEffect(() => {
        var timeout: NodeJS.Timeout;

        function IncrementProgress(){
            setProgress((_) => 100);
        }

        timeout = setTimeout(IncrementProgress, 0);

        return () => {
            if(timeout != null){
                clearTimeout(timeout);
            }
        }
    }, [])

    var visualProgress;

    if (props.growing){
        visualProgress = progress;
    }else{
        visualProgress = 100 - progress;
    }

    visualProgress = Math.min(Math.max(visualProgress, 0), 100);

    return (
        <Progress sx={{
            "& > div:first-of-type": {
              transition: `${props.time - props.initialTime}s linear`
            },
          }} width="100%" size='xs' value={visualProgress} colorScheme={props.withWarning && progress > 80 ? "red" : "vgreen"} />
    )
});