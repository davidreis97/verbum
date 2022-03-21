import { useEffect, useState } from "react";
import Confetti from "react-confetti"
import { getWindowDimensions } from "../logic/utils";

export const VerbumConfetti = (props: {run: boolean}) => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [confettiKey, setConfettiKey] = useState(0);
    const [haveStarted, setHaveStarted] = useState(false);

    useEffect(() => {
        if(props.run){
            setConfettiKey(() => Math.random());
            setHaveStarted(true);
        }
    }, [props.run]);

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Confetti run={haveStarted} key={confettiKey} recycle={props.run} height={windowDimensions.height} width={windowDimensions.width}/>
    )
}

export default VerbumConfetti