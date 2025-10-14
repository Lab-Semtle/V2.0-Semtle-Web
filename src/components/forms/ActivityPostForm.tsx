'use client';

import { useState } from 'react';
import BasePostForm from './BasePostForm';
import { JSONContent } from 'novel';

interface ActivityPostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
    activity_type_id?: number;
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    participation_fee?: number;
    contact_info?: string;
    has_voting?: boolean;
}

interface ActivityPostFormProps {
    onSave: (formData: ActivityPostFormData, content: JSONContent) => Promise<void>;
    isEditing?: boolean;
    loading?: boolean;
    initialData?: {
        title?: string;
        description?: string;
        category?: string;
        thumbnail?: string;
        content?: JSONContent;
        status?: string;
        activity_type_id?: number;
        location?: string;
        start_date?: string;
        end_date?: string;
        max_participants?: number;
        participation_fee?: number;
        contact_info?: string;
        has_voting?: boolean;
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
    const handleSave = async (baseFormData: any, content: JSONContent) => {
        const activityFormData: ActivityPostFormData = {
            ...baseFormData,
        };

        await onSave(activityFormData, content);
    };

    return (
        <BasePostForm
            onSave={handleSave}
            isEditing={isEditing}
            loading={loading}
            boardType="activities"
            initialData={initialData}
            initialContent={initialContent}
        >
            {/* 활동 전용 필드들 */}
            <div className="mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 활동 타입과 위치 */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="activity_type_id" className="block text-sm font-medium text-slate-600 mb-2">
                                    활동 타입 *
                                </label>
                                <select
                                    id="activity_type_id"
                                    name="activity_type_id"
                                    defaultValue={initialData?.activity_type_id || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    required
                                >
                                    <option value="">활동 타입을 선택하세요</option>
                                    <option value="1">세미나</option>
                                    <option value="2">워크샵</option>
                                    <option value="3">컨퍼런스</option>
                                    <option value="4">해커톤</option>
                                    <option value="5">스터디</option>
                                    <option value="6">기타</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-slate-600 mb-2">
                                    위치
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    defaultValue={initialData?.location || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    placeholder="예: 서울시 강남구 또는 온라인"
                                />
                            </div>
                        </div>

                        {/* 일정 정보 */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-slate-600 mb-2">
                                    시작일
                                </label>
                                <input
                                    type="datetime-local"
                                    id="start_date"
                                    name="start_date"
                                    defaultValue={initialData?.start_date || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 cursor-pointer hover:bg-slate-50/50 transition-colors rounded-md"
                                />
                            </div>

                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-slate-600 mb-2">
                                    종료일
                                </label>
                                <input
                                    type="datetime-local"
                                    id="end_date"
                                    name="end_date"
                                    defaultValue={initialData?.end_date || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 cursor-pointer hover:bg-slate-50/50 transition-colors rounded-md"
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
                                    최대 참가자 수
                                </label>
                                <input
                                    type="number"
                                    id="max_participants"
                                    name="max_participants"
                                    defaultValue={initialData?.max_participants || ''}
                                    min="1"
                                    max="1000"
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    placeholder="예: 50"
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
                                    defaultValue={initialData?.participation_fee || 0}
                                    min="0"
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 연락처 및 기타 정보 */}
                    <div className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">연락처 및 기타 정보</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="contact_info" className="block text-sm font-medium text-slate-600 mb-2">
                                    연락처 정보
                                </label>
                                <input
                                    type="text"
                                    id="contact_info"
                                    name="contact_info"
                                    defaultValue={initialData?.contact_info || ''}
                                    className="w-full text-lg bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                                    placeholder="예: 010-1234-5678 또는 admin@semtle.org"
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="has_voting"
                                    name="has_voting"
                                    defaultChecked={initialData?.has_voting || false}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="has_voting" className="text-sm font-medium text-slate-600">
                                    투표 기능 활성화
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BasePostForm>
    );
}
