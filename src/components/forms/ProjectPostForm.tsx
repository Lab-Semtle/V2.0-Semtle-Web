'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NovelEditor from '@/components/editor/NovelEditor';
import { JSONContent } from 'novel';
import { Plus, PanelLeftOpen, ClipboardList, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';

interface Category {
    id: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    is_active: boolean;
    sort_order: number;
}

interface Type {
    id: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    is_active: boolean;
    sort_order: number;
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

// LeftSettingsPanel 컴포넌트
function LeftSettingsPanel({
    selectedCategoryId,
    handleCategoryChange,
    loadingData,
    categories,
    types,
    projectTypeRef,
    teamSizeRef,
    deadlineRef,
    difficultyRef,
    locationRef,
    projectGoalsRef,
    neededSkillsInput,
    setNeededSkillsInput,
    handleAddNeededSkill,
    neededSkills,
    handleRemoveNeededSkill,
    initialData
}: {
    selectedCategoryId: number | null;
    handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    loadingData: boolean;
    categories: Category[];
    types: Type[];
    projectTypeRef: React.RefObject<HTMLSelectElement | null>;
    teamSizeRef: React.RefObject<HTMLInputElement | null>;
    deadlineRef: React.RefObject<HTMLInputElement | null>;
    difficultyRef: React.RefObject<HTMLSelectElement | null>;
    locationRef: React.RefObject<HTMLSelectElement | null>;
    projectGoalsRef: React.RefObject<HTMLTextAreaElement | null>;
    neededSkillsInput: string;
    setNeededSkillsInput: (value: string) => void;
    handleAddNeededSkill: () => void;
    neededSkills: string[];
    handleRemoveNeededSkill: (index: number) => void;
    initialData?: ProjectPostFormProps['initialData'];
}) {
    return (
        <div className="space-y-6">
            <section className="space-y-4">
                <div className="pb-1">
                    <div className="flex items-center gap-2.5">
                        <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-wide">기본 정보</h3>
                    </div>
                    <div className="mt-2 h-px w-full bg-slate-200"></div>
                </div>
                <div className="space-y-3">
                    <div className="space-y-2">
                        <label htmlFor="category" className="block text-xs font-medium text-slate-600 mb-1.5">카테고리 *</label>
                        <select
                            id="category"
                            name="category_id"
                            value={selectedCategoryId ?? ''}
                            onChange={handleCategoryChange}
                            className={cn(
                                "w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150",
                                selectedCategoryId ? "bg-white" : "bg-slate-50/50"
                            )}
                            required
                            disabled={loadingData}
                        >
                            <option value="">{loadingData ? '로딩 중...' : '카테고리를 선택하세요'}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="project_type_id" className="block text-xs font-medium text-slate-600 mb-1.5">프로젝트 타입 *</label>
                        <select
                            ref={projectTypeRef}
                            id="project_type_id"
                            name="project_type_id"
                            defaultValue={initialData?.project_type_id || ''}
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150"
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
                    <div>
                        <label htmlFor="team_size" className="block text-xs font-medium text-slate-600 mb-1.5">팀 크기</label>
                        <input
                            ref={teamSizeRef}
                            type="number"
                            id="team_size"
                            name="team_size"
                            min="1"
                            max="20"
                            defaultValue={initialData?.team_size || ''}
                            placeholder="예: 3"
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150"
                        />
                    </div>
                    <div>
                        <label htmlFor="deadline" className="block text-xs font-medium text-slate-600 mb-1.5">마감일</label>
                        <input
                            ref={deadlineRef}
                            type="date"
                            id="deadline"
                            name="deadline"
                            defaultValue={initialData?.deadline || ''}
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150"
                        />
                    </div>
                    <div>
                        <label htmlFor="difficulty" className="block text-xs font-medium text-slate-600 mb-1.5">난이도</label>
                        <select
                            ref={difficultyRef}
                            id="difficulty"
                            name="difficulty"
                            defaultValue={initialData?.difficulty || ''}
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150"
                        >
                            <option value="">난이도를 선택하세요</option>
                            <option value="초급">초급</option>
                            <option value="중급">중급</option>
                            <option value="고급">고급</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-xs font-medium text-slate-600 mb-1.5">위치</label>
                        <select
                            ref={locationRef}
                            id="location"
                            name="location"
                            defaultValue={initialData?.location || ''}
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150"
                        >
                            <option value="">위치를 선택하세요</option>
                            <option value="온라인">온라인</option>
                            <option value="오프라인">오프라인</option>
                            <option value="하이브리드">하이브리드</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="pb-1">
                    <div className="flex items-center gap-2.5">
                        <ClipboardList className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-wide">프로젝트 상세</h3>
                    </div>
                    <div className="mt-2 h-px w-full bg-slate-200"></div>
                </div>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="project_goals" className="block text-xs font-medium text-slate-600 mb-1.5">프로젝트 목표</label>
                        <textarea
                            ref={projectGoalsRef}
                            id="project_goals"
                            name="project_goals"
                            rows={4}
                            defaultValue={initialData?.project_goals || ''}
                            placeholder="프로젝트의 목표와 기대 결과를 명확히 설명해주세요"
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150 resize-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="needed_skills" className="block text-xs font-medium text-slate-600 mb-1.5">필요한 기술</label>
                        <div className="grid grid-cols-[1fr_auto] gap-2 mb-2 w-full">
                            <input
                                type="text"
                                id="needed_skills"
                                name="needed_skills"
                                value={neededSkillsInput}
                                onChange={(e) => setNeededSkillsInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddNeededSkill();
                                    }
                                }}
                                placeholder="기술을 입력하세요"
                                className={cn(
                                    "w-full min-w-0 text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150",
                                    neededSkillsInput.trim() ? "bg-white" : "bg-slate-50/50"
                                )}
                            />
                            <button
                                type="button"
                                onClick={handleAddNeededSkill}
                                disabled={!neededSkillsInput.trim()}
                                className={cn(
                                    "px-3 py-2 rounded-md border transition-all duration-150 flex items-center justify-center shadow-sm shrink-0",
                                    neededSkillsInput.trim() ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 cursor-pointer shadow-md hover:shadow-lg" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                )}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        {neededSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {neededSkills.map((skill: string, index: number) => (
                                    <div key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black hover:bg-slate-800 text-white rounded-md text-xs transition-colors shadow-sm">
                                        <span className="font-medium">{skill}</span>
                                        <button type="button" onClick={() => handleRemoveNeededSkill(index)} className="hover:bg-slate-700 rounded-full p-0.5 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

interface ProjectPostFormProps {
    onSave: (formData: ProjectPostFormData, content: JSONContent) => Promise<void>;
    isEditing?: boolean;
    loading?: boolean;
    postId?: string | number; // 게시물 ID (편집 시)
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
    postId,
    initialData,
    initialContent
}: ProjectPostFormProps) {
    const router = useRouter();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        thumbnail: initialData?.thumbnail || '',
        status: initialData?.status || 'draft'
    });
    // 새 게시물 작성 시에는 빈 콘텐츠로 시작 (placeholder 표시를 위해)
    const getInitialContent = (): JSONContent => {
        if (initialContent) return initialContent;
        if (initialData?.content) {
            const dataContent = initialData.content as JSONContent;
            // 빈 문서가 아닌 경우에만 반환
            if (dataContent && dataContent.type === 'doc' && dataContent.content && dataContent.content.length > 0) {
                return dataContent;
            }
        }
        // 편집 모드가 아니면 빈 문서로 시작
        if (!isEditing) {
            return { type: "doc", content: [] };
        }
        // 편집 모드에서도 콘텐츠가 없으면 빈 문서로 시작
        return { type: "doc", content: [] };
    };

    const [content, setContent] = useState<JSONContent>(getInitialContent());
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState('');

    // 카테고리와 타입 데이터
    const [categories, setCategories] = useState<Category[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        initialData?.category ? categories.find(c => c.name === initialData.category)?.id || null : null
    );

    // 프로젝트 전용 상태
    const [neededSkills, setNeededSkills] = useState<string[]>(
        initialData?.needed_skills || []
    );
    const [neededSkillsInput, setNeededSkillsInput] = useState('');

    // 필요한 기술 추가
    const handleAddNeededSkill = useCallback(() => {
        const trimmedSkill = neededSkillsInput.trim();
        if (trimmedSkill && !neededSkills.includes(trimmedSkill)) {
            setNeededSkills([...neededSkills, trimmedSkill]);
            setNeededSkillsInput('');
        }
    }, [neededSkillsInput, neededSkills]);

    // 필요한 기술 제거
    const handleRemoveNeededSkill = useCallback((index: number) => {
        setNeededSkills(neededSkills.filter((_, i) => i !== index));
    }, [neededSkills]);

    // 폼 필드 refs
    const projectTypeRef = useRef<HTMLSelectElement>(null);
    const teamSizeRef = useRef<HTMLInputElement>(null);
    const deadlineRef = useRef<HTMLInputElement>(null);
    const difficultyRef = useRef<HTMLSelectElement>(null);
    const locationRef = useRef<HTMLSelectElement>(null);
    const projectGoalsRef = useRef<HTMLTextAreaElement>(null);

    // 카테고리와 타입 로드
    const loadData = useCallback(async () => {
        try {
            setLoadingData(true);

            const categoryResponse = await fetch('/api/categories?board_type=projects');
            if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                setCategories(categoryData.categories || []);
                
                // 초기 카테고리 ID 설정
                if (initialData?.category && !selectedCategoryId) {
                    const foundCategory = categoryData.categories?.find((c: Category) => c.name === initialData.category);
                    if (foundCategory) {
                        setSelectedCategoryId(foundCategory.id);
                    }
                }
            }

            const typeResponse = await fetch('/api/types?board_type=projects');
            if (typeResponse.ok) {
                const typeData = await typeResponse.json();
                setTypes(typeData.types || []);
            }
        } catch {
            console.error('데이터 로드 오류');
        } finally {
            setLoadingData(false);
        }
    }, [initialData?.category, selectedCategoryId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = parseInt(e.target.value);
        setSelectedCategoryId(categoryId || null);
        const selectedCategory = categories.find(c => c.id === categoryId);
        setFormData(prev => ({ ...prev, category: selectedCategory?.name || '' }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 단일 이미지 업로드
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('이미지 크기는 10MB 이하여야 합니다.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        setUploadingImage(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user?.id || '');

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: {
                    'x-post-type': 'projects',
                    'x-post-id': postId ? String(postId) : '',
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, thumbnail: data.url }));
            } else {
                throw new Error('이미지 업로드에 실패했습니다.');
            }
        } catch {
            setError('이미지 업로드에 실패했습니다.');
        } finally {
            setUploadingImage(false);
        }
    };

    const removeThumbnail = () => {
        setFormData(prev => ({
            ...prev,
            thumbnail: ''
        }));
    };

    // 저장 처리
    const handleSave = async (isDraft = false) => {
        if (!isDraft) {
            const validationErrors = [];

            if (!formData.title.trim()) {
                validationErrors.push('제목을 입력해주세요.');
            }

            if (!formData.description.trim()) {
                validationErrors.push('설명을 입력해주세요.');
            }

            if (!selectedCategoryId) {
                validationErrors.push('카테고리를 선택해주세요.');
            }

            if (validationErrors.length > 0) {
                alert(validationErrors[0]);
                return;
            }
        }

        setIsSaving(true);

        try {
            const projectFormData: ProjectPostFormData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                thumbnail: formData.thumbnail,
                status: isDraft ? (isEditing ? formData.status : 'draft') : 'published',
                project_type_id: projectTypeRef.current?.value ? parseInt(projectTypeRef.current.value) : undefined,
                team_size: teamSizeRef.current?.value ? parseInt(teamSizeRef.current.value) : undefined,
                deadline: deadlineRef.current?.value || undefined,
                difficulty: difficultyRef.current?.value || undefined,
                location: locationRef.current?.value || undefined,
                project_status: 'recruiting',
                project_goals: projectGoalsRef.current?.value || undefined,
                needed_skills: neededSkills.filter(skill => skill.trim()),
                tech_stack: [],
            };

            await onSave(projectFormData, content);
            
            // 저장 성공 시 localStorage에 플래그 설정 (이전 내용 유지)
            if (postId) {
                window.localStorage.setItem(`novel-${postId}-saved`, 'true');
            }
        } catch (err) {
            console.error('저장 오류:', err);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getTitle = () => {
        if (isEditing) return '게시물 수정하기';
        return '새 프로젝트 등록하기';
    };

    return (
        <>
            {/* 메인 콘텐츠: 2열 레이아웃 */}
            <main className="relative flex-1 bg-white overflow-x-hidden min-w-0">
                {/* 고정된 배경 애니메이션 - 메인 콘텐츠 영역에만 적용 */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-white/20 to-blue-50/20"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
                </div>

                {/* 상단 헤더 여백 (편집 폼의 상단 고정 헤더가 네비게이션 바를 대체) */}
                <div className="h-14 sm:h-16 md:h-20"></div>

                <div className="relative z-10 p-4 md:p-6 pt-4 md:pt-6" style={{ marginTop: '0' }}>
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
                        {/* 모바일: Sheet 트리거 (헤더 위로 이동) */}
                        <div className="lg:hidden flex justify-start lg:col-span-12 mt-0 md:mt-1">
                            <Sheet>
                                <SheetTrigger className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-md bg-blue-600 text-white text-xs md:text-sm font-medium shadow-sm">
                                    <PanelLeftOpen className="w-3.5 h-3.5 md:w-4 md:h-4" /> 게시물 상세 설정 열기
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[88vw] xs:w-[84vw] sm:w-[420px] overflow-y-auto p-3 sm:p-4 [&_button[data-radix-dialog-close]]:bg-blue-600 [&_button[data-radix-dialog-close]]:hover:bg-blue-700 [&_button[data-radix-dialog-close]]:text-white [&_button[data-radix-dialog-close]]:rounded-md [&_button[data-radix-dialog-close]]:p-2 [&_button[data-radix-dialog-close]]:h-8 [&_button[data-radix-dialog-close]]:w-8 [&_button[data-radix-dialog-close]]:grid [&_button[data-radix-dialog-close]]:place-items-center [&_button[data-radix-dialog-close]]:top-2 sm:[&_button[data-radix-dialog-close]]:top-3 [&_button[data-radix-dialog-close]]:right-2 sm:[&_button[data-radix-dialog-close]]:right-3 [&_button[data-radix-dialog-close]>svg]:w-4 [&_button[data-radix-dialog-close]>svg]:h-4">
                                    <SheetHeader className="p-0">
                                        <div className="flex items-center justify-between">
                                            <SheetTitle className="text-base sm:text-lg font-extrabold text-slate-900">게시물 설정</SheetTitle>
                                        </div>
                                        <SheetDescription className="sr-only">
                                            게시물의 카테고리와 프로젝트 기본 정보를 변경할 수 있습니다.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-4">
                                        <LeftSettingsPanel
                                            selectedCategoryId={selectedCategoryId}
                                            handleCategoryChange={handleCategoryChange}
                                            loadingData={loadingData}
                                            categories={categories}
                                            types={types}
                                            projectTypeRef={projectTypeRef}
                                            teamSizeRef={teamSizeRef}
                                            deadlineRef={deadlineRef}
                                            difficultyRef={difficultyRef}
                                            locationRef={locationRef}
                                            projectGoalsRef={projectGoalsRef}
                                            neededSkillsInput={neededSkillsInput}
                                            setNeededSkillsInput={setNeededSkillsInput}
                                            handleAddNeededSkill={handleAddNeededSkill}
                                            neededSkills={neededSkills}
                                            handleRemoveNeededSkill={handleRemoveNeededSkill}
                                            initialData={initialData}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                        {/* 상단 고정 헤더 (네비게이션 바를 대체) */}
                        <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm lg:col-span-12">
                            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
                                <div className="flex flex-row items-center justify-between gap-1 sm:gap-4">
                                    {/* 왼쪽 영역: 뒤로가기 */}
                                    <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
                                        <button
                                            onClick={() => router.back()}
                                            className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-2 sm:py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 flex-shrink-0"
                                        >
                                            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <div className="h-4 sm:h-6 w-px bg-slate-300 flex-shrink-0 hidden sm:block"></div>

                                        {!isEditing && (
                                            <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">새 프로젝트 작성</span>
                                        )}
                                    </div>

                                    {/* 오른쪽: 저장 버튼들 */}
                                    <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
                                        {/* 새 게시물 작성 모드일 때 */}
                                        {!isEditing && (
                                            <>
                                                <button
                                                    onClick={() => router.back()}
                                                    className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={() => handleSave(true)}
                                                    disabled={isSaving || loading}
                                                    className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-1"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 border-2 border-slate-400/30 border-t-slate-600"></div>
                                                            <span className="hidden sm:inline">저장 중...</span>
                                                            <span className="sm:hidden text-xs">중</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs sm:text-sm">임시저장</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleSave(false)}
                                                    disabled={isSaving || loading}
                                                    className="flex items-center gap-1 sm:gap-1 px-2.5 sm:px-4 py-2 sm:py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 border-2 border-white/30 border-t-white"></div>
                                                            <span className="hidden sm:inline">출판 중...</span>
                                                            <span className="sm:hidden text-xs">중</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-xs sm:text-sm">출판하기</span>
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* 데스크톱: 좌측 속성/설정 컬럼 */}
                        <aside className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-20 space-y-4">
                                <LeftSettingsPanel
                                    selectedCategoryId={selectedCategoryId}
                                    handleCategoryChange={handleCategoryChange}
                                    loadingData={loadingData}
                                    categories={categories}
                                    types={types}
                                    projectTypeRef={projectTypeRef}
                                    teamSizeRef={teamSizeRef}
                                    deadlineRef={deadlineRef}
                                    difficultyRef={difficultyRef}
                                    locationRef={locationRef}
                                    projectGoalsRef={projectGoalsRef}
                                    neededSkillsInput={neededSkillsInput}
                                    setNeededSkillsInput={setNeededSkillsInput}
                                    handleAddNeededSkill={handleAddNeededSkill}
                                    neededSkills={neededSkills}
                                    handleRemoveNeededSkill={handleRemoveNeededSkill}
                                    initialData={initialData}
                                />
                            </div>
                        </aside>

                        {/* 중앙: 본문 편집 컬럼 */}
                        <section className="lg:col-span-9">
                            {/* 기본 정보 - 제목/설명 */}
                            <div className="mb-8">
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-6">
                                        <input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} className="w-full text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl font-bold bg-transparent border-none outline-none text-slate-900 placeholder-gray-400 resize-none" placeholder="제목을 입력하세요" required />
                                    </div>
                                    <div className="mb-4">
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            onInput={(e) => {
                                                const el = e.currentTarget;
                                                el.style.height = 'auto';
                                                el.style.height = `${el.scrollHeight}px`;
                                            }}
                                            rows={1}
                                            className="w-full text-lg sm:text-xl bg-transparent border-none outline-none text-slate-700 placeholder-gray-500 resize-none overflow-hidden min-h-[1.5rem]"
                                            placeholder="게시물에 대한 간단한 설명을 입력하세요"
                                            required
                                        />
                                    </div>
                                    {/* 구분선 */}
                                    <div className="border-t border-slate-200 mb-2"></div>
                                </div>
                            </div>

                            {/* 썸네일 업로드 */}
                            {formData.thumbnail ? (
                                <div className="mb-8">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="relative w-full h-[394px] rounded-xl overflow-hidden">
                                            <Image
                                                src={formData.thumbnail}
                                                alt="썸네일"
                                                fill
                                                className="object-cover"
                                            />
                                            {/* 우측 하단 버튼들 */}
                                            <div className="absolute bottom-4 right-4 flex gap-2">
                                                {/* 이미지 변경 버튼 */}
                                                <label className={`flex items-center justify-center w-12 h-12 ${uploadingImage ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600/90 hover:bg-blue-600 cursor-pointer'} text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 backdrop-blur-sm`}>
                                                    {uploadingImage ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={uploadingImage}
                                                        className="hidden"
                                                    />
                                                </label>

                                                {/* 이미지 삭제 버튼 */}
                                                <button
                                                    onClick={removeThumbnail}
                                                    className="w-12 h-12 bg-red-500/90 hover:bg-red-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/30 backdrop-blur-sm flex items-center justify-center"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        {/* 구분선 */}
                                        <div className="border-t border-slate-200 mt-6 mb-2"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8">
                                    <div className="max-w-4xl mx-auto">
                                        <label className="w-full h-[394px] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors duration-200 cursor-pointer">
                                            <div className="text-center">
                                                {uploadingImage ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                        <div className="text-slate-500 text-sm">이미지 업로드 중...</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        <div className="text-slate-500 text-sm">클릭하여 이미지 업로드</div>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                className="hidden"
                                            />
                                        </label>
                                        {/* 구분선 */}
                                        <div className="border-t border-slate-200 mt-6 mb-2"></div>
                                    </div>
                                </div>
                            )}

                            {/* 본문 에디터 */}
                            <div className="mb-8 lg:mb-0">
                                <div className="max-w-4xl mx-auto">
                                    <div className="rounded-lg p-0">
                                        <NovelEditor
                                            initialContent={content}
                                            onUpdate={setContent}
                                            placeholder={!isEditing ? "게시물에 대한 상세한 내용을 작성해주세요. 명령어 사용 시에는 '/' 를 누르세요..." : undefined}
                                            className="text-lg sm:text-xl"
                                            showStatus={true}
                                            editable={true}
                                            postId={postId}
                                            postType="projects"
                                        />
                                    </div>
                                    {/* 구분선 */}
                                    <div className="border-t border-slate-200 mt-2 mb-2"></div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
