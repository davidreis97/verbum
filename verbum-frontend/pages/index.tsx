import type { NextPage } from 'next'
import { Box, Center, Input, Container, Button, Heading, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { inBrowser, LS_USERNAME_KEY } from '../logic/utils';
import { Errors, MatchmakeResponse } from '../logic/entities';
import { useRouter } from 'next/router';
import { MotionBox, smoothIn, springTransition } from '../logic/animations';
import toast from 'react-hot-toast';
import Head from 'next/head';

const MAX_USERNAME_LENGTH = 20;

const Home: NextPage = () => {
    var [username, setUsername] = useState<string>(inBrowser() ? localStorage?.getItem(LS_USERNAME_KEY) ?? "" : "")
    var [loadingMatchmaking, setLoadingMatchmaking] = useState<boolean>(false);
    const router = useRouter();
    const queryParams = router.query;
    var gameId = queryParams.gameId;
    const error : Errors = Errors[queryParams.error as keyof typeof Errors];

    useEffect(() => {
        if (error == Errors.NoUsername){
            toast.error('Please enter a username before joining a room.', {
                style: {backgroundColor: "var(--chakra-colors-vgreen-100)"}
            });
        }else if(error == Errors.RoomUnavailable){
            toast.error('The game you were joining has ended, please join a new one.', {
                style: {backgroundColor: "var(--chakra-colors-vgreen-100)"}
            });
        }else if(error == Errors.UserAlreadyExists){
            toast.error('Someone else in the room picked that username, please set a different one.', {
                style: {backgroundColor: "var(--chakra-colors-vgreen-100)"}
            });
        }
    }, [error]);

    function setLSUsername(username: string) {
        if (inBrowser()) {
            localStorage.setItem(LS_USERNAME_KEY, username);
        }
    }

    useEffect(() => {
        if(username.length > MAX_USERNAME_LENGTH){
            toast.error(`Please enter a shorter username. (Max ${MAX_USERNAME_LENGTH} characters)`);
        }
    }, [username.length > MAX_USERNAME_LENGTH])

    async function matchmake() {
        if (username == null || username.length == 0) {
            toast.error('Please enter a username.');
            return;
        }

        if (username.length > MAX_USERNAME_LENGTH){
            toast.error(`Please enter a shorter username. (Max ${MAX_USERNAME_LENGTH} characters)`);
            return;
        }

        setLSUsername(username);

        try {
            setLoadingMatchmaking(true);

            if(gameId == null || typeof(gameId) != "string" || gameId.length <= 0){
                var response = await (await window.fetch(process.env.NEXT_PUBLIC_MATCHMAKE_ENDPOINT as string)).json() as MatchmakeResponse
                gameId = response.room;
            }

            router.push(`/game/${gameId}`);
        } catch (_) {
            setLoadingMatchmaking(false);
        }
    }

    return (
        <Box w='100%' h='100%'>
            <Head>
                <title>Verbum.io | Multiplayer Word Game</title>
                <meta name="robots" content="index, follow"/>
            </Head>
            <Container h='100%' maxW='container.sm'>
                <Center h='100%' flexDir='column'>
                    <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} display="flex" marginTop="-7em" marginBottom="0.5em">
                        <Heading userSelect="none" as='i' fontSize='calc(3vw + 3vh + 2vmin);' fontWeight='bold'>Verbum</Heading>
                        <Heading userSelect="none" as='i' fontSize='calc(3vw + 3vh + 2vmin);' fontWeight='bold' color="vgreen.500">.io</Heading>
                    </MotionBox>
                    <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} display="flex" w="100%">
                        <Input isInvalid={username.length > MAX_USERNAME_LENGTH} onKeyDown={(e) => { if (e.key == "Enter") matchmake() }} focusBorderColor="vgreen.500" placeholder='Username' marginRight="1em" size="lg" onChange={(evt) => setUsername((_) => evt.target.value)} value={username} />
                        <Button isLoading={loadingMatchmaking} _hover={{ bg: 'vgreen.600' }} _active={{ bg: 'vgreen.600' }} backgroundColor="vgreen.500" size="lg" onClick={() => matchmake()}>PLAY</Button>
                    </MotionBox>
                </Center>
            </Container>
        </Box>
    )
}

export default Home
