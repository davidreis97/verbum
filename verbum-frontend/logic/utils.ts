export const LS_USERNAME_KEY = "username";

export const WORD_ATTEMPTS_KEY = "username";

export const inBrowser = () => typeof window !== "undefined";

export const getScreenDimensions = () => {
    if (!inBrowser()) return { width: 0, height: 0 };

    const { width: width, height: height } = window.screen;
    return {
        width,
        height
    };
}

export const getWindowDimensions = () => {
    if (!inBrowser()) return { width: 0, height: 0 };

    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}