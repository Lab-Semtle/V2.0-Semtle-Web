import { Check, ChevronDown } from "lucide-react";
import { useEditor } from "novel";
import type { EditorInstance } from "novel";
import { EditorBubbleItem } from "../bubble/editor-bubble-item";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
export interface BubbleColorMenuItem {
    name: string;
    color: string;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
    {
        name: "기본값",
        color: "#374151",
    },
    {
        name: "회색",
        color: "#9CA3AF",
    },
    {
        name: "분홍색",
        color: "#F472B6",
    },
    {
        name: "빨강색",
        color: "#F87171",
    },
    {
        name: "주황색",
        color: "#FB923C",
    },
    {
        name: "노랑색",
        color: "#FBBF24",
    },
    {
        name: "초록색",
        color: "#4ADE80",
    },
    {
        name: "파랑색",
        color: "#60A5FA",
    },
    {
        name: "보라색",
        color: "#C084FC",
    },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
    {
        name: "기본값",
        color: "#F3F4F6",
    },
    {
        name: "회색",
        color: "#E5E7EB",
    },
    {
        name: "분홍색",
        color: "#FCE7F3",
    },
    {
        name: "빨강색",
        color: "#FEE2E2",
    },
    {
        name: "주황색",
        color: "#FED7AA",
    },
    {
        name: "노랑색",
        color: "#FEF3C7",
    },
    {
        name: "초록색",
        color: "#D1FAE5",
    },
    {
        name: "파랑색",
        color: "#DBEAFE",
    },
    {
        name: "보라색",
        color: "#E9D5FF",
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
                <Button size="sm" className="gap-2 rounded-lg px-1.5 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200" variant="ghost">
                    <span
                        className="rounded-md px-1.5 py-0.5 font-medium"
                        style={{
                            color: activeColorItem?.color,
                            backgroundColor: activeHighlightItem?.color,
                        }}
                    >
                        A
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                sideOffset={8}
                className="my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded-xl border border-slate-200 p-1 shadow-2xl bg-white/95 backdrop-blur-xl"
                align="start"
            >
                <div className="flex flex-col">
                    <div className="my-1 px-2 text-sm font-semibold text-slate-700">글자색</div>
                    {TEXT_COLORS.map(({ name, color }) => (
                        <EditorBubbleItem
                            key={name}
                            onSelect={(editorInstance) => {
                                (editorInstance as EditorInstance).commands.unsetColor();
                                if (name !== "기본값") {
                                    (editorInstance as EditorInstance)
                                        .chain()
                                        .focus()
                                        .setColor(color || "")
                                        .run();
                                }
                                onOpenChange(false);
                            }}
                            className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <div className="rounded-sm border px-2 py-px font-medium" style={{ color }}>
                                    A
                                </div>
                                <span style={{ color }}>{name}</span>
                            </div>
                        </EditorBubbleItem>
                    ))}
                </div>
                <div>
                    <div className="my-1 px-2 text-sm font-semibold text-slate-700">배경색</div>
                    {HIGHLIGHT_COLORS.map(({ name, color }) => (
                        <EditorBubbleItem
                            key={name}
                            onSelect={(editorInstance) => {
                                (editorInstance as EditorInstance).commands.unsetHighlight();
                                if (name !== "기본값") {
                                    (editorInstance as EditorInstance).chain().focus().setHighlight({ color }).run();
                                }
                                onOpenChange(false);
                            }}
                            className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <div className="rounded-sm border px-2 py-px font-medium" style={{ backgroundColor: color }}>
                                    A
                                </div>
                                <span style={{ backgroundColor: color, color: "#374151", padding: "0.125rem 0.375rem", borderRadius: "0.25rem", fontSize: "0.75rem" }}>{name}</span>
                            </div>
                            {editor.isActive("highlight", { color }) && <Check className="h-4 w-4" />}
                        </EditorBubbleItem>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};