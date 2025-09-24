export const uploadFn = async (file: File, editor: any, pos: number) => {
    // 간단한 이미지 업로드 구현
    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result as string;
        editor.dispatch(
            editor.state.tr.insert(pos, editor.schema.nodes.image.create({ src: result }))
        );
    };
    reader.readAsDataURL(file);
};