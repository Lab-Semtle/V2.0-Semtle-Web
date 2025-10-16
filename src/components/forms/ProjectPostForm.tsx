'use client';

import { useState, useRef } from 'react';
import BasePostForm from './BasePostForm';
import { JSONContent } from 'novel';

interface BasePostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
}

interface ProjectPostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
    project_type_id?: number;
    team_size?: number;
    needed_skills?: string[];
    deadline?: string;
    difficulty?: string;
    project_status?: string;
    project_goals?: string;
    tech_stack?: string[];
    github_url?: string;
    demo_url?: string;
    location?: string;
}

interface ProjectPostFormProps {
    onSave: (formData: ProjectPostFormData, content: JSONContent) => Promise<void>;
    isEditing?: boolean;
    loading?: boolean;
    initialData?: {
        title?: string;
        description?: string;
        category?: string;
        thumbnail?: string;
        content?: JSONContent;
        status?: string;
        project_type_id?: number;
        team_size?: number;
        needed_skills?: string[];
        deadline?: string;
        difficulty?: string;
        project_status?: string;
        project_goals?: string;
        tech_stack?: string[];
        github_url?: string;
        demo_url?: string;
        location?: string;
    };
    initialContent?: JSONContent;
}

export default function ProjectPostForm({
    onSave,
    isEditing = false,
    loading = false,
    initialData,
    initialContent
}: ProjectPostFormProps) {
    const [neededSkillsText, setNeededSkillsText] = useState(
        initialData?.needed_skills?.join(', ') || ''
    );

    // 폼 필드 refs
    const projectTypeRef = useRef<HTMLSelectElement>(null);
    const teamSizeRef = useRef<HTMLInputElement>(null);
    const deadlineRef = useRef<HTMLInputElement>(null);
    const difficultyRef = useRef<HTMLSelectElement>(null);
    const locationRef = useRef<HTMLSelectElement>(null);
    const projectGoalsRef = useRef<HTMLTextAreaElement>(null);

    const handleSave = async (baseFormData: BasePostFormData, content: JSONContent) => {
        const projectFormData: ProjectPostFormData = {
            title: baseFormData.title,
            description: baseFormData.description,
            category: baseFormData.category,
            thumbnail: baseFormData.thumbnail,
            status: baseFormData.status,
            project_type_id: projectTypeRef.current?.value ? parseInt(projectTypeRef.current.value) : undefined,
            team_size: teamSizeRef.current?.value ? parseInt(teamSizeRef.current.value) : undefined,
            deadline: deadlineRef.current?.value || undefined,
            difficulty: difficultyRef.current?.value || undefined,
            location: locationRef.current?.value || undefined,
            project_status: 'recruiting', // 기본값으로 '모집 중' 설정
            project_goals: projectGoalsRef.current?.value || undefined,
            needed_skills: neededSkillsText.split(',').map(s => s.trim()).filter(s => s),
            tech_stack: [], // 추후 구현
        };

        console.log('ProjectPostForm 데이터:', projectFormData);
        await onSave(projectFormData, content);
    };

    return (
        <BasePostForm
            onSave={handleSave}
            isEditing={isEditing}
            loading={loading}
            boardType="projects"
            initialData={initialData}
            initialContent={initialContent}
        >
            {({ types }) => {
                console.log('ProjectPostForm types:', types);
                return (
                    <div className="mb-8">
                        <div className="max-w-4xl mx-auto">
                            {/* 프로젝트 목표 */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">프로젝트 목표</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                                프로젝트 목표
                                            </label>
                                            <p className="text-xs text-slate-500">프로젝트의 목표와 기대 결과를 명확히 설명해주세요</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl border border-slate-200">
                                        <textarea
                                            ref={projectGoalsRef}
                                            id="project_goals"
                                            name="project_goals"
                                            rows={4}
                                            defaultValue={initialData?.project_goals || ''}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 resize-none"
                                            placeholder="프로젝트의 목표와 기대 결과를 명확히 설명해주세요"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 프로젝트 기본 정보 */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">프로젝트 기본 정보</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 프로젝트 타입 */}
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
                                        <label htmlFor="project_type_id" className="block text-sm font-semibold text-slate-700 mb-2">
                                            프로젝트 타입 *
                                        </label>
                                        <select
                                            ref={projectTypeRef}
                                            id="project_type_id"
                                            name="project_type_id"
                                            defaultValue={initialData?.project_type_id || ''}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                                            required
                                        >
                                            <option value="">프로젝트 타입을 선택하세요</option>
                                            {types.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 팀 크기 */}
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
                                        <label htmlFor="team_size" className="block text-sm font-semibold text-slate-700 mb-2">
                                            팀 크기
                                        </label>
                                        <input
                                            ref={teamSizeRef}
                                            type="number"
                                            id="team_size"
                                            name="team_size"
                                            min="1"
                                            max="20"
                                            defaultValue={initialData?.team_size || ''}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                                            placeholder="예: 3"
                                        />
                                    </div>

                                    {/* 마감일 */}
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
                                        <label htmlFor="deadline" className="block text-sm font-semibold text-slate-700 mb-2">
                                            마감일
                                        </label>
                                        <input
                                            ref={deadlineRef}
                                            type="date"
                                            id="deadline"
                                            name="deadline"
                                            defaultValue={initialData?.deadline || ''}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                                        />
                                    </div>

                                    {/* 난이도 */}
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
                                        <label htmlFor="difficulty" className="block text-sm font-semibold text-slate-700 mb-2">
                                            난이도
                                        </label>
                                        <select
                                            ref={difficultyRef}
                                            id="difficulty"
                                            name="difficulty"
                                            defaultValue={initialData?.difficulty || ''}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                                        >
                                            <option value="">난이도를 선택하세요</option>
                                            <option value="초급">초급</option>
                                            <option value="중급">중급</option>
                                            <option value="고급">고급</option>
                                        </select>
                                    </div>

                                    {/* 위치 */}
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
                                        <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-2">
                                            위치
                                        </label>
                                        <select
                                            ref={locationRef}
                                            id="location"
                                            name="location"
                                            defaultValue={initialData?.location || ''}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                                        >
                                            <option value="">위치를 선택하세요</option>
                                            <option value="온라인">온라인</option>
                                            <option value="오프라인">오프라인</option>
                                            <option value="하이브리드">하이브리드</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 필요한 기술 */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">필요한 기술</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                                필요한 기술
                                            </label>
                                            <p className="text-xs text-slate-500">프로젝트에 필요한 기술 스택을 쉼표로 구분하여 입력해주세요</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-slate-200">
                                        <input
                                            type="text"
                                            id="needed_skills"
                                            name="needed_skills"
                                            value={neededSkillsText}
                                            onChange={(e) => setNeededSkillsText(e.target.value)}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                                            placeholder="예: React, Node.js, Python, MongoDB (쉼표로 구분)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}
        </BasePostForm>
    );
}