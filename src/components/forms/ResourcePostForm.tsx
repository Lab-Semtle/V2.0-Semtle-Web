'use client';

import { useState, useRef } from 'react';
import BasePostForm from './BasePostForm';
import FileUpload from '@/components/resources/FileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { JSONContent } from 'novel';

interface BasePostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
}

interface ResourcePostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    files?: Array<{
        id: string;
        name: string;
        size: number;
        type: string;
        url?: string;
        file_path?: string;
    }>;
}

interface ResourcePostFormProps {
    onSave: (formData: ResourcePostFormData, content: JSONContent) => Promise<void>;
    isEditing?: boolean;
    loading?: boolean;
    initialData?: {
        title?: string;
        description?: string;
        category?: string;
        thumbnail?: string;
        content?: JSONContent;
        status?: string;
        subject?: string;
        professor?: string;
        semester?: string;
        year?: number;
        files?: Array<{
            id: string;
            name: string;
            size: number;
            type: string;
            url?: string;
            file_path?: string;
        }>;
    };
    initialContent?: JSONContent;
}

export default function ResourcePostForm({
    onSave,
    isEditing = false,
    loading = false,
    initialData,
    initialContent
}: ResourcePostFormProps) {
    const { user } = useAuth();
    const [uploadedFiles, setUploadedFiles] = useState<Array<{
        id: string;
        name: string;
        size: number;
        type: string;
        url?: string;
        file_path?: string;
    }>>(initialData?.files || []);

    // refs for form fields
    const subjectRef = useRef<HTMLInputElement>(null);
    const professorRef = useRef<HTMLInputElement>(null);
    const semesterRef = useRef<HTMLSelectElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    const handleFilesChange = (files: Array<{
        id: string;
        name: string;
        size: number;
        type: string;
        url?: string;
        file_path?: string;
        progress?: number;
        error?: string;
    }>) => {
        // 성공적으로 업로드된 파일들만 저장
        const successfulFiles = files
            .filter(file => (file.url || file.file_path) && !file.error)
            .map(file => ({
                id: file.id,
                name: file.name,
                size: file.size,
                type: file.type,
                url: file.url,
                file_path: file.file_path
            }));

        setUploadedFiles(successfulFiles);
    };

    const handleSave = async (baseFormData: BasePostFormData, content: JSONContent) => {
        const resourceFormData: ResourcePostFormData = {
            title: baseFormData.title,
            description: baseFormData.description,
            category: baseFormData.category,
            thumbnail: baseFormData.thumbnail,
            status: baseFormData.status,
            subject: subjectRef.current?.value || undefined,
            professor: professorRef.current?.value || undefined,
            semester: semesterRef.current?.value || undefined,
            year: yearRef.current?.value ? parseInt(yearRef.current.value) : undefined,
            files: uploadedFiles
        };

        await onSave(resourceFormData, content);
    };

    return (
        <BasePostForm
            onSave={handleSave}
            isEditing={isEditing}
            loading={loading}
            boardType="resources"
            initialData={initialData}
            initialContent={initialContent}
        >
            {() => (
                <>
                    {/* 자료실 전용 필드들 */}
                    <div className="mb-8">
                        <div className="max-w-4xl mx-auto">
                            {/* 자료실 기본 정보 */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">자료실 기본 정보</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                                기본 정보
                                            </label>
                                            <p className="text-xs text-slate-500">자료의 과목, 교수, 학기, 연도 정보를 입력하세요</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* 과목명 */}
                                        <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl border border-slate-200">
                                            <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                                                과목명
                                            </label>
                                            <input
                                                ref={subjectRef}
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                defaultValue={initialData?.subject || ''}
                                                placeholder="예: 데이터베이스시스템"
                                                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                                            />
                                        </div>

                                        {/* 교수명 */}
                                        <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl border border-slate-200">
                                            <label htmlFor="professor" className="block text-sm font-semibold text-slate-700 mb-2">
                                                교수명
                                            </label>
                                            <input
                                                ref={professorRef}
                                                type="text"
                                                id="professor"
                                                name="professor"
                                                defaultValue={initialData?.professor || ''}
                                                placeholder="예: 홍길동 교수"
                                                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                                            />
                                        </div>

                                        {/* 학기 */}
                                        <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl border border-slate-200">
                                            <label htmlFor="semester" className="block text-sm font-semibold text-slate-700 mb-2">
                                                학기
                                            </label>
                                            <select
                                                ref={semesterRef}
                                                id="semester"
                                                name="semester"
                                                defaultValue={initialData?.semester || ''}
                                                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                                            >
                                                <option value="">학기를 선택하세요</option>
                                                <option value="1학기">1학기</option>
                                                <option value="2학기">2학기</option>
                                                <option value="여름학기">여름학기</option>
                                                <option value="겨울학기">겨울학기</option>
                                            </select>
                                        </div>

                                        {/* 연도 */}
                                        <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl border border-slate-200">
                                            <label htmlFor="year" className="block text-sm font-semibold text-slate-700 mb-2">
                                                연도
                                            </label>
                                            <input
                                                ref={yearRef}
                                                type="number"
                                                id="year"
                                                name="year"
                                                defaultValue={initialData?.year || new Date().getFullYear()}
                                                min="2020"
                                                max={new Date().getFullYear() + 1}
                                                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 파일 업로드 섹션 */}
                    <div className="mb-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">파일 업로드</h3>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                <FileUpload
                                    onFilesChange={handleFilesChange}
                                    maxFiles={10}
                                    maxSizePerFile={100}
                                    acceptedTypes={['*']}
                                    disabled={loading}
                                    userId={user?.id}
                                    initialFiles={initialData?.files || []}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </BasePostForm>
    );
}
