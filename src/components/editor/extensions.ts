import {
    AIHighlight,
    CharacterCount,
    Color,
    CustomKeymap,
    GlobalDragHandle,
    HighlightExtension,
    HorizontalRule,
    Mathematics,
    Placeholder,
    StarterKit,
    TaskItem,
    TaskList,
    TextStyle,
    TiptapImage,
    TiptapLink,
    TiptapUnderline,
    Twitter,
    UploadImagesPlugin,
    Youtube,
    CodeBlockLowlight,
} from "novel";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

import { cx } from "class-variance-authority";

//TODO I am using cx here to get tailwind autocomplete working, idk if someone else can write a regex to just capture the class key in objects
const aiHighlight = AIHighlight;
//You can overwrite the placeholder with your own configuration
const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
    HTMLAttributes: {
        class: cx(
            "text-blue-600 underline underline-offset-[3px] hover:text-blue-800 transition-colors cursor-pointer",
        ),
    },
});

const tiptapImage = TiptapImage.extend({
    addProseMirrorPlugins() {
        return [
            UploadImagesPlugin({
                imageClass: cx("opacity-40 rounded-lg"),
            }),
        ];
    },
}).configure({
    allowBase64: true,
    HTMLAttributes: {
        class: cx("rounded-lg"),
    },
});

const taskList = TaskList.configure({
    HTMLAttributes: {
        class: cx("not-prose pl-2 "),
    },
});
const taskItem = TaskItem.configure({
    HTMLAttributes: {
        class: cx("flex gap-2 items-start my-4"),
    },
    nested: true,
});

const horizontalRule = HorizontalRule.configure({
    HTMLAttributes: {
        class: cx("mt-4 mb-6 border-t border-slate-300"),
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
    codeBlock: false, // CodeBlockLowlight로 대체
    code: {
        HTMLAttributes: {
            class: cx("bg-slate-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono font-medium"),
            spellcheck: "false",
        },
    },
    // 마크다운 관련 설정들
    paragraph: {
        HTMLAttributes: {
            class: cx("leading-normal"),
        },
    },
    heading: {
        HTMLAttributes: {
            class: cx("font-bold"),
        },
        levels: [1, 2, 3, 4, 5, 6],
    },
    horizontalRule: false,
    dropcursor: {
        color: "#DBEAFE",
        width: 4,
    },
    gapcursor: false,
});

const youtube = Youtube.configure({
    HTMLAttributes: {
        class: cx("youtube-video-container"),
    },
    inline: false,
});

const twitter = Twitter.configure({
    HTMLAttributes: {
        class: cx("not-prose"),
    },
    inline: false,
});

const mathematics = Mathematics.configure({
    HTMLAttributes: {
        class: cx("math-inline"),
    },
    katexOptions: {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        strict: false,
        trust: true,
    },
});

const characterCount = CharacterCount.configure();

// CodeBlockLowlight 설정 - novel에서 제공하는 것 사용
const codeBlockLowlight = CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'javascript',
    HTMLAttributes: {
        class: "code-block-with-lines",
        style: "border: none !important; outline: none !important; box-shadow: none !important;",
    },
});

// Color 확장을 별도로 설정하여 인라인 코드에도 적용되도록 함
const colorExtension = Color.configure({
    types: ['textStyle', 'code'],
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
    twitter,
    mathematics,
    characterCount,
    TiptapUnderline,
    HighlightExtension,
    TextStyle,
    colorExtension,
    CustomKeymap,
    GlobalDragHandle,
];