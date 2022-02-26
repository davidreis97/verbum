import { ChakraProvider, extendTheme } from '@chakra-ui/react'
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