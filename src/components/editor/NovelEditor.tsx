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
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { Placeholder } from "novel";
import { ColorSelector } from "@/components/editor/selectors/color-selector";
import { LinkSelector } from "@/components/editor/selectors/link-selector";
import { MathSelector } from "@/components/editor/selectors/math-selector";
import { NodeSelector } from "@/components/editor/selectors/node-selector";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { createUploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";

import hljs from "highlight.js";

interface NovelEditorProps {
    initialContent?: JSONContent | null;
    onUpdate?: (content: JSONContent) => void;
    editable?: boolean;
    showStatus?: boolean;
    className?: string;
    placeholder?: string;
    postId?: string | number; // 게시물 ID (편집 폼에서만 사용)
    postType?: 'activities' | 'projects' | 'resources'; // 게시판 타입 (버킷 선택용)
}

const NovelEditor = ({
    initialContent: propInitialContent,
    onUpdate,
    postType,
    editable = true,
    showStatus = false,
    className,
    placeholder,
    postId,
}: NovelEditorProps) => {
    const pathname = usePathname();
    const isEditPage = pathname?.includes('/edit/') || pathname?.includes('/write');

    // 게시물별 고유 localStorage 키 생성
    const getStorageKey = useCallback((key: string) => {
        if (postId) {
            return `novel-${postId}-${key}`;
        }
        // postId가 없으면 pathname 기반으로 생성 (편집 페이지인 경우)
        if (isEditPage && pathname) {
            const pathId = pathname.split('/').pop() || 'new';
            return `novel-${pathId}-${key}`;
        }
        // 조회 페이지인 경우 일반 키 사용 (사용 안 함)
        return `novel-${key}`;
    }, [postId, isEditPage, pathname]);

    const contentKey = getStorageKey("content");
    const htmlKey = getStorageKey("html-content");
    const markdownKey = getStorageKey("markdown");

    // 빈 문서 헬퍼 함수
    const getEmptyDoc = (): JSONContent => ({ type: "doc", content: [] });

    // 초기 콘텐츠 설정: 새 게시물 작성 시 placeholder 표시를 위해 빈 문서로 시작
    const getInitialState = (): null | JSONContent => {
        // 읽기 전용 모드가 아닌 경우
        if (editable) {
            // prop이 빈 문서이거나 null인 경우 빈 문서로 시작
            if (!propInitialContent) {
                return getEmptyDoc();
            }
            if (propInitialContent.type === "doc" &&
                (!propInitialContent.content || propInitialContent.content.length === 0)) {
                return getEmptyDoc();
            }
            // prop에 내용이 있으면 null로 시작 (useEffect에서 localStorage 확인)
            return null;
        }
        // 읽기 전용 모드: prop 사용
        return propInitialContent || defaultEditorContent;
    };

    const [initialContent, setInitialContent] = useState<null | JSONContent>(getInitialState());
    const [saveStatus, setSaveStatus] = useState("저장됨");
    const [charsCount, setCharsCount] = useState<number | undefined>();
    const editorRef = useRef<EditorInstance | null>(null);
    const previousContentRef = useRef<JSONContent | null | undefined>(propInitialContent);

    const [openNode, setOpenNode] = useState(false);
    const [openColor, setOpenColor] = useState(false);
    const [openLink, setOpenLink] = useState(false);
    const [openAI, setOpenAI] = useState(false);

    // postType과 postId 기반 uploadFn 생성
    const uploadFn = useMemo(() => createUploadFn(postType, postId), [postType, postId]);

    // placeholder prop이 있으면 동적으로 Placeholder extension 생성
    const extensions = useMemo(() => {
        const baseExtensions = [...defaultExtensions, slashCommand];

        // placeholder prop이 제공되면 기본 placeholder를 대체
        if (placeholder) {
            const customPlaceholder = Placeholder.configure({
                placeholder: ({ node, editor }) => {
                    // 할일 목록 항목에서는 placeholder 표시 안 함
                    if (node.type.name === "taskItem") {
                        return "";
                    }
                    // 할일 목록 내부의 paragraph에서도 placeholder 표시 안 함
                    if (node.type.name === "paragraph") {
                        // 부모 노드가 taskItem인지 확인
                        try {
                            const { $from } = editor.state.selection;
                            const parentNode = $from.node($from.depth - 1);
                            if (parentNode && parentNode.type.name === "taskItem") {
                                return "";
                            }
                        } catch {
                            // 에러 발생 시 무시
                        }
                    }
                    if (node.type.name === "heading") {
                        return `Heading ${node.attrs.level}`;
                    }
                    return placeholder;
                },
                includeChildren: false, // 에디터 전체가 비어있을 때만 표시
                showOnlyWhenEditable: true,
                showOnlyCurrent: false,
            });

            // 기존 placeholder extension을 제거하고 새로운 것으로 대체
            const filteredExtensions = baseExtensions.filter(
                (ext) => ext.name !== 'placeholder'
            );

            return [...filteredExtensions, customPlaceholder];
        }

        return baseExtensions;
    }, [placeholder]);

    //Apply Codeblock Highlighting on the HTML from editor.getHTML()
    const highlightCodeblocks = (content: string) => {
        const doc = new DOMParser().parseFromString(content, "text/html");
        doc.querySelectorAll("pre code").forEach((el) => {
            // @ts-expect-error - highlight.js의 highlightElement는 타입 정의가 완전하지 않음
            // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
            hljs.highlightElement(el);
        });
        return new XMLSerializer().serializeToString(doc);
    };

    // localStorage 저장 함수
    const saveToLocalStorage = (editor: EditorInstance) => {
        if (!editable) return; // 읽기 전용 모드에서는 저장하지 않음

        const json = editor.getJSON();
        setCharsCount(editor.storage.characterCount.characters());

        // 게시물별로 고유한 키에 저장
        window.localStorage.setItem(htmlKey, highlightCodeblocks(editor.getHTML()));
        window.localStorage.setItem(contentKey, JSON.stringify(json));
        if (editor.storage.markdown) {
            window.localStorage.setItem(markdownKey, editor.storage.markdown.getMarkdown());
        }
        setSaveStatus("저장됨");
    };

    const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
        saveToLocalStorage(editor);

        // onUpdate 콜백 호출
        if (onUpdate) {
            onUpdate(editor.getJSON());
        }
    }, 500);

    // localStorage에서 초기 콘텐츠 로드 (편집 모드이고 editable일 때만)
    useEffect(() => {
        if (!editable) {
            // 읽기 전용 모드: prop으로 받은 initialContent만 사용
            setInitialContent(propInitialContent || defaultEditorContent);
            return;
        }

        // propInitialContent가 빈 문서인 경우 또는 null/undefined인 경우
        const isPropEmpty = !propInitialContent ||
            (propInitialContent.type === "doc" &&
                (!propInitialContent.content || propInitialContent.content.length === 0));

        if (isPropEmpty) {
            // 새 게시물 작성: localStorage 확인하지 않고 빈 문서 사용
            // 이미 빈 문서로 시작했으면 업데이트 불필요 (렌더링 지연 방지)
            if (initialContent &&
                initialContent.type === "doc" &&
                (!initialContent.content || initialContent.content.length === 0)) {
                return; // 이미 빈 문서로 설정되어 있음
            }
            setInitialContent(getEmptyDoc());
            return;
        }

        // 편집 모드: localStorage 확인 (기존 게시물 편집)
        const storedContent = window.localStorage.getItem(contentKey);

        // Twitter 노드 제거 함수
        const removeTwitterNodes = (content: JSONContent): JSONContent => {
            if (!content || !content.content) return content;

            return {
                ...content,
                content: content.content
                    .filter((node: JSONContent) => node.type !== 'twitter')
                    .map((node: JSONContent) => {
                        // 재귀적으로 자식 노드들도 체크
                        if (node.content && Array.isArray(node.content)) {
                            return {
                                ...node,
                                content: node.content
                                    .filter((child: JSONContent) => child.type !== 'twitter')
                                    .map((child: JSONContent) => removeTwitterNodes(child))
                            };
                        }
                        return node;
                    })
            };
        };

        if (storedContent) {
            try {
                const parsed = JSON.parse(storedContent);
                // Twitter 노드 제거
                const cleanedContent = removeTwitterNodes(parsed);

                // localStorage 내용이 빈 문서인지 확인 (빈 paragraph 포함)
                const isEmpty = cleanedContent.type === "doc" &&
                    (!cleanedContent.content || cleanedContent.content.length === 0 ||
                        (cleanedContent.content.length === 1 && cleanedContent.content[0].type === "paragraph" &&
                            (!cleanedContent.content[0].content || cleanedContent.content[0].content.length === 0)));

                if (isEmpty) {
                    // 빈 문서면 propInitialContent 사용 (없으면 완전히 빈 문서)
                    const cleanedProp = propInitialContent ? removeTwitterNodes(propInitialContent) : null;
                    setInitialContent(cleanedProp || getEmptyDoc());
                } else {
                    setInitialContent(cleanedContent);
                }
            } catch {
                // 파싱 실패 시 prop 사용 (없으면 빈 문서)
                const cleanedProp = propInitialContent ? removeTwitterNodes(propInitialContent) : null;
                setInitialContent(cleanedProp || getEmptyDoc());
            }
        } else {
            // localStorage에 없으면 prop 사용 (없으면 빈 문서)
            const cleanedProp = propInitialContent ? removeTwitterNodes(propInitialContent) : null;
            setInitialContent(cleanedProp || getEmptyDoc());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editable, propInitialContent, contentKey]);

    // propInitialContent가 변경될 때 에디터에 반영 (버전 선택 등 외부에서 콘텐츠 변경 시)
    useEffect(() => {
        if (!editable || !editorRef.current) return;

        // 이전 콘텐츠와 비교하여 변경되었는지 확인
        const previousContent = previousContentRef.current;
        if (previousContent === propInitialContent) return;

        // 에디터가 이미 생성되어 있고, propInitialContent가 변경된 경우
        if (propInitialContent && editorRef.current) {
            // 현재 에디터 콘텐츠와 비교하여 실제로 다른 경우에만 업데이트
            const currentContent = editorRef.current.getJSON();
            const currentContentStr = JSON.stringify(currentContent);
            const newContentStr = JSON.stringify(propInitialContent);

            if (currentContentStr !== newContentStr) {
                try {
                    // 에디터 콘텐츠 업데이트
                    editorRef.current.commands.setContent(propInitialContent);
                    // localStorage에도 즉시 반영
                    const contentKey = getStorageKey("content");
                    window.localStorage.setItem(contentKey, JSON.stringify(propInitialContent));
                    // initialContent state도 업데이트
                    setInitialContent(propInitialContent);

                    // 콘텐츠 업데이트 후 선택 상태 초기화 (bubble menu가 바로 나타나지 않도록)
                    setTimeout(() => {
                        try {
                            if (!editorRef.current) return;
                            const { selection } = editorRef.current.state;
                            if (!selection.empty) {
                                // 선택이 비어있지 않으면 커서 위치로 이동하여 선택 해제
                                editorRef.current.commands.setTextSelection(selection.from);
                            }
                        } catch (error) {
                            // 에러 발생 시 무시
                            console.debug('Editor selection reset after content update error:', error);
                        }
                    }, 0);
                } catch (error) {
                    console.error('에디터 콘텐츠 업데이트 오류:', error);
                }
            }
        }

        // 이전 콘텐츠 업데이트
        previousContentRef.current = propInitialContent;
    }, [propInitialContent, editable, getStorageKey]);

    // 페이지 이동 시 localStorage 초기화 (편집 폼에서만, 새로고침은 제외)
    useEffect(() => {
        if (!editable || !isEditPage) return; // 편집 폼에서만 작동

        const contentKey = getStorageKey("content");
        const htmlKey = getStorageKey("html-content");
        const markdownKey = getStorageKey("markdown");

        const savedFlagKey = postId ? `novel-${postId}-saved` :
            (isEditPage && pathname ? `novel-${pathname.split('/').pop() || 'new'}-saved` : null);

        // 새로고침 감지를 위한 플래그 (sessionStorage 사용 - 새로고침 시에도 유지)
        const refreshFlagKey = `novel-refresh-${contentKey}`;

        // 페이지 로드 시 새로고침 여부 확인
        // sessionStorage는 탭이 닫힐 때까지 유지되므로 새로고침 후에도 확인 가능
        const wasRefreshed = sessionStorage.getItem(refreshFlagKey) === 'true';

        if (wasRefreshed) {
            // 새로고침이었으므로 localStorage 유지하고 플래그 제거
            sessionStorage.removeItem(refreshFlagKey);
            return; // localStorage 유지하고 함수 종료
        }

        // 새로고침이 아니었고 (첫 마운트이거나 페이지 이동), 
        // 저장되지 않았다면 localStorage 초기화
        const isSaved = savedFlagKey ? window.localStorage.getItem(savedFlagKey) === 'true' : false;
        if (!isSaved) {
            // 현재 게시물의 localStorage만 초기화
            window.localStorage.removeItem(contentKey);
            window.localStorage.removeItem(htmlKey);
            window.localStorage.removeItem(markdownKey);
            if (savedFlagKey) {
                window.localStorage.removeItem(savedFlagKey);
            }
        }

        // beforeunload에서 새로고침 플래그 설정
        // 새로고침이나 페이지 닫기 시 호출됨
        const handleBeforeUnload = () => {
            // 새로고침으로 판단하여 플래그 설정 (localStorage 유지)
            sessionStorage.setItem(refreshFlagKey, 'true');
        };

        // 페이지 가시성 변경 감지 (탭 전환 등)
        const handleVisibilityChange = () => {
            // 페이지가 숨겨질 때는 플래그 유지 (새로고침일 수 있음)
            if (document.hidden) {
                sessionStorage.setItem(refreshFlagKey, 'true');
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);

            // 컴포넌트 언마운트 시 (페이지 이동으로 판단)
            // 새로고침 플래그가 없으면 페이지 이동으로 판단
            const isRefresh = sessionStorage.getItem(refreshFlagKey) === 'true';
            if (!isRefresh) {
                const isSaved = savedFlagKey ? window.localStorage.getItem(savedFlagKey) === 'true' : false;
                if (!isSaved && isEditPage) {
                    window.localStorage.removeItem(contentKey);
                    window.localStorage.removeItem(htmlKey);
                    window.localStorage.removeItem(markdownKey);
                    if (savedFlagKey) {
                        window.localStorage.removeItem(savedFlagKey);
                    }
                }
            } else {
                // 새로고침 플래그 제거 (다음 마운트를 위해)
                sessionStorage.removeItem(refreshFlagKey);
            }
        };
    }, [editable, isEditPage, getStorageKey, postId, pathname]);

    // 출판하기/임시저장 성공 시 호출할 함수 (폼에서 호출)
    // const markAsSaved = () => {
    //     // 저장 완료 처리
    // };

    // 외부에서 markAsSaved 호출할 수 있도록 expose (필요한 경우)

    if (!initialContent) return null;

    return (
        <div className={cn("relative w-full", className)}>
            <EditorRoot>
                {showStatus && (
                    <div className="flex absolute right-5 top-0 z-10 gap-2">
                        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
                        {charsCount !== undefined && (
                            <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
                                {charsCount.toLocaleString()}자
                            </div>
                        )}
                    </div>
                )}
                <EditorContent
                    initialContent={initialContent}
                    extensions={extensions}
                    editable={editable}
                    immediatelyRender={false}
                    className={cn(
                        "relative min-h-[500px] lg:min-h-[1000px] w-full no-editor-padding",
                        showStatus && "pt-8",
                        !editable && "border-none shadow-none"
                    )}
                    editorProps={{
                        handleDOMEvents: {
                            keydown: (_view, event) => handleCommandNavigation(event),
                        },
                        handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
                        handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
                        attributes: {
                            class: cn(
                                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
                                placeholder && "placeholder:text-muted-foreground"
                            ),
                        },
                    }}
                    onCreate={({ editor }) => {
                        // 에디터 인스턴스 저장 (외부에서 콘텐츠 업데이트를 위해)
                        editorRef.current = editor;

                        // 에디터 생성 시 초기 선택 상태 초기화 (bubble menu가 바로 나타나지 않도록)
                        setTimeout(() => {
                            try {
                                // 선택 영역을 제거하여 bubble menu가 나타나지 않도록 함
                                const { selection } = editor.state;
                                if (!selection.empty) {
                                    // 선택이 비어있지 않으면 커서 위치로 이동하여 선택 해제
                                    editor.commands.setTextSelection(selection.from);
                                }
                            } catch (error) {
                                // 에러 발생 시 무시
                                console.debug('Editor selection reset error:', error);
                            }
                        }, 0);

                        // 에디터 생성 시 초기 문자 수 설정
                        setTimeout(() => {
                            try {
                                let characters = 0;
                                if (editor && editor.storage && editor.storage.characterCount) {
                                    characters = editor.storage.characterCount.characters();
                                }
                                setCharsCount(characters);

                                // 초기 저장 상태 설정
                                if (editable) {
                                    setSaveStatus("저장됨");
                                }
                            } catch {
                                setCharsCount(0);
                            }
                        }, 100);
                    }}
                    onUpdate={({ editor }) => {
                        // 문자 수 업데이트 (Placeholder extension이 자동으로 클래스 관리)
                        setTimeout(() => {
                            try {
                                let characters = 0;
                                if (editor && editor.storage && editor.storage.characterCount) {
                                    characters = editor.storage.characterCount.characters();
                                }
                                setCharsCount(characters);
                            } catch (error) {
                                // 에러 발생 시 조용히 무시
                                console.debug('Editor update error:', error);
                            }
                        }, 0);

                        if (editable) {
                            debouncedUpdates(editor);
                            setSaveStatus("저장 안됨");
                        }
                    }}
                    slotAfter={<ImageResizer />}
                >
                    {editable && (
                        <>
                            <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all slash-command-scroll">
                                <EditorCommandEmpty className="px-2 text-muted-foreground">결과 없음</EditorCommandEmpty>
                                <EditorCommandList>
                                    {suggestionItems
                                        .filter((item) => item.command)
                                        .map((item) => (
                                            <EditorCommandItem
                                                value={item.title}
                                                onCommand={(val) => {
                                                    if (item.command) {
                                                        item.command(val);
                                                    }
                                                }}
                                                className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                                                key={item.title}
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                                </div>
                                            </EditorCommandItem>
                                        ))}
                                </EditorCommandList>
                            </EditorCommand>

                            <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
                                <Separator orientation="vertical" />
                                <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                                <Separator orientation="vertical" />

                                <LinkSelector open={openLink} onOpenChange={setOpenLink} />
                                <Separator orientation="vertical" />
                                <MathSelector />
                                <Separator orientation="vertical" />
                                <TextButtons />
                                <Separator orientation="vertical" />
                                <ColorSelector open={openColor} onOpenChange={setOpenColor} />
                            </GenerativeMenuSwitch>
                        </>
                    )}
                </EditorContent>
            </EditorRoot>
        </div>
    );
};

// 기존 TailwindAdvancedEditor는 호환성을 위해 유지
const TailwindAdvancedEditor = () => {
    return <NovelEditor />;
};

export default NovelEditor;
export { TailwindAdvancedEditor };