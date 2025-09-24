import {
    CheckSquare,
    Code,
    Heading1,
    Heading2,
    Heading3,
    ImageIcon,
    List,
    ListOrdered,
    MessageSquarePlus,
    Text,
    TextQuote,
    Twitter,
    Youtube,
} from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "novel";
import { uploadFn } from "./image-upload";

export const suggestionItems = createSuggestionItems([
    {
        title: "Send Feedback",
        description: "Let us know how we can improve.",
        icon: <MessageSquarePlus size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            window.open("/feedback", "_blank");
        },
    },
    {
        title: "Text",
        description: "Just start typing with plain text.",
        searchTerms: ["p", "paragraph"],
        icon: <Text size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
        },
    },
    {
        title: "To-do List",
        description: "Track tasks with a to-do list.",
        searchTerms: ["todo", "task", "list", "check", "checkbox"],
        icon: <CheckSquare size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title: "Heading 1",
        description: "Big section heading.",
        searchTerms: ["title", "big", "large"],
        icon: <Heading1 size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
        },
    },
    {
        title: "Heading 2",
        description: "Medium section heading.",
        searchTerms: ["subtitle", "medium"],
        icon: <Heading2 size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
        },
    },
    {
        title: "Heading 3",
        description: "Small section heading.",
        searchTerms: ["subtitle", "small"],
        icon: <Heading3 size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
        },
    },
    {
        title: "Bullet List",
        description: "Create a simple bullet list.",
        searchTerms: ["unordered", "point"],
        icon: <List size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: "Numbered List",
        description: "Create a list with numbering.",
        searchTerms: ["ordered"],
        icon: <ListOrdered size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: "Quote",
        description: "Capture a quote.",
        searchTerms: ["blockquote"],
        icon: <TextQuote size={18} />,
        command: ({ editor, range }) =>
            editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
    },
    {
        title: "Code Block",
        description: "코드 블럭을 추가합니다.",
        searchTerms: ["codeblock"],
        icon: <Code size={18} />,
        command: ({ editor, range }) => {
            const languages = [
                'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust',
                'swift', 'kotlin', 'scala', 'html', 'css', 'scss', 'sql', 'json', 'yaml', 'markdown',
                'bash', 'shell', 'docker', 'xml', 'jsx', 'tsx', 'vue', 'svelte'
            ];

            const language = prompt(`Enter programming language (${languages.join(', ')}) or press Enter for default:`);

            if (language === null) {
                return; // 사용자가 취소했을 때
            }

            const selectedLanguage = language.trim() || 'javascript';

            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setCodeBlock({ language: selectedLanguage })
                .run();
        },
    },
    {
        title: "Image",
        description: "Upload an image from your computer.",
        searchTerms: ["photo", "picture", "media"],
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
        title: "Youtube",
        description: "Embed a Youtube video.",
        searchTerms: ["video", "youtube", "embed"],
        icon: <Youtube size={18} />,
        command: ({ editor, range }) => {
            const videoLink = prompt("Please enter Youtube Video Link");
            //From https://regexr.com/3dj5t

            // null 체크 추가
            if (videoLink === null) {
                return; // 사용자가 취소했을 때
            }

            const ytregex = new RegExp(
                /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
            );

            if (ytregex.test(videoLink)) {
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
                    alert("Please enter a correct Youtube Video Link");
                }
            }
        },
    },
    {
        title: "Twitter",
        description: "Embed a Tweet.",
        searchTerms: ["twitter", "embed"],
        icon: <Twitter size={18} />,
        command: ({ editor, range }) => {
            const tweetLink = prompt("Please enter Twitter Link");

            // null 체크 추가
            if (tweetLink === null) {
                return; // 사용자가 취소했을 때
            }

            const tweetRegex = new RegExp(/^https?:\/\/(www\.)?x\.com\/([a-zA-Z0-9_]{1,15})(\/status\/(\d+))?(\/\S*)?$/);

            if (tweetRegex.test(tweetLink)) {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setTweet({
                        src: tweetLink,
                    })
                    .run();
            } else {
                if (tweetLink !== null) {
                    alert("Please enter a correct Twitter Link");
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