export const uploadFn = async (file: File, editor: unknown, pos: number) => {
    // 간단한 이미지 업로드 구현
    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result as string;
        const dispatch = (editor as Record<string, unknown>).dispatch as (tr: unknown) => void;
        const state = (editor as Record<string, unknown>).state as Record<string, unknown>;
        const tr = state.tr as Record<string, unknown>;
        const insert = tr.insert as (pos: number, node: unknown) => unknown;
        const schema = (editor as Record<string, unknown>).schema as Record<string, unknown>;
        const nodes = schema.nodes as Record<string, unknown>;
        const image = nodes.image as Record<string, unknown>;
        const create = image.create as (attrs: { src: string }) => unknown;

        dispatch(insert(pos, create({ src: result })));
    };
    reader.readAsDataURL(file);
};