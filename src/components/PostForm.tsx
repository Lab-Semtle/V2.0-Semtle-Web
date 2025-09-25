'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NovelEditor from '@/components/editor/NovelEditor';
import { defaultEditorContent } from '@/lib/content';

interface PostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
    // 활동 전용 필드들
    activity_type_id?: number;
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    participation_fee?: number;
    contact_info?: string;
    has_voting?: boolean;
    // 프로젝트 전용 필드들
    project_type_id?: number;
    team_size?: number;
    needed_skills?: string[];
    deadline?: string;
    difficulty?: string;
    project_goals?: string;
    tech_stack?: string[];
    github_url?: string;
    demo_url?: string;
    // 자료실 전용 필드들
    resource_type_id?: number;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    difficulty_level?: string;
    file_extension?: string;
    original_filename?: string;
    downloads_count?: number;
    rating?: number;
    rating_count?: number;
}

interface PostFormProps {
    onSave: (formData: PostFormData, content: unknown) => Promise<void>;
    isEditing?: boolean;
    loading?: boolean;
    boardType?: 'projects' | 'activities' | 'resources';
    initialData?: {
        title?: string;
        description?: string;
        category?: string;
        thumbnail?: string;
        content?: unknown;
        status?: string;
        // 활동 전용 필드들
        activity_type_id?: number;
        location?: string;
        start_date?: string;
        end_date?: string;
        max_participants?: number;
        participation_fee?: number;
        contact_info?: string;
        has_voting?: boolean;
        // 프로젝트 전용 필드들
        project_type_id?: number;
        team_size?: number;
        needed_skills?: string[];
        deadline?: string;
        difficulty?: string;
        project_goals?: string;
        tech_stack?: string[];
        github_url?: string;
        demo_url?: string;
        // 자료실 전용 필드들
        resource_type_id?: number;
        subject?: string;
        professor?: string;
        semester?: string;
        year?: number;
        difficulty_level?: string;
        file_extension?: string;
        original_filename?: string;
        downloads_count?: number;
        rating?: number;
        rating_count?: number;
    };
    initialContent?: unknown;
}

export default function PostForm({ onSave, isEditing = false, loading = false, boardType = 'projects', initialData, initialContent }: PostFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<PostFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        thumbnail: initialData?.thumbnail || '',
        status: initialData?.status || 'draft',
        // 활동 전용 필드들
        activity_type_id: initialData?.activity_type_id || undefined,
        location: initialData?.location || '',
        start_date: initialData?.start_date || '',
        end_date: initialData?.end_date || '',
        max_participants: initialData?.max_participants || undefined,
        participation_fee: initialData?.participation_fee || 0,
        contact_info: initialData?.contact_info || '',
        has_voting: initialData?.has_voting || false,
        // 프로젝트 전용 필드들
        project_type_id: initialData?.project_type_id || undefined,
        team_size: initialData?.team_size || 1,
        needed_skills: initialData?.needed_skills || [],
        deadline: initialData?.deadline || '',
        difficulty: initialData?.difficulty || '',
        project_goals: initialData?.project_goals || '',
        tech_stack: initialData?.tech_stack || [],
        github_url: initialData?.github_url || '',
        demo_url: initialData?.demo_url || '',
        // 자료실 전용 필드들
        resource_type_id: initialData?.resource_type_id || undefined,
        subject: initialData?.subject || '',
        professor: initialData?.professor || '',
        semester: initialData?.semester || '',
        year: initialData?.year || new Date().getFullYear(),
        difficulty_level: initialData?.difficulty_level || 'intermediate',
        file_extension: initialData?.file_extension || '',
        original_filename: initialData?.original_filename || '',
        downloads_count: initialData?.downloads_count || 0,
        rating: initialData?.rating || 0,
        rating_count: initialData?.rating_count || 0
    });
    const [content, setContent] = useState(initialContent || initialData?.content || defaultEditorContent);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({ ...prev, title }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            // 간단한 이미지 업로드 (실제로는 Supabase Storage에 업로드해야 함)
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setFormData(prev => ({
                    ...prev,
                    thumbnail: result
                }));
                setUploadingImage(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('이미지 업로드 중 오류:', error);
            setUploadingImage(false);
        }
    };

    const removeThumbnail = () => {
        setFormData(prev => ({
            ...prev,
            thumbnail: ''
        }));
    };

    const handleSave = async (isDraft = false) => {
        if (!formData.title.trim()) {
            setError('제목을 입력해주세요.');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            await onSave({
                ...formData,
                status: isDraft ? 'draft' : 'published'
            }, content);
        } catch (err) {
            setError('저장 중 오류가 발생했습니다.');
            console.error('Save error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const categories = [
        { value: '웹개발', label: '웹개발' },
        { value: '모바일앱', label: '모바일앱' },
        { value: 'AI/ML', label: 'AI/ML' },
        { value: '게임개발', label: '게임개발' },
        { value: '해커톤', label: '해커톤' },
        { value: '공모전', label: '공모전' },
        { value: '연구프로젝트', label: '연구프로젝트' },
        { value: '사이드프로젝트', label: '사이드프로젝트' }
    ];

    return (
        <div className="min-h-screen bg-white relative">
            {/* 고정된 배경 애니메이션 */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-white/20 to-blue-50/20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
            </div>

            {/* 스크롤되는 내용 */}
            <div className="relative z-10">
                <main className="p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* 헤더 */}
                        <header className="mb-8 pt-20">
                            <div className="max-w-4xl mx-auto">
                                <h1 className="text-2xl font-bold text-slate-900 mb-6">
                                    {isEditing
                                        ? '게시물 수정하기'
                                        : boardType === 'projects'
                                            ? '새 프로젝트 등록하기'
                                            : boardType === 'activities'
                                                ? '새 활동 등록하기'
                                                : '새 자료 등록하기'
                                    }
                                </h1>
                            </div>
                        </header>

                        {/* 썸네일 업로드 */}
                        <div className="mb-8">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-end space-x-4">
                                    {/* 이미지 미리보기 또는 업로드 박스 */}
                                    <div className="flex-shrink-0 w-full">
                                        {formData.thumbnail ? (
                                            <div className="relative w-full h-[394px] rounded-xl overflow-hidden shadow-lg">
                                                <img
                                                    src={formData.thumbnail}
                                                    alt="썸네일 미리보기"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <label className="w-full h-[394px] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors duration-200 cursor-pointer">
                                                <div className="text-center">
                                                    {uploadingImage ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                            <div className="text-slate-500 text-sm">이미지 업로드 중...</div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-6xl text-slate-400 mb-2">+</div>
                                                            <div className="text-slate-500 text-sm">썸네일 이미지를 선택하세요</div>
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
                                        )}
                                    </div>

                                    {/* 버튼들 - 이미지가 있을 때만 표시 */}
                                    {formData.thumbnail && (
                                        <div className="flex flex-col space-y-3">
                                            <label className={`flex items-center justify-center w-12 h-12 ${uploadingImage ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600/90 hover:bg-blue-600 cursor-pointer'} text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 backdrop-blur-sm`}>
                                                {uploadingImage ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
                                            <button
                                                type="button"
                                                onClick={removeThumbnail}
                                                className="flex items-center justify-center w-12 h-12 text-red-500 hover:text-red-400 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/20 backdrop-blur-sm"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 제목 입력 */}
                        <div className="mb-6">
                            <div className="max-w-4xl mx-auto">
                                <input
                                    id="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 resize-none"
                                    placeholder="제목을 입력하세요"
                                />
                            </div>
                        </div>

                        {/* 설명 입력 */}
                        <div className="mb-4">
                            <div className="max-w-4xl mx-auto">
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setFormData(prev => ({ ...prev, description: value }));
                                    }}
                                    rows={2}
                                    className="w-full text-lg sm:text-xl bg-transparent border-none outline-none text-slate-600 placeholder-slate-400 resize-none"
                                    placeholder="게시물에 대한 간단한 설명을 입력하세요"
                                />
                            </div>
                        </div>

                        {/* 메타데이터 입력 */}
                        <div className="mb-8">
                            <div className="max-w-4xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* 카테고리 */}
                                    <select
                                        value={formData.category}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, category: e.target.value }));
                                        }}
                                        className="w-full text-lg bg-transparent border-none outline-none text-slate-600 placeholder-slate-400 resize-none"
                                    >
                                        <option value="">카테고리를 선택하세요</option>
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/* 프로젝트 전용 필드들 */}
                        {boardType === 'projects' && (
                            <div className="mb-8">
                                <div className="max-w-4xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* 프로젝트 타입과 팀 크기 */}
                                        <div className="space-y-6">
                                            <div>
                                                <label htmlFor="project_type" className="block text-sm font-medium text-slate-600 mb-2">
                                                    프로젝트 타입 *
                                                </label>
                                                <select
                                                    id="project_type_id"
                                                    name="project_type_id"
                                                    value={formData.project_type_id || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, project_type_id: parseInt(e.target.value) }));
                                                    }}
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                    required
                                                >
                                                    <option value="">프로젝트 타입을 선택하세요</option>
                                                    <option value="1">개인프로젝트</option>
                                                    <option value="2">팀프로젝트</option>
                                                    <option value="3">해커톤</option>
                                                    <option value="4">공모전</option>
                                                    <option value="5">연구프로젝트</option>
                                                    <option value="6">상업프로젝트</option>
                                                    <option value="7">오픈소스</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="team_size" className="block text-sm font-medium text-slate-600 mb-2">
                                                    팀 크기 *
                                                </label>
                                                <input
                                                    type="number"
                                                    id="team_size"
                                                    name="team_size"
                                                    value={formData.team_size}
                                                    onChange={handleInputChange}
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
                                                    type="date"
                                                    id="deadline"
                                                    name="deadline"
                                                    value={formData.deadline}
                                                    onChange={handleInputChange}
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="difficulty" className="block text-sm font-medium text-slate-600 mb-2">
                                                    난이도 *
                                                </label>
                                                <select
                                                    id="difficulty"
                                                    name="difficulty"
                                                    value={formData.difficulty}
                                                    onChange={handleInputChange}
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
                                    <div className="mt-6">
                                        <label htmlFor="location" className="block text-sm font-medium text-slate-600 mb-2">
                                            진행 방식 *
                                        </label>
                                        <select
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                            required
                                        >
                                            <option value="">진행 방식을 선택하세요</option>
                                            <option value="online">온라인</option>
                                            <option value="offline">오프라인</option>
                                            <option value="hybrid">하이브리드</option>
                                        </select>
                                    </div>

                                    {/* 프로젝트 목표 */}
                                    <div className="mt-6">
                                        <label htmlFor="project_goals" className="block text-sm font-medium text-slate-600 mb-2">
                                            프로젝트 목표
                                        </label>
                                        <textarea
                                            id="project_goals"
                                            name="project_goals"
                                            value={formData.project_goals}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full text-lg bg-transparent border-none outline-none text-slate-600 placeholder-slate-400 resize-none"
                                            placeholder="프로젝트의 목표를 설명해주세요"
                                        />
                                    </div>

                                    {/* 필요 기술 */}
                                    <div className="mt-6">
                                        <label htmlFor="needed_skills" className="block text-sm font-medium text-slate-600 mb-2">
                                            필요 기술 (쉼표로 구분)
                                        </label>
                                        <input
                                            type="text"
                                            id="needed_skills"
                                            name="needed_skills"
                                            value={formData.needed_skills?.join(', ') || ''}
                                            onChange={(e) => {
                                                const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                                setFormData(prev => ({ ...prev, needed_skills: skills }));
                                            }}
                                            className="w-full text-lg bg-transparent border-none outline-none text-slate-600 placeholder-slate-400"
                                            placeholder="React, Node.js, Python, ..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 활동 전용 필드들 */}
                        {boardType === 'activities' && (
                            <div className="mb-8">
                                <div className="max-w-4xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* 활동 타입과 장소 */}
                                        <div className="space-y-6">
                                            <div>
                                                <label htmlFor="activity_type_id" className="block text-sm font-medium text-slate-600 mb-2">
                                                    활동 타입 *
                                                </label>
                                                <select
                                                    id="activity_type_id"
                                                    name="activity_type_id"
                                                    value={formData.activity_type_id || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, activity_type_id: parseInt(e.target.value) }));
                                                    }}
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                    required
                                                >
                                                    <option value="">활동 타입을 선택하세요</option>
                                                    <option value="1">학회행사</option>
                                                    <option value="2">세미나</option>
                                                    <option value="3">워크샵</option>
                                                    <option value="4">해커톤</option>
                                                    <option value="5">공모전</option>
                                                    <option value="6">기타</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="location" className="block text-sm font-medium text-slate-600 mb-2">
                                                    장소
                                                </label>
                                                <input
                                                    type="text"
                                                    id="location"
                                                    name="location"
                                                    value={formData.location || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, location: e.target.value }));
                                                    }}
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                    placeholder="예: 서울대학교 공과대학"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="max_participants" className="block text-sm font-medium text-slate-600 mb-2">
                                                    최대 참가자 수
                                                </label>
                                                <input
                                                    type="number"
                                                    id="max_participants"
                                                    name="max_participants"
                                                    value={formData.max_participants || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }));
                                                    }}
                                                    min="1"
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                    placeholder="예: 50"
                                                />
                                            </div>
                                        </div>

                                        {/* 일정과 참가비 */}
                                        <div className="space-y-6">
                                            <div>
                                                <label htmlFor="start_date" className="block text-sm font-medium text-slate-600 mb-2">
                                                    시작일시
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    id="start_date"
                                                    name="start_date"
                                                    value={formData.start_date || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, start_date: e.target.value }));
                                                    }}
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="end_date" className="block text-sm font-medium text-slate-600 mb-2">
                                                    종료일시
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    id="end_date"
                                                    name="end_date"
                                                    value={formData.end_date || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, end_date: e.target.value }));
                                                    }}
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="participation_fee" className="block text-sm font-medium text-slate-600 mb-2">
                                                    참가비 (원)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="participation_fee"
                                                    name="participation_fee"
                                                    value={formData.participation_fee || 0}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, participation_fee: parseInt(e.target.value) }));
                                                    }}
                                                    min="0"
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="contact_info" className="block text-sm font-medium text-slate-600 mb-2">
                                                    연락처 정보
                                                </label>
                                                <input
                                                    type="text"
                                                    id="contact_info"
                                                    name="contact_info"
                                                    value={formData.contact_info || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, contact_info: e.target.value }));
                                                    }}
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                    placeholder="예: 010-1234-5678 또는 admin@semtle.org"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 자료실 전용 필드들 */}
                        {boardType === 'resources' && (
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
                                                    id="resource_type_id"
                                                    name="resource_type_id"
                                                    value={formData.resource_type_id || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, resource_type_id: parseInt(e.target.value) }));
                                                    }}
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
                                                    type="text"
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, subject: e.target.value }));
                                                    }}
                                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                                    placeholder="예: 데이터베이스시스템"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="professor" className="block text-sm font-medium text-slate-600 mb-2">
                                                    교수명
                                                </label>
                                                <input
                                                    type="text"
                                                    id="professor"
                                                    name="professor"
                                                    value={formData.professor || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, professor: e.target.value }));
                                                    }}
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
                                                    id="semester"
                                                    name="semester"
                                                    value={formData.semester || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, semester: e.target.value }));
                                                    }}
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
                                                    type="number"
                                                    id="year"
                                                    name="year"
                                                    value={formData.year || new Date().getFullYear()}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }));
                                                    }}
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
                                                    id="difficulty_level"
                                                    name="difficulty_level"
                                                    value={formData.difficulty_level || 'intermediate'}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, difficulty_level: e.target.value }));
                                                    }}
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
                        )}

                        {/* 게시물 내용 작성 */}
                        <div className="mb-8">
                            <div className="max-w-4xl mx-auto">
                                {/* 구분선 */}
                                <div className="mb-6">
                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"></div>
                                </div>

                                <NovelEditor
                                    initialContent={content}
                                    onUpdate={setContent}
                                    placeholder="게시물 내용을 작성하세요..."
                                    className="min-h-[600px] text-lg sm:text-xl"
                                    showStatus={true}
                                    editable={true}
                                />
                            </div>
                        </div>

                        {/* 하단 여백 (고정 메뉴바 공간 확보) */}
                        <div className="h-20 sm:h-24"></div>
                    </div>
                </main>
            </div>

            {/* 하단 고정 액션 메뉴바 */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl shadow-2xl border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    {/* 데스크톱 레이아웃 */}
                    <div className="hidden sm:flex items-center justify-between">
                        {/* 왼쪽: 취소 버튼 */}
                        <button
                            onClick={() => router.back()}
                            className="flex items-center space-x-2 px-4 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium group"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>취소</span>
                        </button>

                        {/* 오른쪽: 액션 버튼들 */}
                        <div className="flex items-center space-x-3">
                            {/* 임시저장 버튼 */}
                            <button
                                onClick={() => handleSave(true)}
                                disabled={isSaving || loading}
                                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                임시저장
                            </button>

                            {/* 저장 버튼 */}
                            <button
                                onClick={() => handleSave(false)}
                                disabled={isSaving || loading}
                                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-300 font-medium disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-500/20 active:scale-95"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                        <span>저장 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{isEditing ? '게시물 수정하기' : '게시물 저장하기'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 모바일 레이아웃 */}
                    <div className="sm:hidden">
                        {/* 취소는 왼쪽, 임시저장/저장은 오른쪽에 배치 */}
                        <div className="flex items-center justify-between">
                            {/* 왼쪽: 취소 버튼 */}
                            <button
                                onClick={() => router.back()}
                                className="flex items-center space-x-1 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-300 font-medium"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>취소</span>
                            </button>

                            {/* 오른쪽: 임시저장과 저장 버튼 */}
                            <div className="flex items-center space-x-2">
                                {/* 임시저장 버튼 */}
                                <button
                                    onClick={() => handleSave(true)}
                                    disabled={isSaving || loading}
                                    className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    임시저장
                                </button>

                                {/* 저장 버튼 */}
                                <button
                                    onClick={() => handleSave(false)}
                                    disabled={isSaving || loading}
                                    className="flex items-center space-x-1 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-300 font-medium disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                                            <span>저장 중...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{isEditing ? '수정하기' : '저장하기'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
