import { Center, Text, Link, Box, Button } from "@chakra-ui/react";
import Image from "next/image";

const Footer = () => (
    <Center flexDirection="column" height="6em">
        <Center paddingBottom="1em">
            <Button onClick={() => window.open("https://ko-fi.com/davidreis", '_blank').focus()}>
                Buy me a ☕
            </Button>
        </Center>
        <Center>
            <Text>Made in</Text>
            <Box margin="0.25em 0.3em 0em 0.3em"><Image title='Portugal' alt="Portugal" src="/portugal.svg" height={30 / 2} width={40 / 2}/></Box>
            <Text>by&nbsp;</Text>
            <Link isExternal textDecorationStyle="dashed" textDecorationThickness="1px" textDecorationLine="underline" href="http://www.davidreis.me">
                David Reis
            </Link>
        </Center>
    </Center>
)

export default Footer