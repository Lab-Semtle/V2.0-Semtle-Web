'use client';

import { useState, useRef } from 'react';
import BasePostForm from './BasePostForm';
import { JSONContent } from 'novel';

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
    const projectStatusRef = useRef<HTMLSelectElement>(null);
    const projectGoalsRef = useRef<HTMLTextAreaElement>(null);

    const handleSave = async (baseFormData: any, content: JSONContent) => {
        const projectFormData: ProjectPostFormData = {
            ...baseFormData,
            project_type_id: projectTypeRef.current?.value ? parseInt(projectTypeRef.current.value) : undefined,
            team_size: teamSizeRef.current?.value ? parseInt(teamSizeRef.current.value) : undefined,
            deadline: deadlineRef.current?.value || undefined,
            difficulty: difficultyRef.current?.value || undefined,
            location: locationRef.current?.value || undefined,
            project_status: projectStatusRef.current?.value || 'recruiting',
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
            {/* 프로젝트 전용 필드들 */}
            <div className="mb-8">
                <div className="max-w-4xl mx-auto">
                    {/* 프로젝트 기본 정보 */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">프로젝트 기본 정보</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 프로젝트 타입과 팀 크기 */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="project_type_id" className="block text-sm font-medium text-slate-600 mb-2">
                                    프로젝트 타입 *
                                </label>
                                <select
                                    ref={projectTypeRef}
                                    id="project_type_id"
                                    name="project_type_id"
                                    defaultValue={initialData?.project_type_id || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    required
                                >
                                    <option value="">프로젝트 타입을 선택하세요</option>
                                    <option value="1">웹 개발</option>
                                    <option value="2">모바일 앱</option>
                                    <option value="3">데이터 분석</option>
                                    <option value="4">AI/ML</option>
                                    <option value="5">게임 개발</option>
                                    <option value="6">기타</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="team_size" className="block text-sm font-medium text-slate-600 mb-2">
                                    팀 크기 *
                                </label>
                                <input
                                    ref={teamSizeRef}
                                    type="number"
                                    id="team_size"
                                    name="team_size"
                                    defaultValue={initialData?.team_size || ''}
                                    min="1"
                                    max="20"
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* 마감일과 난이도 */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="deadline" className="block text-sm font-medium text-slate-600 mb-2">
                                    모집 마감일 *
                                </label>
                                <input
                                    ref={deadlineRef}
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    defaultValue={initialData?.deadline || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 cursor-pointer hover:bg-slate-50/50 transition-colors rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="difficulty" className="block text-sm font-medium text-slate-600 mb-2">
                                    난이도 *
                                </label>
                                <select
                                    ref={difficultyRef}
                                    id="difficulty"
                                    name="difficulty"
                                    defaultValue={initialData?.difficulty || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    required
                                >
                                    <option value="">난이도를 선택하세요</option>
                                    <option value="beginner">초급</option>
                                    <option value="intermediate">중급</option>
                                    <option value="advanced">고급</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 진행 방식 */}
                    <div className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">진행 방식</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-slate-600 mb-2">
                                    진행 방식 *
                                </label>
                                <select
                                    ref={locationRef}
                                    id="location"
                                    name="location"
                                    defaultValue={initialData?.location || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    required
                                >
                                    <option value="">진행 방식을 선택하세요</option>
                                    <option value="online">온라인</option>
                                    <option value="offline">오프라인</option>
                                    <option value="hybrid">하이브리드</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="project_status" className="block text-sm font-medium text-slate-600 mb-2">
                                    프로젝트 상태 *
                                </label>
                                <select
                                    ref={projectStatusRef}
                                    id="project_status"
                                    name="project_status"
                                    defaultValue={initialData?.project_status || 'recruiting'}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    required
                                >
                                    <option value="recruiting">모집 중</option>
                                    <option value="in_progress">진행 중</option>
                                    <option value="completed">완료</option>
                                    <option value="cancelled">취소</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 프로젝트 목표 */}
                    <div className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">프로젝트 목표</h3>
                        </div>
                        <textarea
                            ref={projectGoalsRef}
                            id="project_goals"
                            name="project_goals"
                            defaultValue={initialData?.project_goals || ''}
                            rows={3}
                            className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 resize-none"
                            placeholder="프로젝트의 목표와 기대 결과를 설명해주세요"
                        />
                    </div>

                    {/* 필요 기술 */}
                    <div className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">필요 기술</h3>
                        </div>
                        <input
                            type="text"
                            id="needed_skills"
                            name="needed_skills"
                            value={neededSkillsText}
                            onChange={(e) => setNeededSkillsText(e.target.value)}
                            className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                            placeholder="예: React, Node.js, Python (쉼표로 구분)"
                        />
                    </div>
                </div>
            </div>
        </BasePostForm>
    );
}
