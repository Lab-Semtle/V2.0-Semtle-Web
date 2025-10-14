'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NovelEditor from '@/components/editor/NovelEditor';
import { defaultEditorContent } from '@/lib/content';
import { JSONContent } from 'novel';

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
    icon?: string;
    is_active: boolean;
    sort_order: number;
}

interface BasePostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
}

interface BasePostFormProps {
    onSave: (formData: BasePostFormData, content: JSONContent) => Promise<void>;
    isEditing?: boolean;
    loading?: boolean;
    boardType: 'projects' | 'activities' | 'resources';
    initialData?: {
        title?: string;
        description?: string;
        category?: string;
        thumbnail?: string;
        content?: JSONContent;
        status?: string;
    };
    initialContent?: JSONContent;
    children?: React.ReactNode; // 게시판별 전용 필드들
}

export default function BasePostForm({
    onSave,
    isEditing = false,
    loading = false,
    boardType,
    initialData,
    initialContent,
    children
}: BasePostFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState<BasePostFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        thumbnail: initialData?.thumbnail || '',
        status: initialData?.status || 'draft'
    });
    const [content, setContent] = useState<JSONContent>(initialContent || initialData?.content as JSONContent || defaultEditorContent);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');

    // 카테고리와 타입 데이터
    const [categories, setCategories] = useState<Category[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // 데이터 로드
    useEffect(() => {
        loadData();
    }, [boardType]);

    const loadData = async () => {
        try {
            setLoadingData(true);

            // 카테고리 로드
            const categoryResponse = await fetch(`/api/categories?board_type=${boardType}`);
            if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                setCategories(categoryData.categories || []);
            }

            // 타입 로드 (프로젝트와 활동만)
            if (boardType === 'projects' || boardType === 'activities') {
                const typeResponse = await fetch(`/api/types?board_type=${boardType}`);
                if (typeResponse.ok) {
                    const typeData = await typeResponse.json();
                    setTypes(typeData.types || []);
                }
            }
        } catch (error) {
            console.error('데이터 로드 오류:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('이미지 크기는 10MB 이하여야 합니다.');
            return;
        }

        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        setUploadingImage(true);
        setError('');

        try {
            // FormData 생성
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user?.id || '');

            // Supabase Storage에 업로드
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, thumbnail: data.url }));
            } else {
                throw new Error('이미지 업로드에 실패했습니다.');
            }
        } catch (error) {
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

    const handleSave = async (isDraft = false) => {
        console.log('handleSave 호출됨:', { isDraft, formData, content });

        // 기본 필드 검증
        if (!isDraft) {
            const validationErrors = [];

            if (!formData.title.trim()) {
                validationErrors.push('제목을 입력해주세요.');
            }

            if (!formData.description.trim()) {
                validationErrors.push('설명을 입력해주세요.');
            }

            if (!formData.category) {
                validationErrors.push('카테고리를 선택해주세요.');
            }

            // 에러가 있으면 첫 번째 에러 메시지를 알림창으로 표시
            if (validationErrors.length > 0) {
                alert(validationErrors[0]);
                return;
            }
        }

        setIsSaving(true);

        try {
            const processedFormData = {
                ...formData,
                status: isDraft ? 'draft' : 'published'
            };

            console.log('onSave 호출 전:', { processedFormData, content });
            await onSave(processedFormData, content);
            console.log('onSave 호출 완료');
        } catch (err) {
            console.error('저장 오류:', err);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const getTitle = () => {
        if (isEditing) return '게시물 수정하기';

        switch (boardType) {
            case 'projects': return '새 프로젝트 등록하기';
            case 'activities': return '새 활동 등록하기';
            case 'resources': return '새 자료 등록하기';
            default: return '새 게시물 등록하기';
        }
    };

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
                                    {getTitle()}
                                </h1>
                            </div>
                        </header>

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="mb-6 max-w-4xl mx-auto">
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* 썸네일 업로드 */}
                        <div className="mb-8">
                            <div className="max-w-4xl mx-auto">

                                <div className="space-y-4">
                                    {formData.thumbnail ? (
                                        <div className="relative">
                                            <img
                                                src={formData.thumbnail}
                                                alt="썸네일"
                                                className="w-full h-[394px] object-cover rounded-xl"
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
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 기본 정보 - 제목, 소제목, 카테고리 */}
                        <div className="mb-8">
                            <div className="max-w-4xl mx-auto">
                                {/* 제목 입력 */}
                                <div className="mb-6">
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-transparent border-none outline-none text-slate-900 placeholder-gray-400 resize-none"
                                        placeholder="제목을 입력하세요"
                                        required
                                    />
                                </div>

                                {/* 설명 입력 */}
                                <div className="mb-4">
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full text-lg sm:text-xl bg-transparent border-none outline-none text-slate-700 placeholder-gray-500 resize-none"
                                        placeholder="게시물에 대한 간단한 설명을 입력하세요"
                                        required
                                    />
                                </div>

                                {/* 카테고리 */}
                                <div className="mb-6">
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                        required
                                        disabled={loadingData}
                                    >
                                        <option value="">{loadingData ? '로딩 중...' : '카테고리를 선택하세요'}</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 게시판별 전용 필드들 */}
                        <div className="mb-4">
                            {children}
                        </div>

                        {/* 게시물 내용 작성 */}
                        <div className="mb-8">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {boardType === 'projects' ? '프로젝트 상세 내용' :
                                            boardType === 'activities' ? '활동 상세 내용' :
                                                '자료 상세 내용'}
                                    </h3>
                                </div>

                                <div className="border border-dashed border-gray-300 rounded-lg p-4">
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
                        </div>

                        {/* 하단 여백 (고정 메뉴바 공간 확보) */}
                        <div className="h-24"></div>
                    </div>
                </main>
            </div>

            {/* 하단 고정 액션 메뉴바 */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl shadow-2xl border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        {/* 왼쪽: 뒤로가기 버튼 */}
                        <button
                            onClick={() => router.back()}
                            className="flex items-center space-x-2 px-4 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium group"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>뒤로가기</span>
                        </button>

                        {/* 오른쪽: 액션 버튼들 */}
                        <div className="flex items-center space-x-3">
                            {/* 취소 버튼 */}
                            <button
                                onClick={() => router.back()}
                                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium"
                            >
                                취소
                            </button>

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
                                        <span>저장하기</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
