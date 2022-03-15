import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { mode } from "@chakra-ui/theme-tools";
import { AppProps } from 'next/app'
import '../styles/global.css'

const theme = extendTheme({ 
  config: { 
    initialColorMode: 'dark', 
    useSystemColorMode: false 
  },
  colors: {
    bronze: {
      50: '#fff0e1',
      100: '#f3d8bc',
      200: '#e8bf96',
      300: '#dda56f',
      400: '#d28c47',
      500: '#b9722d',
      600: '#915922',
      700: '#684017',
      800: '#402509',
      900: '#1b0b00',
    },
    vgreen: {
      50: '#ebf9f9',
      100: '#c4eded',
      200: '#9de2e2',
      300: '#76d6d6',
      400: '#4ecaca',
      500: '#35b1b1',
      600: '#298989',
      700: '#1d6262',
      800: '#123b3b',
      900: '#061414',
      999: '#278282'
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: mode("gray.300","#171F2B")(props),
      }
    })
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp