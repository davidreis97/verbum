import { Box, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

export const smoothIn = (x: number, y: number) => ({ hidden: { x, y, opacity: 0 }, show: { x: 0, y: 0, opacity: 1 } })
// DARKMODEWARN
export const successIn = () => ({ hidden: { scale: 2, color: "var(--chakra-colors-vgreen-999)", opacity: 0 }, show: { scale: 1, color: "var(--chakra-colors-whiteAlpha-900)", opacity: 1 } })

export const springTransition = {
    type: "spring",
    damping: 20,
    stiffness: 300,
};

export const MotionBox = motion(Box);
export const MotionText = motion(Text);