'use client';

import { useState, useRef } from 'react';
import BasePostForm from './BasePostForm';
import FileUpload from '@/components/resources/FileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { JSONContent } from 'novel';

interface ResourcePostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
    resource_type_id?: number;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    difficulty_level?: string;
    files?: Array<{
        id: string;
        name: string;
        size: number;
        type: string;
        url: string;
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
        resource_type_id?: number;
        subject?: string;
        professor?: string;
        semester?: string;
        year?: number;
        difficulty_level?: string;
        files?: Array<{
            id: string;
            name: string;
            size: number;
            type: string;
            url: string;
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
        url: string;
    }>>(initialData?.files || []);

    // refs for form fields
    const resourceTypeRef = useRef<HTMLSelectElement>(null);
    const subjectRef = useRef<HTMLInputElement>(null);
    const professorRef = useRef<HTMLInputElement>(null);
    const semesterRef = useRef<HTMLSelectElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);
    const difficultyRef = useRef<HTMLSelectElement>(null);

    const handleFilesChange = (files: Array<{
        id: string;
        name: string;
        size: number;
        type: string;
        url?: string;
        progress?: number;
        error?: string;
    }>) => {
        // 성공적으로 업로드된 파일들만 저장
        const successfulFiles = files
            .filter(file => file.url && !file.error)
            .map(file => ({
                id: file.id,
                name: file.name,
                size: file.size,
                type: file.type,
                url: file.url!
            }));

        setUploadedFiles(successfulFiles);
    };

    const handleSave = async (baseFormData: any, content: JSONContent) => {
        const resourceFormData: ResourcePostFormData = {
            ...baseFormData,
            resource_type_id: resourceTypeRef.current?.value ? parseInt(resourceTypeRef.current.value) : undefined,
            subject: subjectRef.current?.value || undefined,
            professor: professorRef.current?.value || undefined,
            semester: semesterRef.current?.value || undefined,
            year: yearRef.current?.value ? parseInt(yearRef.current.value) : undefined,
            difficulty_level: difficultyRef.current?.value || 'intermediate',
            files: uploadedFiles
        };

        console.log('ResourcePostForm 데이터:', resourceFormData);
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
            {/* 자료실 전용 필드들 */}
            <div className="mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 자료 타입과 학과 정보 */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="resource_type_id" className="block text-sm font-medium text-slate-600 mb-2">
                                    자료 타입 *
                                </label>
                                <select
                                    ref={resourceTypeRef}
                                    id="resource_type_id"
                                    name="resource_type_id"
                                    defaultValue={initialData?.resource_type_id || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    required
                                >
                                    <option value="">자료 타입을 선택하세요</option>
                                    <option value="1">문서</option>
                                    <option value="2">코드</option>
                                    <option value="3">이미지</option>
                                    <option value="4">동영상</option>
                                    <option value="5">프레젠테이션</option>
                                    <option value="6">압축파일</option>
                                    <option value="7">기타</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-600 mb-2">
                                    과목명
                                </label>
                                <input
                                    ref={subjectRef}
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    defaultValue={initialData?.subject || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    placeholder="예: 데이터베이스시스템"
                                />
                            </div>

                            <div>
                                <label htmlFor="professor" className="block text-sm font-medium text-slate-600 mb-2">
                                    교수명
                                </label>
                                <input
                                    ref={professorRef}
                                    type="text"
                                    id="professor"
                                    name="professor"
                                    defaultValue={initialData?.professor || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    placeholder="예: 홍길동 교수"
                                />
                            </div>
                        </div>

                        {/* 학기와 난이도 */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="semester" className="block text-sm font-medium text-slate-600 mb-2">
                                    학기
                                </label>
                                <select
                                    ref={semesterRef}
                                    id="semester"
                                    name="semester"
                                    defaultValue={initialData?.semester || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                >
                                    <option value="">학기를 선택하세요</option>
                                    <option value="1학기">1학기</option>
                                    <option value="2학기">2학기</option>
                                    <option value="여름학기">여름학기</option>
                                    <option value="겨울학기">겨울학기</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="year" className="block text-sm font-medium text-slate-600 mb-2">
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
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                />
                            </div>

                            <div>
                                <label htmlFor="difficulty_level" className="block text-sm font-medium text-slate-600 mb-2">
                                    난이도
                                </label>
                                <select
                                    ref={difficultyRef}
                                    id="difficulty_level"
                                    name="difficulty_level"
                                    defaultValue={initialData?.difficulty_level || 'intermediate'}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                >
                                    <option value="beginner">초급</option>
                                    <option value="intermediate">중급</option>
                                    <option value="advanced">고급</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 파일 업로드 섹션 */}
            <div className="mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">파일 업로드</h3>
                    </div>

                    <FileUpload
                        onFilesChange={handleFilesChange}
                        maxFiles={10}
                        maxSizePerFile={100}
                        acceptedTypes={['*']}
                        disabled={loading}
                        userId={user?.id}
                    />
                </div>
            </div>
        </BasePostForm>
    );
}
