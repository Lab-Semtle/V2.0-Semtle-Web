import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { useEditor } from "novel";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface EditorBubbleItemProps {
    readonly children: ReactNode;
    readonly asChild?: boolean;
    readonly onSelect?: (editor: unknown) => void;
}

export const EditorBubbleItem = forwardRef<
    HTMLDivElement,
    EditorBubbleItemProps & Omit<ComponentPropsWithoutRef<"div">, "onSelect">
>(({ children, asChild, onSelect, ...rest }, ref) => {
    const { editor } = useEditor();
    const Comp = asChild ? Slot : "div";

    if (!editor) return null;

    return (
        <Comp
            ref={ref}
            {...rest}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(editor);
            }}
        >
            {children}
        </Comp>
    );
});

EditorBubbleItem.displayName = "EditorBubbleItem";

export default EditorBubbleItem;