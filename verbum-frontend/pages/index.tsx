import type { NextPage } from 'next'
import { Box, Center, Input, Text, Container, Button, useToast, Heading } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { inBrowser, LS_USERNAME_KEY } from '../logic/utils';
import { Errors, MatchmakeResponse } from '../logic/entities';
import { useRouter } from 'next/router';
import { MotionBox, smoothIn, springTransition } from '../logic/animations';

const Home: NextPage = () => {
    var [username, setUsername] = useState<string>(inBrowser() ? localStorage?.getItem(LS_USERNAME_KEY) ?? "" : "")
    var [loadingMatchmaking, setLoadingMatchmaking] = useState<boolean>(false);
    var toast = useToast();
    const router = useRouter();
    const queryParams = router.query;
    var gameId = queryParams.gameId;
    const error : Errors = Errors[queryParams.error as keyof typeof Errors];

    useEffect(() => {
        if (error == Errors.NoUsername){
            toast({
                title: 'Please enter a username before joining a room.',
                status: 'info',
                duration: 5000,
                isClosable: true,
            });
        }else if(error == Errors.RoomUnavailable){
            toast({
                title: 'The game you were joining has ended, please join a new one.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
        }else if(error == Errors.UserAlreadyExists){
            toast({
                title: 'Someone else picked that username, please set a different one.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
        }
    }, [error]);

    function setLSUsername(username: string) {
        if (inBrowser()) {
            localStorage.setItem(LS_USERNAME_KEY, username);
        }
    }

    async function matchmake() {
        if (username == null || username.length == 0) {
            toast({
                title: 'Please enter a username.',
                status: 'error',
                duration: 2500,
                isClosable: true,
            });
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
            <Container h='100%' maxW='container.sm'>
                <Center h='100%' flexDir='column'>
                    <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} display="flex" marginTop="-7em" marginBottom="0.5em">
                        <Heading userSelect="none" as='i' fontSize='calc(3vw + 3vh + 2vmin);' fontWeight='bold'>Verbum</Heading>
                        <Heading userSelect="none" as='i' fontSize='calc(3vw + 3vh + 2vmin);' fontWeight='bold' color="vgreen.500">.io</Heading>
                    </MotionBox>
                    <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -50)} transition={springTransition} display="flex" w="100%">
                        <Input onKeyDown={(e) => { if (e.key == "Enter") matchmake() }} focusBorderColor="vgreen.500" placeholder='Username' marginRight="1em" size="lg" onChange={(evt) => setUsername((_) => evt.target.value)} value={username} />
                        <Button isLoading={loadingMatchmaking} _hover={{ bg: 'vgreen.600' }} _active={{ bg: 'vgreen.600' }} backgroundColor="vgreen.500" size="lg" onClick={() => matchmake()}>PLAY</Button>
                    </MotionBox>
                </Center>
            </Container>
        </Box>
    )
}

export default Home
