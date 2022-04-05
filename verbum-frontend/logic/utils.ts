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

export function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const english_ordinal_rules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes = {
    zero: "",
    one: "st",
    two: "nd",
    few: "rd",
    many: "",
    other: "th"
};

export function ordinal(n: number) {
    const suffix = suffixes[english_ordinal_rules.select(n)]
    return (n + suffix)
}