import { Center, Text, Link, Box } from "@chakra-ui/react";
import Image from "next/image";

const Footer = () => (
    <Center height="4em">
        <Text>Made in</Text>
        <Box margin="0.25em 0.3em 0em 0.3em"><Image title='Portugal' alt="Portugal" src="/portugal.svg" height={30 / 2} width={40 / 2} /></Box>
        <Text>by&nbsp;</Text>
        <Link isExternal textDecorationStyle="dashed" textDecorationThickness="1px" textDecorationLine="underline" href="http://www.davidreis.me">
            David Reis
        </Link>
    </Center>
)

export default Footer