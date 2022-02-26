import type { NextPage } from 'next'
import { Box, Center, Input, Text, Container, Button } from '@chakra-ui/react'

const Home: NextPage = () => {
  return (
    <Box w='100%' h='100%'>
      <Container h='100%' maxW='container.sm'>
        <Center h='100%' flexDir='column'>
          <Text className='antialiased' userSelect="none" as='i' fontSize='8xl' fontWeight='bold' marginTop="-1.5em">VerbumIO</Text>
          <Box display="flex" w="100%">
            <Input placeholder='Username' marginRight="1em" size="lg"></Input>
            <Button colorScheme='teal' size="lg">PLAY</Button>
          </Box>
        </Center>
      </Container>
    </Box>
  )
}

export default Home
