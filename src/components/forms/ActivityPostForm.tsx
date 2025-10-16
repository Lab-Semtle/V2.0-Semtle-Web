'use client';

import { useState, useRef, useEffect } from 'react';
import BasePostForm from './BasePostForm';
import { JSONContent } from 'novel';

interface BasePostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
}

interface ActivityPostFormData {
    title: string;
    subtitle?: string;
    category_id: number;
    thumbnail?: string;
    status?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    participation_fee?: number;
    contact_info?: string;
    tags?: string[];
    has_voting?: boolean;
    vote_options?: { id: string; text: string; votes: number }[];
    vote_deadline?: string;
}

interface ActivityPostFormProps {
    onSave: (formData: ActivityPostFormData, content: JSONContent) => Promise<void>;
    isEditing?: boolean;
    loading?: boolean;
    initialData?: {
        title?: string;
        subtitle?: string;
        description?: string;
        content?: JSONContent;
        category_id?: number;
        thumbnail?: string;
        status?: string;
        location?: string;
        start_date?: string;
        end_date?: string;
        max_participants?: number;
        participation_fee?: number;
        contact_info?: string;
        tags?: string[];
        has_voting?: boolean;
        vote_options?: { id: string; text: string; votes: number }[];
        vote_deadline?: string;
    };
    initialContent?: JSONContent;
}

export default function ActivityPostForm({
    onSave,
    isEditing = false,
    loading = false,
    initialData,
    initialContent
}: ActivityPostFormProps) {
    const [tagsText, setTagsText] = useState(
        initialData?.tags?.join(', ') || ''
    );
    const [hasVoting, setHasVoting] = useState(initialData?.has_voting || false);
    const [voteOptions, setVoteOptions] = useState<{ id: string; text: string; votes: number }[]>(
        initialData?.vote_options || []
    );
    const [hasParticipation, setHasParticipation] = useState(
        !!(initialData?.max_participants || initialData?.participation_fee)
    );

    // 폼 필드 refs
    const locationRef = useRef<HTMLInputElement>(null);
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);
    const maxParticipantsRef = useRef<HTMLInputElement>(null);
    const participationFeeRef = useRef<HTMLInputElement>(null);
    const contactInfoRef = useRef<HTMLInputElement>(null);
    const voteDeadlineRef = useRef<HTMLInputElement>(null);

    // 투표 옵션 관리 함수들
    const addVoteOption = () => {
        const newOption = {
            id: Date.now().toString(),
            text: '',
            votes: 0
        };
        setVoteOptions([...voteOptions, newOption]);
    };

    const removeVoteOption = (id: string) => {
        setVoteOptions(voteOptions.filter(option => option.id !== id));
    };

    const updateVoteOption = (id: string, text: string) => {
        setVoteOptions(voteOptions.map(option =>
            option.id === id ? { ...option, text } : option
        ));
    };


    const handleSave = async (baseFormData: BasePostFormData, content: JSONContent) => {
        // BasePostForm의 category(name)를 category_id로 변환
        let categoryId = 0;
        if (baseFormData.category) {
            try {
                const response = await fetch('/api/activities');
                const data = await response.json();
                const category = data.categories?.find((c: Record<string, unknown>) => c.name === baseFormData.category);
                categoryId = category?.id || 0;
            } catch {
            }
        }

        const activityFormData: ActivityPostFormData = {
            title: baseFormData.title,
            subtitle: baseFormData.description, // description을 subtitle로 매핑
            category_id: categoryId,
            thumbnail: baseFormData.thumbnail,
            status: baseFormData.status,
            location: locationRef.current?.value || undefined,
            start_date: startDateRef.current?.value || undefined,
            end_date: endDateRef.current?.value || undefined,
            max_participants: hasParticipation && maxParticipantsRef.current?.value ? parseInt(maxParticipantsRef.current.value) : undefined,
            participation_fee: hasParticipation && participationFeeRef.current?.value ? parseInt(participationFeeRef.current.value) : undefined,
            contact_info: contactInfoRef.current?.value || undefined,
            tags: tagsText.split(',').map(s => s.trim()).filter(s => s),
            has_voting: hasVoting,
            vote_options: hasVoting ? voteOptions.filter(option => option.text.trim()) : undefined,
            vote_deadline: hasVoting && voteDeadlineRef.current?.value ? voteDeadlineRef.current.value : undefined,
        };

        await onSave(activityFormData, content);
    };

    // category_id를 category name으로 변환 (편집 시)
    const [initialCategoryName, setInitialCategoryName] = useState<string>('');

    useEffect(() => {
        const fetchCategoryName = async () => {
            if (initialData?.category_id) {
                try {
                    const response = await fetch('/api/activities');
                    const data = await response.json();
                    const category = data.categories?.find((c: Record<string, unknown>) => c.id === initialData.category_id);
                    setInitialCategoryName(category?.name || '');
                } catch {
                }
            }
        };
        fetchCategoryName();
    }, [initialData?.category_id]);

    return (
        <BasePostForm
            onSave={handleSave}
            isEditing={isEditing}
            loading={loading}
            boardType="activities"
            initialData={{
                title: initialData?.title,
                description: initialData?.subtitle || initialData?.description, // subtitle을 description으로 매핑
                category: initialCategoryName, // category_id를 category name으로 매핑
                thumbnail: initialData?.thumbnail,
                status: initialData?.status
            }}
            initialContent={initialContent}
        >
            {() => (
                <div className="mb-8">
                    <div className="max-w-4xl mx-auto">
                        {/* 활동 기본 정보 */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">활동 기본 정보</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            기본 정보
                                        </label>
                                        <p className="text-xs text-slate-500">활동의 일정, 장소, 연락처 정보를 입력하세요</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 시작 일시 */}
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                        <label htmlFor="start_date" className="block text-sm font-semibold text-slate-700 mb-2">
                                            시작 일시 *
                                        </label>
                                        <input
                                            ref={startDateRef}
                                            type="datetime-local"
                                            id="start_date"
                                            name="start_date"
                                            defaultValue={initialData?.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : ''}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 cursor-pointer"
                                            required
                                        />
                                    </div>

                                    {/* 종료 일시 */}
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                        <label htmlFor="end_date" className="block text-sm font-semibold text-slate-700 mb-2">
                                            종료 일시 *
                                        </label>
                                        <input
                                            ref={endDateRef}
                                            type="datetime-local"
                                            id="end_date"
                                            name="end_date"
                                            defaultValue={initialData?.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : ''}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 cursor-pointer"
                                            required
                                        />
                                    </div>

                                    {/* 장소 */}
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                        <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-2">
                                            장소
                                        </label>
                                        <input
                                            ref={locationRef}
                                            type="text"
                                            id="location"
                                            name="location"
                                            defaultValue={initialData?.location || ''}
                                            placeholder="활동 장소를 입력하세요"
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                        />
                                    </div>

                                    {/* 연락처 */}
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                        <label htmlFor="contact_info" className="block text-sm font-semibold text-slate-700 mb-2">
                                            연락처
                                        </label>
                                        <input
                                            ref={contactInfoRef}
                                            type="text"
                                            id="contact_info"
                                            name="contact_info"
                                            defaultValue={initialData?.contact_info || ''}
                                            placeholder="연락처를 입력하세요"
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* 태그 입력 */}
                                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                    <label htmlFor="tags" className="block text-sm font-semibold text-slate-700 mb-2">
                                        태그
                                    </label>
                                    <input
                                        type="text"
                                        id="tags"
                                        name="tags"
                                        value={tagsText}
                                        onChange={(e) => setTagsText(e.target.value)}
                                        placeholder="태그를 쉼표(,)로 구분하여 입력하세요 (예: 세미나, 워크샵, 네트워킹)"
                                        className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* 투표 설정 */}
                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">투표 설정</h3>
                            </div>

                            {/* 투표 활성화 체크박스 */}
                            <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={hasVoting}
                                            onChange={(e) => setHasVoting(e.target.checked)}
                                            className="w-5 h-5 text-purple-600 bg-white border-2 border-purple-300 rounded-md focus:ring-purple-500 focus:ring-2 transition-all duration-200 appearance-none"
                                        />
                                        {hasVoting && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20" style={{ transform: 'translateY(-3px)' }} strokeWidth="3">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                                            투표 기능 활성화
                                        </span>
                                        <p className="text-xs text-slate-600 mt-1">
                                            참가자들이 투표할 수 있는 옵션을 제공합니다
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* 투표 옵션들 */}
                            {hasVoting && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                                투표 옵션
                                            </label>
                                            <p className="text-xs text-slate-500">최소 2개 이상의 옵션을 추가해주세요</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addVoteOption}
                                            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            옵션 추가
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {voteOptions.map((option, index) => (
                                            <div key={option.id} className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-all duration-200 hover:shadow-sm">
                                                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-purple-700">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => updateVoteOption(option.id, e.target.value)}
                                                    placeholder={`투표 옵션 ${index + 1}을 입력하세요`}
                                                    className="flex-1 text-sm bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 focus:text-slate-900 transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeVoteOption(option.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {voteOptions.length === 0 && (
                                        <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl border-2 border-dashed border-slate-200">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 mb-1">투표 옵션이 없습니다</p>
                                            <p className="text-xs text-slate-500">위의 &apos;옵션 추가&apos; 버튼을 클릭하여 투표 옵션을 추가해주세요</p>
                                        </div>
                                    )}

                                    {/* 투표 마감일 */}
                                    <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                        <label htmlFor="vote_deadline" className="block text-sm font-semibold text-slate-700 mb-2">
                                            투표 마감일시
                                        </label>
                                        <input
                                            ref={voteDeadlineRef}
                                            type="datetime-local"
                                            id="vote_deadline"
                                            name="vote_deadline"
                                            defaultValue={initialData?.vote_deadline ? new Date(initialData.vote_deadline).toISOString().slice(0, 16) : ''}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 cursor-pointer"
                                        />
                                        <p className="mt-2 text-xs text-slate-600">
                                            투표 마감일시를 설정하지 않으면 활동 종료일까지 투표가 가능합니다
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 참가 설정 */}
                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">참가 설정</h3>
                            </div>

                            {/* 참가 기능 활성화 체크박스 */}
                            <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={hasParticipation}
                                            onChange={(e) => setHasParticipation(e.target.checked)}
                                            className="w-5 h-5 text-green-600 bg-white border-2 border-green-300 rounded-md focus:ring-green-500 focus:ring-2 transition-all duration-200 appearance-none"
                                        />
                                        {hasParticipation && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20" style={{ transform: 'translateY(-3px)' }} strokeWidth="3">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-slate-800 group-hover:text-green-700 transition-colors">
                                            참가 기능 활성화
                                        </span>
                                        <p className="text-xs text-slate-600 mt-1">
                                            참가자 수 제한 및 참가비 설정이 가능합니다
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* 참가 관련 필드들 */}
                            {hasParticipation && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                                참가 정보
                                            </label>
                                            <p className="text-xs text-slate-500">참가자 수 제한과 참가비를 설정할 수 있습니다</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* 최대 참가자 수 */}
                                        <div className="p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl border border-slate-200">
                                            <label htmlFor="max_participants" className="block text-sm font-semibold text-slate-700 mb-2">
                                                최대 참가자 수
                                            </label>
                                            <input
                                                ref={maxParticipantsRef}
                                                type="number"
                                                id="max_participants"
                                                name="max_participants"
                                                defaultValue={initialData?.max_participants || ''}
                                                min="1"
                                                placeholder="예: 50"
                                                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                            />
                                            <p className="mt-2 text-xs text-slate-600">
                                                참가자 수를 제한하지 않으려면 비워두세요
                                            </p>
                                        </div>

                                        {/* 참가비 */}
                                        <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                            <label htmlFor="participation_fee" className="block text-sm font-semibold text-slate-700 mb-2">
                                                참가비 (원)
                                            </label>
                                            <input
                                                ref={participationFeeRef}
                                                type="number"
                                                id="participation_fee"
                                                name="participation_fee"
                                                defaultValue={initialData?.participation_fee || ''}
                                                min="0"
                                                placeholder="예: 10000"
                                                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                            />
                                            <p className="mt-2 text-xs text-slate-600">
                                                무료 활동이면 0 또는 비워두세요
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </BasePostForm>
    );
}
