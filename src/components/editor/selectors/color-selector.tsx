import { Check, ChevronDown } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
export interface BubbleColorMenuItem {
    name: string;
    color: string;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
    {
        name: "기본",
        color: "var(--novel-black)",
    },
    {
        name: "보라",
        color: "#9333EA",
    },
    {
        name: "빨강",
        color: "#E00000",
    },
    {
        name: "노랑",
        color: "#EAB308",
    },
    {
        name: "파랑",
        color: "#2563EB",
    },
    {
        name: "초록",
        color: "#008A00",
    },
    {
        name: "주황",
        color: "#FFA500",
    },
    {
        name: "분홍",
        color: "#BA4081",
    },
    {
        name: "회색",
        color: "#A8A29E",
    },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
    {
        name: "기본",
        color: "hsl(var(--background))",
    },
    {
        name: "보라",
        color: "#f3e8ff",
    },
    {
        name: "빨강",
        color: "#fee2e2",
    },
    {
        name: "노랑",
        color: "#fef9c3",
    },
    {
        name: "파랑",
        color: "#dbeafe",
    },
    {
        name: "초록",
        color: "#dcfce7",
    },
    {
        name: "주황",
        color: "#fed7aa",
    },
    {
        name: "분홍",
        color: "#fce7f3",
    },
    {
        name: "회색",
        color: "#f3f4f6",
    },
];

interface ColorSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ColorSelector = ({ open, onOpenChange }: ColorSelectorProps) => {
    const { editor } = useEditor();

    if (!editor) return null;
    const activeColorItem = TEXT_COLORS.find(({ color }) => editor.isActive("textStyle", { color }));

    const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) => editor.isActive("highlight", { color }));

    return (
        <Popover modal={true} open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button size="sm" className="gap-2 rounded-none" variant="ghost">
                    <span
                        className="rounded-sm px-1"
                        style={{
                            color: activeColorItem?.color,
                            backgroundColor: activeHighlightItem?.color,
                        }}
                    >
                        A
                    </span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                sideOffset={5}
                className="my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border p-1 shadow-xl color-selector-scroll"
                align="start"
            >
                <div className="flex flex-col">
                    <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">텍스트 색상</div>
                    {TEXT_COLORS.map(({ name, color }) => (
                        <EditorBubbleItem
                            key={name}
                            onSelect={() => {
                                editor.commands.unsetColor();
                                if (name !== "기본") {
                                    editor
                                        .chain()
                                        .focus()
                                        .setColor(color || "")
                                        .run();
                                }
                                onOpenChange(false);
                            }}
                            className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
                        >
                            <div className="flex items-center gap-2">
                                <div className="rounded-sm border px-2 py-px font-medium" style={{ color }}>
                                    A
                                </div>
                                <span>{name}</span>
                            </div>
                        </EditorBubbleItem>
                    ))}
                </div>
                <div>
                    <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">배경색</div>
                    {HIGHLIGHT_COLORS.map(({ name, color }) => (
                        <EditorBubbleItem
                            key={name}
                            onSelect={() => {
                                editor.commands.unsetHighlight();
                                if (name !== "기본") {
                                    editor.chain().focus().setHighlight({ color }).run();
                                }
                                onOpenChange(false);
                            }}
                            className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
                        >
                            <div className="flex items-center gap-2">
                                <div className="rounded-sm border border-slate-300 px-2 py-px font-medium" style={{ backgroundColor: color }}>
                                    A
                                </div>
                                <span>{name}</span>
                            </div>
                            {editor.isActive("highlight", { color }) && <Check className="h-4 w-4" />}
                        </EditorBubbleItem>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};