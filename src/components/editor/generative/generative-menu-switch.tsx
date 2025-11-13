import { EditorBubble } from "novel";
import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import type { Instance, Props } from "tippy.js";

interface GenerativeMenuSwitchProps {
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
const GenerativeMenuSwitch = ({ children }: GenerativeMenuSwitchProps) => {
    const instanceRef = useRef<Instance<Props> | null>(null);

    // Popover 상태 변경 감지하여 bubble menu 위치 업데이트
    useEffect(() => {
        const updateBubbleMenuPosition = () => {
            if (instanceRef.current) {
                // 짧은 딜레이로 레이아웃 변경 완료 대기
                setTimeout(() => {
                    instanceRef.current?.popperInstance?.update();
                }, 10);
            }
        };

        // Popover 상태 변경 감지
        const observer = new MutationObserver(() => {
            const openPopovers = document.querySelectorAll('[data-radix-portal][data-state="open"]');
            if (openPopovers.length > 0) {
                updateBubbleMenuPosition();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-state'],
        });

        // ResizeObserver로 레이아웃 변경 감지 (스크롤바 사라짐/나타남 등)
        const resizeObserver = new ResizeObserver(() => {
            updateBubbleMenuPosition();
        });

        resizeObserver.observe(document.body);

        return () => {
            observer.disconnect();
            resizeObserver.disconnect();
        };
    }, []);

    // 초기 마운트 후 잠시 메뉴를 숨기기 위한 플래그
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // 컴포넌트 마운트 후 짧은 딜레이로 초기화 완료 플래그 설정
        const timer = setTimeout(() => {
            setIsInitialized(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <EditorBubble
            tippyOptions={{
                placement: "top",
                appendTo: document.body,
                onCreate: (instance) => {
                    instanceRef.current = instance;
                    // 초기 생성 시 메뉴를 숨김
                    if (!isInitialized) {
                        instance.hide();
                    }
                },
                onShow: () => {
                    // 초기화 전에는 메뉴를 표시하지 않음
                    if (!isInitialized) {
                        if (instanceRef.current) {
                            instanceRef.current.hide();
                        }
                        return;
                    }
                    // 표시될 때 위치 업데이트
                    setTimeout(() => {
                        instanceRef.current?.popperInstance?.update();
                    }, 10);
                },
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
        >
            <Fragment>
                {children}
            </Fragment>
        </EditorBubble>
    );
};

export default GenerativeMenuSwitch;