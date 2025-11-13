import { createImageUpload } from "novel";
import { toast } from "sonner";

export const createUploadFn = (postType?: 'activities' | 'projects' | 'resources', postId?: string | number) => {
    const onUpload = (file: File) => {
        // 한글 파일명 인코딩 문제 방지 (ISO-8859-1 에러 해결)
        const safeFilename = file?.name || "image.png";
        // 파일명을 안전한 형식으로 인코딩
        const encodedFilename = encodeURIComponent(safeFilename);
        
        // postType과 postId를 헤더에 포함
        const headers: Record<string, string> = {
            "content-type": file?.type || "application/octet-stream",
            "x-vercel-filename": encodedFilename,
        };
        
        if (postType) {
            headers["x-post-type"] = postType;
        }
        if (postId) {
            headers["x-post-id"] = String(postId);
        }
        
        const promise = fetch("/api/upload", {
            method: "POST",
            headers,
            body: file,
        });

        return new Promise((resolve, reject) => {
            toast.promise(
                promise.then(async (res) => {
                    // Successfully uploaded image
                    if (res.status === 200) {
                        const { url } = (await res.json()) as { url: string };
                        // preload the image
                        const image = new Image();
                        image.src = url;
                        image.onload = () => {
                            resolve(url);
                        };
                        // No blob store configured
                    } else if (res.status === 401) {
                        resolve(file);
                        throw new Error("`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead.");
                        // Unknown error
                    } else {
                        throw new Error("Error uploading image. Please try again.");
                    }
                }),
                {
                    loading: "Uploading image...",
                    success: "Image uploaded successfully.",
                    error: (e) => {
                        reject(e);
                        return e.message;
                    },
                },
            );
        });
    };

    return createImageUpload({
        onUpload,
        validateFn: (file) => {
            if (!file.type.includes("image/")) {
                toast.error("File type not supported.");
                return false;
            }
            if (file.size / 1024 / 1024 > 20) {
                toast.error("File size too big (max 20MB).");
                return false;
            }
            return true;
        },
    });
};

// 기본 uploadFn (하위 호환성을 위해 유지)
export const uploadFn = createUploadFn();