"use client";
import { defaultEditorContent } from "@/lib/content";
import {
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandItem,
    EditorCommandList,
    EditorContent,
    type EditorInstance,
    EditorRoot,
    ImageResizer,
    type JSONContent,
    handleCommandNavigation,
    handleImageDrop,
    handleImagePaste,
} from "novel";
import 'katex/dist/katex.min.css';
import { useEffect, useState, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/ColorSelector";
import { LinkSelector } from "./selectors/LinkSelector";
import { MathSelector } from "./selectors/MathSelector";
import { NodeSelector } from "./selectors/NodeSelector";

import EditorBubble from "./bubble/editor-bubble";

import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/TextButtons";
import { slashCommand, suggestionItems } from "./SlashCommand";


import hljs from "highlight.js";

const extensions = [...defaultExtensions, slashCommand];

interface NovelEditorProps {
    initialContent?: JSONContent | null;
    onUpdate?: (content: JSONContent) => void;
    placeholder?: string;
    className?: string;
    showStatus?: boolean;
    editable?: boolean;
}

const NovelEditor = ({
    initialContent: propInitialContent,
    onUpdate,
    className = "",
    showStatus = false,
    editable = true
}: NovelEditorProps) => {
    const [initialContent, setInitialContent] = useState<null | JSONContent>(defaultEditorContent);
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [charsCount, setCharsCount] = useState<number>();

    const [openNode, setOpenNode] = useState(false);
    const [openColor, setOpenColor] = useState(false);
    const [openLink, setOpenLink] = useState(false);

    // 코드블럭 복사 기능
    useEffect(() => {
        const handleCodeBlockClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const codeBlock = target.closest('pre.code-block-with-lines');

            if (codeBlock && target === codeBlock) {
                const codeElement = codeBlock.querySelector('code');
                if (codeElement) {
                    const code = codeElement.textContent || '';
                    navigator.clipboard.writeText(code).then(() => {
                        // 복사 성공 시 시각적 피드백
                        codeBlock.classList.add('copied');
                        setTimeout(() => {
                            codeBlock.classList.remove('copied');
                        }, 1200);
                    }).catch(err => {
                    });
                }
            }
        };

        // 이벤트 리스너 추가
        document.addEventListener('click', handleCodeBlockClick);

        // 클린업
        return () => {
            document.removeEventListener('click', handleCodeBlockClick);
        };
    }, []);

    // 제목에 고유 ID 추가 (읽기 전용 모드에서만)
    useEffect(() => {
        if (!editable) {
            const updateHeadingIds = () => {
                // NovelEditor 컨테이너 내의 제목들만 찾기
                const editorContainer = document.querySelector('.ProseMirror');
                if (!editorContainer) return;

                const headings = editorContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');

                headings.forEach((heading, index) => {
                    const text = heading.textContent || '';
                    const baseId = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    const id = `heading-${baseId}-${index + 1}`;
                    heading.id = id;
                });
            };

            // 초기 실행
            updateHeadingIds();

            // MutationObserver로 DOM 변경 감지 (제목 추가/삭제/이동 시)
            const observer = new MutationObserver((mutations) => {
                let shouldUpdate = false;
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        // NovelEditor 컨테이너 내의 변경사항만 감지
                        const editorContainer = document.querySelector('.ProseMirror');
                        if (!editorContainer) return;

                        // 변경된 노드가 게시물 내용 영역 내에 있는지 확인
                        const isInEditor = (node: Node): boolean => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const element = node as Element;
                                return editorContainer.contains(element) || element === editorContainer;
                            }
                            return false;
                        };

                        mutation.addedNodes.forEach((node) => {
                            if (isInEditor(node)) {
                                const element = node as Element;
                                if (element.matches('h1, h2, h3, h4, h5, h6') ||
                                    element.querySelector('h1, h2, h3, h4, h5, h6')) {
                                    shouldUpdate = true;
                                }
                            }
                        });
                        mutation.removedNodes.forEach((node) => {
                            if (isInEditor(node)) {
                                const element = node as Element;
                                if (element.matches('h1, h2, h3, h4, h5, h6') ||
                                    element.querySelector('h1, h2, h3, h4, h5, h6')) {
                                    shouldUpdate = true;
                                }
                            }
                        });
                    }
                });

                if (shouldUpdate) {
                    updateHeadingIds();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            return () => observer.disconnect();
        }
    }, [editable]);

    // 이미지 리사이징 감지 및 콘텐츠 업데이트 (편집 모드에서만)
    useEffect(() => {
        if (editable) {
            let resizeTimeout: NodeJS.Timeout;

            const handleImageResize = () => {
                // 디바운스 처리
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    // 이미지 리사이징 완료 후 에디터 콘텐츠 강제 업데이트
                    const editorElement = document.querySelector('[data-testid="editor-content"]');
                    if (editorElement) {
                        // ProseMirror 에디터 인스턴스 찾기
                        const proseMirrorElement = editorElement.querySelector('.ProseMirror');
                        if (proseMirrorElement) {
                            // ProseMirror의 내부 상태에서 JSON 추출
                            const view = (proseMirrorElement as unknown as { __vue__?: { view?: unknown } }).__vue__?.view ||
                                (proseMirrorElement as unknown as { view?: unknown }).view;

                            if (view && (view as { state?: { doc: { toJSON: () => unknown } } }).state) {
                                // ProseMirror 상태를 JSON으로 변환
                                const json = (view as { state: { doc: { toJSON: () => unknown } } }).state.doc.toJSON();
                                if (onUpdate) {
                                    onUpdate(json as JSONContent);
                                }
                            }
                        }
                    }
                }, 300);
            };

            // 이미지 리사이징 관련 이벤트 리스너 추가
            document.addEventListener('mouseup', handleImageResize);
            document.addEventListener('touchend', handleImageResize);

            return () => {
                clearTimeout(resizeTimeout);
                document.removeEventListener('mouseup', handleImageResize);
                document.removeEventListener('touchend', handleImageResize);
            };
        }
    }, [editable, onUpdate]);

    // 읽기 전용 모드에서 이미지 리사이징 비활성화
    useEffect(() => {
        if (!editable) {
            const disableImageResize = () => {
                const images = document.querySelectorAll('.ProseMirror img');
                images.forEach(img => {
                    // 이미지에 리사이징 관련 스타일 제거
                    (img as HTMLElement).style.cursor = 'default';
                    (img as HTMLElement).style.pointerEvents = 'none';

                    // 리사이징 핸들 제거
                    const resizeHandles = document.querySelectorAll('.image-resizer-handle');
                    resizeHandles.forEach(handle => {
                        (handle as HTMLElement).style.display = 'none';
                    });
                });
            };

            // 초기 실행
            disableImageResize();

            // MutationObserver로 새로운 이미지 추가 시에도 적용
            const observer = new MutationObserver(disableImageResize);
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            return () => observer.disconnect();
        }
    }, [editable]);



    //Apply Codeblock Highlighting on the HTML from editor.getHTML()
    const highlightCodeblocks = (content: string) => {
        const doc = new DOMParser().parseFromString(content, "text/html");
        doc.querySelectorAll("pre code").forEach((el) => {
            // @ts-expect-error - highlight.js 타입 정의 문제
            // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
            hljs.highlightElement(el);
        });
        return new XMLSerializer().serializeToString(doc);
    };

    const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
        const json = editor.getJSON();
        setCharsCount(editor.storage.characterCount.words());

        // 외부 onUpdate 콜백이 있으면 호출
        if (onUpdate) {
            onUpdate(json);
        }

        // 로컬 스토리지 저장 (선택적)
        if (showStatus) {
            window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
            window.localStorage.setItem("novel-content", JSON.stringify(json));

            // markdown 저장 시 에러 처리
            try {
                window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
            } catch {
            }
        }

        setSaveStatus("Saved");
    }, 500);

    useEffect(() => {
        // props로 전달된 초기 내용이 있으면 사용
        if (propInitialContent !== undefined && propInitialContent !== null) {
            setInitialContent(propInitialContent);
        } else if (showStatus) {
            // showStatus가 true일 때만 로컬 스토리지에서 가져오기
            const content = window.localStorage.getItem("novel-content");
            if (content) setInitialContent(JSON.parse(content));
            else setInitialContent(defaultEditorContent);
        } else {
            // showStatus가 false이고 propInitialContent가 null이면 기본값 사용
            setInitialContent(defaultEditorContent);
        }
    }, [propInitialContent, showStatus]);

    // 에디터 리렌더링을 위한 key (propInitialContent가 변경될 때마다 새로운 key 생성)
    const editorKey = useMemo(() => {
        // propInitialContent가 null이거나 undefined가 아닐 때만 key 생성
        if (propInitialContent && Object.keys(propInitialContent).length > 0) {
            return `editor-${JSON.stringify(propInitialContent).slice(0, 50)}`;
        }
        return 'editor-default';
    }, [propInitialContent]);

    // initialContent가 설정되지 않았으면 로딩 상태 표시
    if (initialContent === null) {
        return (
            <div className={`relative w-full max-w-4xl ${className}`}>
                <div className="min-h-[500px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative w-full max-w-4xl ${className}`}>
            {showStatus && (
                <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
                    <div className="rounded-lg bg-slate-800/90 px-2 py-1 text-sm text-slate-300">{saveStatus}</div>
                    <div className={charsCount ? "rounded-lg bg-slate-800/90 px-2 py-1 text-sm text-slate-300" : "hidden"}>
                        {charsCount} Words
                    </div>
                </div>
            )}
            <EditorRoot>
                <EditorContent
                    key={editorKey}
                    data-testid="editor-content"
                    initialContent={propInitialContent || initialContent}
                    extensions={extensions}
                    editable={editable}
                    immediatelyRender={false}
                    className={`relative min-h-[500px] w-full max-w-4xl bg-transparent sm:mb-[calc(20vh)] ${className}`}
                    editorProps={{
                        handleDOMEvents: {
                            keydown: (_view, event) => handleCommandNavigation(event),
                        },
                        handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
                        handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
                        attributes: {
                            class:
                                "prose prose-base sm:prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full text-slate-700 text-lg sm:text-xl",
                        },
                    }}
                    onUpdate={({ editor }) => {
                        debouncedUpdates(editor);
                        setSaveStatus("Unsaved");
                    }}
                    slotAfter={editable ? <ImageResizer /> : null}
                >
                    {/* 슬래시 명령어 (편집 모드에서만) */}
                    {editable && (
                        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-slate-300 bg-white/90 backdrop-blur-sm px-1 py-2 shadow-md transition-all">
                            <EditorCommandEmpty className="px-2 text-slate-500">No results</EditorCommandEmpty>
                            <EditorCommandList>
                                {suggestionItems.map((item) => (
                                    <EditorCommandItem
                                        value={item.title}
                                        onCommand={(val) => {
                                            // command가 존재하는지 확인 후 호출
                                            if (item.command) {
                                                item.command(val);
                                            }
                                        }}
                                        className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100/50 aria-selected:bg-blue-600/20 text-slate-700"
                                        key={item.title}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">{item.description}</p>
                                        </div>
                                    </EditorCommandItem>
                                ))}
                            </EditorCommandList>
                        </EditorCommand>
                    )}

                    {/* 노션 스타일 Bubble Menu - 텍스트 선택 시에만 나타남 (편집 모드에서만) */}
                    {editable && (
                        <EditorBubble
                            className="flex items-center gap-0.5 p-1 bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200"
                        >
                            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                            <div className="w-px h-6 bg-gradient-to-b from-slate-300/60 to-slate-400/60 mx-1 shadow-inner" />
                            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
                            <div className="w-px h-6 bg-gradient-to-b from-slate-300/60 to-slate-400/60 mx-1 shadow-inner" />
                            <TextButtons />
                            <MathSelector />
                            <div className="w-px h-6 bg-gradient-to-b from-slate-300/60 to-slate-400/60 mx-1 shadow-inner" />
                            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
                        </EditorBubble>
                    )}
                </EditorContent>
            </EditorRoot>
        </div>
    );
};

export default NovelEditor;