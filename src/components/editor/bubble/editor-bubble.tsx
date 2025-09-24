import { forwardRef, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useEditor } from "novel";

export interface EditorBubbleProps {
    readonly children: ReactNode;
    readonly className?: string;
}

export const EditorBubble = forwardRef<HTMLDivElement, EditorBubbleProps>(
    ({ children, className, ...rest }, ref) => {
        const { editor } = useEditor();
        const [isVisible, setIsVisible] = useState(false);
        const [position, setPosition] = useState({ x: 0, y: 0 });
        const [isSelecting, setIsSelecting] = useState(false);

        useEffect(() => {
            const handleMouseDown = (e: MouseEvent) => {
                // 버블 메뉴 내부 클릭은 무시하되, 팝오버가 열려있을 때는 선택 상태를 유지
                const target = e.target as HTMLElement;
                if (target.closest('[data-bubble-menu]')) {
                    // 팝오버가 열려있는지 확인
                    const popover = target.closest('[data-radix-popper-content-wrapper]');
                    if (popover) {
                        return; // 팝오버가 열려있으면 선택 상태 유지
                    }
                    return;
                }

                setIsSelecting(true);
                setIsVisible(false);
            };

            const handleMouseUp = () => {
                setIsSelecting(false);

                // 약간의 지연을 두어 선택이 완전히 끝난 후 버블 메뉴 표시
                setTimeout(() => {
                    const selection = window.getSelection();
                    if (selection && selection.toString().trim() !== '') {
                        const range = selection.getRangeAt(0);
                        const rect = range.getBoundingClientRect();
                        setPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 65
                        });
                        setIsVisible(true);
                    }
                }, 100);
            };

            const handleSelectionChange = () => {
                // 선택 중일 때는 버블 메뉴를 숨김
                if (isSelecting) {
                    setIsVisible(false);
                    return;
                }

                // 팝오버가 열려있는지 확인
                const popover = document.querySelector('[data-radix-popper-content-wrapper]');
                if (popover) {
                    return; // 팝오버가 열려있으면 버블 메뉴 상태를 변경하지 않음
                }

                const selection = window.getSelection();
                if (selection && selection.toString().trim() !== '') {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setPosition({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 65
                    });
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            };

            document.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('selectionchange', handleSelectionChange);

            return () => {
                document.removeEventListener('mousedown', handleMouseDown);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('selectionchange', handleSelectionChange);
            };
        }, [isSelecting]);

        if (!isVisible || !editor) return null;

        return (
            <div
                ref={ref}
                data-bubble-menu="true"
                className={className}
                style={{
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    ...rest
                }}
                onMouseDown={(e) => {
                    // 버블 메뉴 내부 클릭 시 이벤트 전파 방지
                    e.stopPropagation();
                }}
            >
                {children}
            </div>
        );
    },
);

EditorBubble.displayName = "EditorBubble";

export default EditorBubble;