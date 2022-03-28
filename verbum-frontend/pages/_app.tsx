import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { Box, ChakraProvider, extendTheme } from '@chakra-ui/react'
import { mode } from "@chakra-ui/theme-tools";
import { AppProps } from 'next/app'
import dynamic from "next/dynamic";
import Head from 'next/head';
import { DefaultToastOptions, ToastBar, Toaster } from 'react-hot-toast';
import unusedModule from '../components/background';
import Footer from '../components/footer';
import { MotionBox, smoothIn, springTransition } from '../logic/animations';
type ClientConfettiType = typeof unusedModule;
const Background = dynamic(
  () => import('../components/background').then((mod) => mod.Background) as Promise<ClientConfettiType>,
  { ssr: false },
)
import '../styles/global.css'

const env = process.env.NODE_ENV
if (env == "production") {
  console.log = () => { }
}

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
        bg: mode("gray.300", "#171F2B")(props),
      }
    })
  },
});

var toastOptions: DefaultToastOptions = {
  error: {
    style: {
      backgroundColor: "var(--chakra-colors-red-200)",
      color: "var(--chakra-colors-blackAlpha-900)",
    },
    icon: <WarningIcon color="blackAlpha.900" />,
    position: "bottom-center"
  },
  success: {
    style: {
      backgroundColor: "var(--chakra-colors-green-200)",
      color: "var(--chakra-colors-blackAlpha-900)",
    },
    icon: <CheckIcon color="blackAlpha.900" />,
    position: "bottom-center"
  },
  loading: {
    style: {
      backgroundColor: "var(--chakra-colors-orange-200)",
      color: "var(--chakra-colors-blackAlpha-900)",
    },
    position: "bottom-center"
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Verbum.io</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <Background/>

      <Box display="flex" flexDirection="column">
        <Box flexGrow={1}>
          <Component {...pageProps} />
        </Box>
        <MotionBox initial="hidden" animate="show" variants={smoothIn(0, -10)} transition={{ ...springTransition}}>
          <Footer/>
        </MotionBox>
      </Box>

      <Toaster toastOptions={toastOptions}>
        {(t) => (
          <ToastBar
            toast={t}
            style={{marginBottom: "2em", marginTop:"-2em"}} // Overwrite styles
          />
        )}
      </Toaster>
    </ChakraProvider>
  )
}

export default MyApp