import type { NextPage } from 'next'
import { Box, Center, Container, Button, Heading, Text } from '@chakra-ui/react'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { MotionBox, smoothIn, springTransition } from '../logic/animations';
import { LetterBox } from '../components/gameBox';

const NotFound: NextPage = () => {
    const router = useRouter();

    return (
        <Container h="100%" maxW='container.lg' marginTop="1em">
            <Head>
                <title>Verbum.io | 404 Not Found</title>
            </Head>

            <Center w='100%' h='100%' flexDirection="column" justifyContent="start">
                <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -10)} transition={{ ...springTransition}} display="flex">
                    <Button variant="unstyled" onClick={() => router.push("/")}>
                        <Text className='antialiased' userSelect="none" as='i' fontSize='3xl' fontWeight='bold' marginTop="-1.5em">Verbum</Text>
                        <Text className='antialiased' userSelect="none" as='i' fontSize='3xl' fontWeight='bold' marginTop="-1.5em" color="vgreen.500">.io</Text>
                    </Button>
                </MotionBox>

                <Center flexDir="column" flexGrow="0.6" alignItems="center" justifyContent="center">
                    <Box paddingLeft="8px" paddingRight="8px" marginBottom="1em" backgroundColor="vgreen.800" boxShadow="2xl" borderRadius="2xl">
                        <LetterBox letter='4'></LetterBox>
                        <LetterBox letter='0'></LetterBox>
                        <LetterBox letter='4'></LetterBox>
                    </Box>
                    <Heading marginBottom="3em">Page Not Found</Heading>
                    <Button onClick={() => router.push("/")} colorScheme="vgreen">Go Home</Button>
                </Center>
            </Center>
        </Container>
    );
}

export default NotFound