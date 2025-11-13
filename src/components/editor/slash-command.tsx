import {
    CheckSquare,
    Code,
    Heading1,
    Heading2,
    Heading3,
    ImageIcon,
    List,
    ListOrdered,
    Text,
    TextQuote,
    Youtube,
} from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "novel";
import { uploadFn } from "./image-upload";

export const suggestionItems = createSuggestionItems([
    {
        title: "텍스트",
        description: "일반 텍스트로 시작합니다.",
        searchTerms: ["p", "paragraph", "텍스트", "글"],
        icon: <Text size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
        },
    },
    {
        title: "할 일 목록",
        description: "할 일을 추적하는 목록을 만듭니다.",
        searchTerms: ["todo", "task", "list", "check", "checkbox", "할일", "체크"],
        icon: <CheckSquare size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title: "제목 1",
        description: "큰 섹션 제목입니다.",
        searchTerms: ["title", "big", "large", "제목", "큰제목"],
        icon: <Heading1 size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
        },
    },
    {
        title: "제목 2",
        description: "중간 섹션 제목입니다.",
        searchTerms: ["subtitle", "medium", "제목", "중간"],
        icon: <Heading2 size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
        },
    },
    {
        title: "제목 3",
        description: "작은 섹션 제목입니다.",
        searchTerms: ["subtitle", "small", "제목", "작은"],
        icon: <Heading3 size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
        },
    },
    {
        title: "글머리 기호",
        description: "간단한 글머리 기호 목록을 만듭니다.",
        searchTerms: ["unordered", "point", "목록", "불릿"],
        icon: <List size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: "번호 매기기",
        description: "번호가 있는 목록을 만듭니다.",
        searchTerms: ["ordered", "번호", "숫자"],
        icon: <ListOrdered size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: "인용구",
        description: "인용구를 추가합니다.",
        searchTerms: ["blockquote", "인용", "따옴표"],
        icon: <TextQuote size={18} />,
        command: ({ editor, range }) =>
            editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
    },
    {
        title: "코드",
        description: "코드 스니펫을 추가합니다.",
        searchTerms: ["codeblock", "코드", "프로그램"],
        icon: <Code size={18} />,
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
        title: "이미지",
        description: "컴퓨터에서 이미지를 업로드합니다.",
        searchTerms: ["photo", "picture", "media", "사진", "이미지", "그림"],
        icon: <ImageIcon size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            // upload image
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
                if (input.files?.length) {
                    const file = input.files[0];
                    const pos = editor.view.state.selection.from;
                    uploadFn(file, editor.view, pos);
                }
            };
            input.click();
        },
    },
    {
        title: "유튜브",
        description: "유튜브 비디오를 삽입합니다.",
        searchTerms: ["video", "youtube", "embed", "비디오", "유튜브"],
        icon: <Youtube size={18} />,
        command: ({ editor, range }) => {
            const videoLink = prompt("유튜브 비디오 링크를 입력하세요");
            //From https://regexr.com/3dj5t
            const ytregex = new RegExp(
                /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
            );

            if (videoLink && ytregex.test(videoLink)) {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setYoutubeVideo({
                        src: videoLink,
                    })
                    .run();
            } else {
                if (videoLink !== null) {
                    alert("올바른 유튜브 비디오 링크를 입력해주세요");
                }
            }
        },
    },
]);

export const slashCommand = Command.configure({
    suggestion: {
        items: () => suggestionItems,
        render: renderItems,
    },
});