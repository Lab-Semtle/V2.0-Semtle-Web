'use client';

import { useState, useRef, useEffect } from 'react';
import BasePostForm from './BasePostForm';
import { JSONContent } from 'novel';

interface ActivityPostFormData {
    title: string;
    subtitle?: string;
    category_id: number;
    activity_type_id: number;
    thumbnail?: string;
    status?: string;
    activity_status?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    participation_fee?: number;
    contact_info?: string;
    tags?: string[];
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
        activity_type_id?: number;
        thumbnail?: string;
        status?: string;
        activity_status?: string;
        location?: string;
        start_date?: string;
        end_date?: string;
        max_participants?: number;
        participation_fee?: number;
        contact_info?: string;
        tags?: string[];
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
    const [activityTypes, setActivityTypes] = useState<any[]>([]);
    const [tagsText, setTagsText] = useState(
        initialData?.tags?.join(', ') || ''
    );

    // 폼 필드 refs
    const activityTypeRef = useRef<HTMLSelectElement>(null);
    const activityStatusRef = useRef<HTMLSelectElement>(null);
    const locationRef = useRef<HTMLInputElement>(null);
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);
    const maxParticipantsRef = useRef<HTMLInputElement>(null);
    const participationFeeRef = useRef<HTMLInputElement>(null);
    const contactInfoRef = useRef<HTMLInputElement>(null);

    // 활동 타입 로드
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/activities');
                const data = await response.json();
                setActivityTypes(data.types || []);
            } catch (error) {
                console.error('활동 타입 로드 오류:', error);
            }
        };
        fetchData();
    }, []);

    const handleSave = async (baseFormData: any, content: JSONContent) => {
        // BasePostForm의 category(name)를 category_id로 변환
        let categoryId = 0;
        if (baseFormData.category) {
            try {
                const response = await fetch('/api/activities');
                const data = await response.json();
                const category = data.categories?.find((c: any) => c.name === baseFormData.category);
                categoryId = category?.id || 0;
            } catch (error) {
                console.error('카테고리 ID 조회 오류:', error);
            }
        }

        const activityFormData: ActivityPostFormData = {
            title: baseFormData.title,
            subtitle: baseFormData.description, // description을 subtitle로 매핑
            category_id: categoryId,
            activity_type_id: activityTypeRef.current?.value ? parseInt(activityTypeRef.current.value) : 0,
            thumbnail: baseFormData.thumbnail,
            status: baseFormData.status,
            activity_status: activityStatusRef.current?.value || 'upcoming',
            location: locationRef.current?.value || undefined,
            start_date: startDateRef.current?.value || undefined,
            end_date: endDateRef.current?.value || undefined,
            max_participants: maxParticipantsRef.current?.value ? parseInt(maxParticipantsRef.current.value) : undefined,
            participation_fee: participationFeeRef.current?.value ? parseInt(participationFeeRef.current.value) : 0,
            contact_info: contactInfoRef.current?.value || undefined,
            tags: tagsText.split(',').map(s => s.trim()).filter(s => s),
        };

        console.log('ActivityPostForm 데이터:', activityFormData);
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
                    const category = data.categories?.find((c: any) => c.id === initialData.category_id);
                    setInitialCategoryName(category?.name || '');
                } catch (error) {
                    console.error('카테고리 이름 조회 오류:', error);
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
            {/* 활동 전용 필드들 */}
            <div className="mb-8">
                <div className="max-w-4xl mx-auto">
                    {/* 활동 기본 정보 */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">활동 기본 정보</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 활동 타입과 상태 */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="activity_type_id" className="block text-sm font-medium text-slate-600 mb-2">
                                    활동 타입 *
                                </label>
                                <select
                                    ref={activityTypeRef}
                                    id="activity_type_id"
                                    name="activity_type_id"
                                    defaultValue={initialData?.activity_type_id || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 py-2 border rounded-md focus:border-blue-500 transition-colors"
                                    required
                                >
                                    <option value="">활동 타입을 선택하세요</option>
                                    {activityTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="activity_status" className="block text-sm font-medium text-slate-600 mb-2">
                                    활동 상태 *
                                </label>
                                <select
                                    ref={activityStatusRef}
                                    id="activity_status"
                                    name="activity_status"
                                    defaultValue={initialData?.activity_status || 'upcoming'}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 py-2 border rounded-md focus:border-blue-500 transition-colors"
                                    required
                                >
                                    <option value="upcoming">예정</option>
                                    <option value="ongoing">진행중</option>
                                    <option value="completed">완료</option>
                                    <option value="cancelled">취소</option>
                                </select>
                            </div>
                        </div>

                        {/* 장소와 연락처 */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-slate-600 mb-2">
                                    장소
                                </label>
                                <input
                                    ref={locationRef}
                                    type="text"
                                    id="location"
                                    name="location"
                                    defaultValue={initialData?.location || ''}
                                    placeholder="활동 장소를 입력하세요"
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 py-2 border rounded-md focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact_info" className="block text-sm font-medium text-slate-600 mb-2">
                                    연락처
                                </label>
                                <input
                                    ref={contactInfoRef}
                                    type="text"
                                    id="contact_info"
                                    name="contact_info"
                                    defaultValue={initialData?.contact_info || ''}
                                    placeholder="연락처를 입력하세요"
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 py-2 border rounded-md focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 일정 정보 */}
                    <div className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">일정 정보</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-slate-600 mb-2">
                                    시작 일시 *
                                </label>
                                <input
                                    ref={startDateRef}
                                    type="datetime-local"
                                    id="start_date"
                                    name="start_date"
                                    defaultValue={initialData?.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 py-2 border rounded-md focus:border-blue-500 transition-colors cursor-pointer"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-slate-600 mb-2">
                                    종료 일시 *
                                </label>
                                <input
                                    ref={endDateRef}
                                    type="datetime-local"
                                    id="end_date"
                                    name="end_date"
                                    defaultValue={initialData?.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 py-2 border rounded-md focus:border-blue-500 transition-colors cursor-pointer"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* 참가 정보 */}
                    <div className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">참가 정보</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label htmlFor="max_participants" className="block text-sm font-medium text-slate-600 mb-2">
                                    최대 참가 인원
                                </label>
                                <input
                                    ref={maxParticipantsRef}
                                    type="number"
                                    id="max_participants"
                                    name="max_participants"
                                    defaultValue={initialData?.max_participants || ''}
                                    min="1"
                                    placeholder="제한 없음"
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 py-2 border rounded-md focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label htmlFor="participation_fee" className="block text-sm font-medium text-slate-600 mb-2">
                                    참가비 (원)
                                </label>
                                <input
                                    ref={participationFeeRef}
                                    type="number"
                                    id="participation_fee"
                                    name="participation_fee"
                                    defaultValue={initialData?.participation_fee || 0}
                                    min="0"
                                    placeholder="0"
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 py-2 border rounded-md focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 태그 */}
                    <div className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">태그</h3>
                        </div>
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-slate-600 mb-2">
                                태그 (쉼표로 구분)
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={tagsText}
                                onChange={(e) => setTagsText(e.target.value)}
                                placeholder="예: 세미나, 워크샵, 네트워킹"
                                className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 py-2 border rounded-md focus:border-blue-500 transition-colors"
                            />
                            <p className="mt-2 text-sm text-slate-500">
                                태그를 쉼표(,)로 구분하여 입력하세요
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </BasePostForm>
    );
}
