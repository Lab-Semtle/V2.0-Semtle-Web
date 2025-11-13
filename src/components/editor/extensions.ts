import {
    AIHighlight,
    CharacterCount,
    CodeBlockLowlight,
    Color,
    CustomKeymap,
    GlobalDragHandle,
    HighlightExtension,
    HorizontalRule,
    InputRule,
    Mathematics,
    Placeholder,
    StarterKit,
    TaskItem,
    TaskList,
    TextStyle,
    TiptapImage,
    TiptapLink,
    TiptapUnderline,
    UploadImagesPlugin,
    Youtube,
} from "novel";
import { Markdown } from "tiptap-markdown";

// novel 프로젝트와 동일하게 MarkdownExtension 생성
const MarkdownExtension = Markdown.configure({
    html: false,
    transformCopiedText: true,
});

import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";

//TODO I am using cx here to get tailwind autocomplete working, idk if someone else can write a regex to just capture the class key in objects
const aiHighlight = AIHighlight;
//You can overwrite the placeholder with your own configuration
const placeholder = Placeholder.configure({
    placeholder: ({ node, editor }) => {
        // 할일 목록 항목에서는 placeholder 표시 안 함
        if (node.type.name === "taskItem") {
            return "";
        }
        // 할일 목록 내부의 paragraph에서도 placeholder 표시 안 함
        if (node.type.name === "paragraph") {
            // 부모 노드가 taskItem인지 확인
            const { $from } = editor.state.selection;
            const parentNode = $from.node($from.depth - 1);
            if (parentNode && parentNode.type.name === "taskItem") {
                return "";
            }
        }
        if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
        }
        return "Press '/' for commands";
    },
    includeChildren: false, // 에디터 전체가 비어있을 때만 표시
    showOnlyCurrent: false,
});
const tiptapLink = TiptapLink.configure({
    HTMLAttributes: {
        class: cx(
            "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
        ),
    },
});

// width, height 속성을 포함한 이미지 확장 (업로드 기능 포함)
const tiptapImage = TiptapImage.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
            },
            height: {
                default: null,
            },
        };
    },
    addProseMirrorPlugins() {
        return [
            UploadImagesPlugin({
                imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
            }),
        ];
    },
}).configure({
    allowBase64: true,
    HTMLAttributes: {
        class: cx("rounded-lg border border-muted"),
    },
});

const taskList = TaskList.configure({
    HTMLAttributes: {
        class: cx("not-prose"),
    },
});
const taskItem = TaskItem.configure({
    HTMLAttributes: {
        class: cx("flex gap-2 items-start my-4"),
    },
    nested: true,
});

const horizontalRule = HorizontalRule.extend({
    addInputRules() {
        return [
            new InputRule({
                find: /^(?:---|—-|___\s|\*\*\*\s)$/u,
                handler: ({ state, range }) => {
                    const attributes = {};

                    const { tr } = state;
                    const start = range.from;
                    const end = range.to;

                    tr.insert(start - 1, this.type.create(attributes)).delete(tr.mapping.map(start), tr.mapping.map(end));
                },
            }),
        ];
    },
}).configure({
    HTMLAttributes: {
        class: cx("mt-4 mb-6 border-t border-muted-foreground"),
    },
});

const starterKit = StarterKit.configure({
    bulletList: {
        HTMLAttributes: {
            class: cx("list-disc list-outside leading-3 -mt-2"),
        },
    },
    orderedList: {
        HTMLAttributes: {
            class: cx("list-decimal list-outside leading-3 -mt-2"),
        },
    },
    listItem: {
        HTMLAttributes: {
            class: cx("leading-normal -mb-2"),
        },
    },
    blockquote: {
        HTMLAttributes: {
            class: cx("border-l-4 border-primary"),
        },
    },
    code: {
        HTMLAttributes: {
            class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
            spellcheck: "false",
        },
    },
    codeBlock: false, // codeBlockLowlight를 사용하므로 중복 방지
    horizontalRule: false,
    dropcursor: {
        color: "#DBEAFE",
        width: 4,
    },
    gapcursor: false,
});

const codeBlockLowlight = CodeBlockLowlight.configure({
    // configure lowlight: common /  all / use highlightJS in case there is a need to specify certain language grammars only
    // common: covers 37 language grammars which should be good enough in most cases
    lowlight: createLowlight(common),
});

const youtube = Youtube.configure({
    HTMLAttributes: {
        class: cx("rounded-lg border border-muted"),
    },
    inline: false,
});

const mathematics = Mathematics.configure({
    HTMLAttributes: {
        class: cx("text-foreground rounded p-1 hover:bg-accent cursor-pointer"),
    },
    katexOptions: {
        throwOnError: false,
    },
});

const characterCount = CharacterCount.configure();

const markdownExtension = MarkdownExtension.configure({
    html: true,
    tightLists: true,
    tightListClass: "tight",
    bulletListMarker: "-",
    linkify: false,
    breaks: false,
    transformPastedText: false,
    transformCopiedText: false,
});

export const defaultExtensions = [
    starterKit,
    placeholder,
    tiptapLink,
    tiptapImage,
    taskList,
    taskItem,
    horizontalRule,
    aiHighlight,
    codeBlockLowlight,
    youtube,
    mathematics,
    characterCount,
    TiptapUnderline,
    markdownExtension,
    HighlightExtension,
    TextStyle,
    Color,
    CustomKeymap,
    GlobalDragHandle,
];