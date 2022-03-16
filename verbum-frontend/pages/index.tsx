import type { NextPage } from 'next'
import { Box, Center, Input, Text, Container, Button } from '@chakra-ui/react'
import { useState } from 'react';
import { inBrowser, LS_USERNAME_KEY } from '../logic/utils';

const Home: NextPage = () => {
  var [state, setState] = useState<string>(inBrowser() ? localStorage?.getItem(LS_USERNAME_KEY) ?? "" : "")

  function setLSUsername(username: string){
    if (inBrowser()) {
      localStorage.setItem(LS_USERNAME_KEY, username);
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
            <Input focusBorderColor="vgreen.500" placeholder='Username' marginRight="1em" size="lg" onChange={(evt) => setState((_) => evt.target.value)} value={state}/>
            <Button _hover={{ bg: 'vgreen.600' }} _active={{ bg: 'vgreen.600' }} backgroundColor="vgreen.500" size="lg" onClick={() => setLSUsername(state)}>PLAY</Button>
          </Box>
        </Center>
      </Container>
    </Box>
  )
}

export default Home
