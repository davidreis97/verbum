import type { NextPage } from 'next'
import { Box, Center, Input, Text, Container, Button, useToast } from '@chakra-ui/react'
import { useState } from 'react';
import { inBrowser, LS_USERNAME_KEY } from '../logic/utils';
import { MatchmakeResponse } from '../logic/entities';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
    var [username, setUsername] = useState<string>(inBrowser() ? localStorage?.getItem(LS_USERNAME_KEY) ?? "" : "")
    var [loadingMatchmaking, setLoadingMatchmaking] = useState<boolean>(false);
    var toast = useToast();
    const router = useRouter();

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
            })
            return;
        }

        setLSUsername(username);

        try {
            setLoadingMatchmaking(true);

            var response = await (await window.fetch("http://localhost:8080/matchmake")).json() as MatchmakeResponse

            router.push(`/game/${response.room}`);
        } catch (_) {
            setLoadingMatchmaking(false);
        }
    }

    return (
        <Box w='100%' h='100%'>
            <Container h='100%' maxW='container.sm'>
                <Center h='100%' flexDir='column'>
                    <Box display="flex">
                        <Text className='antialiased' userSelect="none" as='i' fontSize='8xl' fontWeight='bold' marginTop="-1.5em">Verbum</Text>
                        <Text className='antialiased' userSelect="none" as='i' fontSize='8xl' fontWeight='bold' marginTop="-1.5em" color="vgreen.500">.io</Text>
                    </Box>
                    <Box display="flex" w="100%">
                        <Input onKeyDown={(e) => { if (e.key == "Enter") matchmake() }} focusBorderColor="vgreen.500" placeholder='Username' marginRight="1em" size="lg" onChange={(evt) => setUsername((_) => evt.target.value)} value={username} />
                        <Button isLoading={loadingMatchmaking} _hover={{ bg: 'vgreen.600' }} _active={{ bg: 'vgreen.600' }} backgroundColor="vgreen.500" size="lg" onClick={() => matchmake()}>PLAY</Button>
                    </Box>
                </Center>
            </Container>
        </Box>
    )
}

export default Home
