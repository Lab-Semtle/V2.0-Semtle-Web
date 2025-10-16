'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    progress?: number;
    error?: string;
}

interface FileUploadProps {
    onFilesChange: (files: UploadedFile[]) => void;
    maxFiles?: number;
    maxSizePerFile?: number; // MB
    acceptedTypes?: string[];
    disabled?: boolean;
    userId?: string;
}

export default function FileUpload({
    onFilesChange,
    maxFiles = 10,
    maxSizePerFile = 100, // 100MB 기본
    acceptedTypes = ['*'], // 모든 파일 타입 허용
    disabled = false,
    userId
}: FileUploadProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('doc')) return '📝';
        if (type.includes('excel') || type.includes('sheet')) return '📊';
        if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
        if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦';
        if (type.includes('video')) return '🎥';
        if (type.includes('audio')) return '🎵';
        if (type.includes('code') || type.includes('text')) return '💻';
        return '📁';
    };

    const uploadFile = async (file: File): Promise<UploadedFile> => {
        const fileId = Math.random().toString(36).substr(2, 9);
        const uploadedFile: UploadedFile = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0
        };

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId || '');

            const response = await fetch('/api/upload/resource', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('파일 업로드 실패');
            }

            const result = await response.json();
            uploadedFile.url = result.url;
            uploadedFile.progress = 100;

            return uploadedFile;
        } catch (error) {
            uploadedFile.error = error instanceof Error ? error.message : '업로드 실패';
            return uploadedFile;
        }
    };

    const handleFiles = async (fileList: FileList) => {
        if (disabled) return;

        const newFiles: File[] = Array.from(fileList);

        // 파일 개수 제한 확인
        if (files.length + newFiles.length > maxFiles) {
            alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
            return;
        }

        // 파일 크기 및 타입 검증
        for (const file of newFiles) {
            if (file.size > maxSizePerFile * 1024 * 1024) {
                alert(`파일 "${file.name}"의 크기가 ${maxSizePerFile}MB를 초과합니다.`);
                return;
            }

            if (acceptedTypes[0] !== '*' && !acceptedTypes.some(type => file.type.includes(type))) {
                alert(`지원하지 않는 파일 형식입니다: ${file.name}`);
                return;
            }
        }

        setUploading(true);

        // 파일들을 순차적으로 업로드
        const uploadedFiles: UploadedFile[] = [];
        for (const file of newFiles) {
            const uploadedFile = await uploadFile(file);
            uploadedFiles.push(uploadedFile);

            // 진행률 업데이트를 위한 상태 업데이트
            setFiles(prev => [...prev, uploadedFile]);
        }

        setUploading(false);
        onFilesChange([...files, ...uploadedFiles]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const fileList = e.dataTransfer.files;
        if (fileList.length > 0) {
            handleFiles(fileList);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setDragActive(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (fileList && fileList.length > 0) {
            handleFiles(fileList);
        }
    };

    const removeFile = (fileId: string) => {
        const updatedFiles = files.filter(file => file.id !== fileId);
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const openFileDialog = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="space-y-4">
            {/* 드래그 앤 드롭 영역 */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
            >
                <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                        ) : (
                            <Upload className="w-8 h-8 text-blue-600" />
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {uploading ? '파일 업로드 중...' : '파일을 드래그하거나 클릭하여 업로드'}
                        </h3>
                        <p className="text-sm text-slate-600">
                            최대 {maxFiles}개 파일, 각각 {maxSizePerFile}MB까지
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileInput}
                        disabled={disabled || uploading}
                        className="hidden"
                        accept={acceptedTypes[0] === '*' ? undefined : acceptedTypes.join(',')}
                    />
                </div>
            </div>

            {/* 업로드된 파일 목록 */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700">업로드된 파일 ({files.length}/{maxFiles})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* 진행률 또는 상태 표시 */}
                                    {file.progress !== undefined && file.progress < 100 && (
                                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-300"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    )}

                                    {file.error ? (
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    ) : file.url ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    )}

                                    {!uploading && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(file.id);
                                            }}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
