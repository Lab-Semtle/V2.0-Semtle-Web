"use client";

import { type Dispatch, type ReactNode, type SetStateAction, createContext } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import useLocalStorage from "@/hooks/use-local-storage";

export const AppContext = createContext<{
    font: string;
    setFont: Dispatch<SetStateAction<string>>;
}>({
    font: "Default",
    setFont: () => { },
});

const ToasterProvider = () => {
    const { theme } = useTheme() as {
        theme: "light" | "dark" | "system";
    };
    return <Toaster theme={theme} />;
};

export default function Providers({ children }: { children: ReactNode }) {
    const [font, setFontValue] = useLocalStorage<string>("novel__font", "Default");

    const setFont: Dispatch<SetStateAction<string>> = (value) => {
        if (typeof value === "function") {
            setFontValue(value(font));
        } else {
            setFontValue(value);
        }
    };

    return (
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange defaultTheme="system">
            <AppContext.Provider
                value={{
                    font,
                    setFont,
                }}
            >
                <ToasterProvider />
                {children}
            </AppContext.Provider>
        </ThemeProvider>
    );
}

