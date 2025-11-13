"use client";

import { useContext } from "react";
import { Check, Menu as MenuIcon, Monitor, Moon, SunDim } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { FontDefault, FontSerif, FontMono } from "./icons";
import { AppContext } from "@/app/providers";

const fonts = [
    {
        font: "Default",
        icon: <FontDefault className="h-4 w-4" />,
    },
    {
        font: "Serif",
        icon: <FontSerif className="h-4 w-4" />,
    },
    {
        font: "Mono",
        icon: <FontMono className="h-4 w-4" />,
    },
];

const appearances = [
    {
        theme: "System",
        icon: <Monitor className="h-4 w-4" />,
    },
    {
        theme: "Light",
        icon: <SunDim className="h-4 w-4" />,
    },
    {
        theme: "Dark",
        icon: <Moon className="h-4 w-4" />,
    },
];
export default function Menu() {
    const { font: currentFont, setFont } = useContext(AppContext);
    const { theme: currentTheme, setTheme } = useTheme();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MenuIcon width={16} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2" align="end">
                <div className="p-2">
                    <p className="p-2 text-xs font-medium text-muted-foreground">Font</p>
                    {fonts.map(({ font, icon }) => (
                        <Button
                            variant="ghost"
                            key={font}
                            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm"
                            onClick={() => {
                                setFont(font);
                            }}
                        >
                            <div className="flex items-center space-x-2">
                                <div className="rounded-sm border p-1">{icon}</div>
                                <span>{font}</span>
                            </div>
                            {currentFont === font && <Check className="h-4 w-4" />}
                        </Button>
                    ))}
                </div>
                <div className="border-t my-2" />
                <p className="p-2 text-xs font-medium text-muted-foreground">Appearance</p>
                {appearances.map(({ theme, icon }) => (
                    <Button
                        variant="ghost"
                        key={theme}
                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm"
                        onClick={() => {
                            setTheme(theme.toLowerCase());
                        }}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="rounded-sm border  p-1">{icon}</div>
                            <span>{theme}</span>
                        </div>
                        {currentTheme === theme.toLowerCase() && <Check className="h-4 w-4" />}
                    </Button>
                ))}
            </PopoverContent>
        </Popover>
    );
}