import { Center, Text, Link } from "@chakra-ui/react";
import Image from "next/image";

const Footer = () => (
    <Center height="4em">
        <Text>
            Made in <Image title='Portugal' alt="Portugal" src="/portugal.svg" height={30 / 2} width={40 / 2} /> by&nbsp;
        </Text>
        <Link isExternal textDecorationStyle="dashed" textDecorationThickness="1px" textDecorationLine="underline" href="http://www.davidreis.me">
            David Reis
        </Link>
    </Center>
)

export default Footer