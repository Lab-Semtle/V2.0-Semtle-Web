'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NovelEditor from '@/components/editor/NovelEditor';
import { JSONContent } from 'novel';
import { Images, PanelLeftOpen, ClipboardList, SlidersHorizontal, Plus, X, GitBranch, ChevronDown, Eye, EyeOff, XCircle, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
// Sidebar 제거
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Toggle } from '@/components/ui/toggle';
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

interface ActivityPostFormData {
    title: string;
    subtitle?: string;
    category_id: number;
    thumbnail?: string | string[];
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
    activityId?: number;
    postId?: string | number; // 게시물 ID (편집 시, activityId와 동일하거나 별도로 지정)
    initialData?: {
        title?: string;
        subtitle?: string;
        description?: string;
        content?: JSONContent;
        category_id?: number;
        thumbnail?: string | string[];
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

// 데스크톱 토글 제거

function LeftSettingsPanel({
    selectedCategoryId,
    handleCategoryChange,
    loadingData,
    categories,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    locationRef,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initialData,
    contactInfoRef,
    tagInput,
    setTagInput,
    handleAddTag,
    tags,
    handleRemoveTag,
    hasVoting,
    setHasVoting,
    addVoteOption,
    voteOptions,
    updateVoteOption,
    removeVoteOption,
    voteDeadline,
    setVoteDeadline,
    hasParticipation,
    setHasParticipation,
    maxParticipantsRef,
    participationFeeRef,
    activityLocation,
    setActivityLocation,
    contactInfo,
    setContactInfo,
    maxParticipants,
    setMaxParticipants,
    participationFee,
    setParticipationFee
}: {
    selectedCategoryId: number | null;
    handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    loadingData: boolean;
    categories: Category[];
    startDate: Date | undefined;
    setStartDate: (date: Date | undefined) => void;
    endDate: Date | undefined;
    setEndDate: (date: Date | undefined) => void;
    locationRef: React.RefObject<HTMLInputElement | null>;
    initialData?: {
        title?: string;
        subtitle?: string;
        description?: string;
        content?: JSONContent;
        category_id?: number;
        thumbnail?: string | string[];
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
    contactInfoRef: React.RefObject<HTMLInputElement | null>;
    tagInput: string;
    setTagInput: (value: string) => void;
    handleAddTag: () => void;
    tags: string[];
    handleRemoveTag: (index: number) => void;
    hasVoting: boolean;
    setHasVoting: (value: boolean) => void;
    addVoteOption: () => void;
    voteOptions: { id: string; text: string; votes: number }[];
    updateVoteOption: (id: string, text: string) => void;
    removeVoteOption: (id: string) => void;
    voteDeadline: Date | undefined;
    setVoteDeadline: (date: Date | undefined) => void;
    hasParticipation: boolean;
    setHasParticipation: (value: boolean) => void;
    maxParticipantsRef: React.RefObject<HTMLInputElement | null>;
    participationFeeRef: React.RefObject<HTMLInputElement | null>;
    activityLocation: string;
    setActivityLocation: (value: string) => void;
    contactInfo: string;
    setContactInfo: (value: string) => void;
    maxParticipants: string;
    setMaxParticipants: (value: string) => void;
    participationFee: string;
    setParticipationFee: (value: string) => void;
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
                            {categories.map((category: Category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div className="flex flex-col gap-3">
                            <div className="flex-1">
                                <label htmlFor="start_date" className="block text-xs font-medium text-slate-600 mb-1.5">시작 일시</label>
                                <DateTimePicker id="start_date" name="start_date" date={startDate} onDateChange={setStartDate} placeholder="시작 날짜를 선택하세요" showTime={false} className="[&>div>button]:w-full" />
                            </div>
                            {/* 구분 기호 제거 */}
                            <div className="flex-1">
                                <label htmlFor="end_date" className="block text-xs font-medium text-slate-600 mb-1.5">종료 일시</label>
                                <DateTimePicker id="end_date" name="end_date" date={endDate} onDateChange={setEndDate} placeholder="종료 날짜를 선택하세요" showTime={false} className="[&>div>button]:w-full" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-xs font-medium text-slate-600 mb-1.5">활동 장소</label>
                        <input
                            ref={locationRef}
                            type="text"
                            id="location"
                            name="location"
                            value={activityLocation}
                            onChange={(e) => {
                                const value = e.target.value;
                                setActivityLocation(value);
                            }}
                            placeholder="활동 장소를 입력하세요"
                            className={cn(
                                "w-full text-sm border rounded-md px-3 py-2 placeholder-slate-400 focus:ring-1 transition-all duration-150",
                                activityLocation.trim()
                                    ? "bg-blue-50 border-blue-200 text-blue-900 focus:border-blue-400 focus:ring-blue-300"
                                    : "bg-slate-50/50 border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-slate-300"
                            )}
                        />
                    </div>
                    <div>
                        <label htmlFor="contact_info" className="block text-xs font-medium text-slate-600 mb-1.5">활동 관련 연락처</label>
                        <input
                            ref={contactInfoRef}
                            type="text"
                            id="contact_info"
                            name="contact_info"
                            value={contactInfo}
                            onChange={(e) => {
                                const value = e.target.value;
                                setContactInfo(value);
                            }}
                            placeholder="연락처를 입력하세요"
                            className={cn(
                                "w-full text-sm border rounded-md px-3 py-2 placeholder-slate-400 focus:ring-1 transition-all duration-150",
                                contactInfo.trim()
                                    ? "bg-blue-50 border-blue-200 text-blue-900 focus:border-blue-400 focus:ring-blue-300"
                                    : "bg-slate-50/50 border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-slate-300"
                            )}
                        />
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-xs font-medium text-slate-600 mb-1.5">게시물 태그</label>
                        <div className="grid grid-cols-[1fr_auto] gap-2 mb-2 w-full">
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                placeholder="태그를 입력하세요"
                                className={cn(
                                    "w-full min-w-0 text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150",
                                    tagInput.trim() ? "bg-white" : "bg-slate-50/50"
                                )}
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                disabled={!tagInput.trim()}
                                className={cn(
                                    "px-3 py-2 rounded-md border transition-all duration-150 flex items-center justify-center shadow-sm shrink-0",
                                    tagInput.trim() ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 cursor-pointer shadow-md hover:shadow-lg" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                )}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag: string, index: number) => (
                                    <div key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black hover:bg-slate-800 text-white rounded-md text-xs transition-colors shadow-sm">
                                        <span className="font-medium">{tag}</span>
                                        <button type="button" onClick={() => handleRemoveTag(index)} className="hover:bg-slate-700 rounded-full p-0.5 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-4 mt-12 sm:mt-12 lg:mt-10 mb-24 sm:mb-16 lg:mb-12">
                <div className="pb-1">
                    <div className="flex items-center gap-2.5">
                        <SlidersHorizontal className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-wide">추가 옵션 설정</h3>
                    </div>
                    <div className="mt-2 h-px w-full bg-slate-200"></div>
                </div>
                <div className="space-y-4">
                    <div className={cn(
                        "space-y-3 rounded-lg p-4 transition-all duration-200 border border-slate-200",
                        hasVoting ? "bg-purple-50/80 border-purple-200 shadow-sm" : ""
                    )}>
                        <div className="flex items-center justify-between gap-2 w-full">
                            <span className="text-sm font-medium text-slate-700">투표 기능 활성화</span>
                            <Toggle variant="outline" pressed={hasVoting} onPressedChange={setHasVoting} aria-label="투표 기능 활성화" className="h-8 px-3">{hasVoting ? '비활성화' : '활성화'}</Toggle>
                        </div>
                        {hasVoting && (
                            <div className="space-y-3">
                                <button type="button" onClick={addVoteOption} className="w-full px-3 py-2 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    옵션 추가
                                </button>
                                <div className="space-y-2">
                                    {voteOptions.map((option: { id: string; text: string; votes: number }, index: number) => (
                                        <div key={option.id} className="group flex items-start gap-2 p-2 bg-slate-50/30 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-150" style={{ width: 'calc(100% - 0px)' }}>
                                            <div className="flex-shrink-0 w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center mt-0.5"><span className="text-xs font-medium text-slate-600">{index + 1}</span></div>
                                            <textarea
                                                value={option.text}
                                                onChange={(e) => updateVoteOption(option.id, e.target.value)}
                                                placeholder={`투표 옵션 ${index + 1}`}
                                                rows={1}
                                                className="flex-1 min-w-0 text-xs bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 focus:text-slate-900 resize-none overflow-hidden break-words"
                                                style={{
                                                    wordWrap: 'break-word',
                                                    overflowWrap: 'break-word'
                                                }}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = 'auto';
                                                    target.style.height = target.scrollHeight + 'px';
                                                }}
                                            />
                                            <button type="button" onClick={() => removeVoteOption(option.id)} className="flex-shrink-0 opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-150 mt-0.5">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label htmlFor="vote_deadline" className="block text-xs font-medium text-slate-600 mb-1.5">투표 마감일시</label>
                                    <DateTimePicker id="vote_deadline" name="vote_deadline" date={voteDeadline} onDateChange={setVoteDeadline} placeholder="투표 마감일시를 선택하세요" showTime={true} className="[&>div>button]:w-full" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={cn(
                        "space-y-3 rounded-lg p-4 transition-all duration-200 border border-slate-200",
                        hasParticipation ? "bg-emerald-50/80 border-emerald-200 shadow-sm" : ""
                    )}>
                        <div className="flex items-center justify-between gap-2 w-full">
                            <span className="text-sm font-medium text-slate-700">참가 기능 활성화</span>
                            <Toggle variant="outline" pressed={hasParticipation} onPressedChange={setHasParticipation} aria-label="참가 기능 활성화" className="h-8 px-3">{hasParticipation ? '비활성화' : '활성화'}</Toggle>
                        </div>
                        {hasParticipation && (
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="max_participants" className="block text-xs font-medium text-slate-600 mb-1.5">최대 참가자 수</label>
                                    <input
                                        ref={maxParticipantsRef}
                                        type="number"
                                        id="max_participants"
                                        name="max_participants"
                                        value={maxParticipants}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setMaxParticipants(value);
                                        }}
                                        min="1"
                                        placeholder="예: 50"
                                        className={cn(
                                            "w-full text-sm border rounded-md px-3 py-2 placeholder-slate-400 focus:ring-1 transition-all duration-150",
                                            maxParticipants.trim()
                                                ? "bg-blue-50 border-blue-200 text-blue-900 focus:border-blue-400 focus:ring-blue-300"
                                                : "bg-slate-50/50 border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-slate-300"
                                        )}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="participation_fee" className="block text-xs font-medium text-slate-600 mb-1.5">참가비 (원)</label>
                                    <input
                                        ref={participationFeeRef}
                                        type="number"
                                        id="participation_fee"
                                        name="participation_fee"
                                        value={participationFee}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setParticipationFee(value);
                                        }}
                                        min="0"
                                        placeholder="예: 10000"
                                        className={cn(
                                            "w-full text-sm border rounded-md px-3 py-2 placeholder-slate-400 focus:ring-1 transition-all duration-150",
                                            participationFee.trim()
                                                ? "bg-blue-50 border-blue-200 text-blue-900 focus:border-blue-400 focus:ring-blue-300"
                                                : "bg-slate-50/50 border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-slate-300"
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function ActivityPostForm({
    onSave,
    isEditing = false,
    loading = false,
    activityId,
    postId,
    initialData,
    initialContent
}: ActivityPostFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    // 사이드바 제거로 관련 state 없음

    // 기본 폼 데이터
    const getInitialThumbnail = () => {
        if (initialData?.thumbnail) {
            if (Array.isArray(initialData.thumbnail)) {
                return initialData.thumbnail;
            } else if (typeof initialData.thumbnail === 'string' && initialData.thumbnail) {
                return [initialData.thumbnail];
            }
        }
        return [];
    };

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        subtitle: initialData?.subtitle || initialData?.description || '',
        category: '',
        thumbnail: getInitialThumbnail(),
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
        // 편집 모드에서도 콘텐츠가 없으면 빈 문서로 시작 (defaultEditorContent 대신)
        return { type: "doc", content: [] };
    };

    const [content, setContent] = useState<JSONContent>(getInitialContent());
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isCreatingNewVersion, setIsCreatingNewVersion] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
    const [error, setError] = useState('');

    // 카테고리 데이터
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // 선택된 카테고리 id (셀렉트 박스 제어용)
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialData?.category_id ?? null);

    // 버전 관리 (새 스키마)
    const [versions, setVersions] = useState<Array<{
        id: number;
        version_number: number;
        version_code: string;
        parent_version_id?: number | null;
        created_at: string;
        updated_at: string;
        version_label?: string;
        title?: string;
        subtitle?: string;
    }>>([]);
    const [publishedVersionId, setPublishedVersionId] = useState<number | null>(null);
    const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [showVersionDropdown, setShowVersionDropdown] = useState(false);
    const versionDropdownRef = useRef<HTMLDivElement>(null);
    const newVersionDialogRef = useRef<HTMLDivElement>(null);
    const newVersionButtonRef = useRef<HTMLButtonElement>(null);
    const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
    const [editingVersionName, setEditingVersionName] = useState<string>('');
    const [isSavingVersionName, setIsSavingVersionName] = useState(false);
    const [showNewVersionDialog, setShowNewVersionDialog] = useState(false);
    const [newVersionName, setNewVersionName] = useState<string>('');
    const savedByEnterRef = useRef(false);
    const isButtonClickRef = useRef(false);
    // 새 스키마: status는 'draft', 'public', 'private'
    const [currentStatus, setCurrentStatus] = useState<'draft' | 'public' | 'private'>(() => {
        // 초기 데이터에서 status 가져오기 (기존 'published'는 'public'으로 매핑)
        const initialStatus = initialData?.status;
        if (initialStatus === 'published') return 'public';
        if (initialStatus === 'public' || initialStatus === 'private') return initialStatus;
        return 'draft';
    });

    // 활동 전용 상태
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [hasVoting, setHasVoting] = useState(initialData?.has_voting || false);
    const [voteOptions, setVoteOptions] = useState<{ id: string; text: string; votes: number }[]>(
        initialData?.vote_options || []
    );
    const [hasParticipation, setHasParticipation] = useState(
        !!(initialData?.max_participants || initialData?.participation_fee)
    );

    // 폼 필드 refs 및 state (화면 크기 변경 시에도 값 유지)
    const [activityLocation, setActivityLocation] = useState<string>(initialData?.location || '');
    const [contactInfo, setContactInfo] = useState<string>(initialData?.contact_info || '');
    const [maxParticipants, setMaxParticipants] = useState<string>((initialData?.max_participants?.toString() || ''));
    const [participationFee, setParticipationFee] = useState<string>((initialData?.participation_fee?.toString() || ''));

    // ref는 여전히 필요하지만 state와 동기화
    const locationRef = useRef<HTMLInputElement>(null);
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialData?.start_date ? new Date(initialData.start_date) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        initialData?.end_date ? new Date(initialData.end_date) : undefined
    );
    const [voteDeadline, setVoteDeadline] = useState<Date | undefined>(
        initialData?.vote_deadline ? new Date(initialData.vote_deadline) : undefined
    );
    const maxParticipantsRef = useRef<HTMLInputElement>(null);
    const participationFeeRef = useRef<HTMLInputElement>(null);
    const contactInfoRef = useRef<HTMLInputElement>(null);

    // 태그 추가
    const handleAddTag = useCallback(() => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setTagInput('');
        }
    }, [tagInput, tags]);

    // 태그 제거
    const handleRemoveTag = useCallback((index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    }, [tags]);

    // 카테고리 로드
    const loadData = useCallback(async () => {
        try {
            setLoadingData(true);
            const activityResponse = await fetch('/api/activities');
            if (activityResponse.ok) {
                const activityData = await activityResponse.json();
                setCategories(activityData.categories || []);
            }
        } catch {
            console.error('데이터 로드 오류');
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 버전 목록 로드 (편집 모드일 때만)
    const handleVersionSelect = useCallback(async (versionId: number | null) => {
        if (!versionId || !activityId) {
            setSelectedVersionId(null);
            setSelectedVersionCategoryId(null);
            // 현재 활동 데이터로 복원
            if (initialData) {
                setFormData({
                    title: initialData.title || '',
                    subtitle: initialData.subtitle || initialData.description || '',
                    category: '',
                    thumbnail: Array.isArray(initialData.thumbnail) ? initialData.thumbnail : (initialData.thumbnail ? [initialData.thumbnail] : []),
                    status: initialData.status || 'draft'
                });
                const dataContent = initialData.content as JSONContent;
                if (dataContent && dataContent.type === 'doc' && dataContent.content && dataContent.content.length > 0) {
                    setContent(dataContent);
                } else {
                    setContent({ type: "doc", content: [] });
                }
                setTags(initialData.tags || []);
                setHasVoting(initialData.has_voting || false);
                setVoteOptions(initialData.vote_options || []);
                setHasParticipation(!!(initialData.max_participants || initialData.participation_fee));
                setStartDate(initialData.start_date ? new Date(initialData.start_date) : undefined);
                setEndDate(initialData.end_date ? new Date(initialData.end_date) : undefined);
                setVoteDeadline(initialData.vote_deadline ? new Date(initialData.vote_deadline) : undefined);
                // state 값도 복원
                setActivityLocation(initialData.location || '');
                setContactInfo(initialData.contact_info || '');
                setMaxParticipants(initialData.max_participants?.toString() || '');
                setParticipationFee(initialData.participation_fee?.toString() || '');
            }
            return;
        }

        try {
            const response = await fetch(`/api/activities/${activityId}/versions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ version_id: versionId })
            });

            if (response.ok) {
                const data = await response.json();
                const version = data.version;

                setSelectedVersionId(versionId);
                setSelectedVersionCategoryId(version.category_id || null);
                setSelectedCategoryId(version.category_id || null);

                // 선택된 버전 데이터로 폼 채우기
                setFormData({
                    title: version.title || '',
                    subtitle: version.subtitle || '',
                    category: '',
                    thumbnail: Array.isArray(version.thumbnail) ? version.thumbnail : (version.thumbnail ? [version.thumbnail] : []),
                    status: 'draft'
                });
                const versionContent = version.content as JSONContent;
                if (versionContent && versionContent.type === 'doc' && versionContent.content && versionContent.content.length > 0) {
                    setContent(versionContent);
                } else {
                    setContent({ type: "doc", content: [] });
                }
                setTags(version.tags || []);
                setHasVoting(version.has_voting || false);
                setVoteOptions(version.vote_options || []);
                setHasParticipation(!!(version.max_participants || version.participation_fee));
                setStartDate(version.start_date ? new Date(version.start_date) : undefined);
                setEndDate(version.end_date ? new Date(version.end_date) : undefined);
                setVoteDeadline(version.vote_deadline ? new Date(version.vote_deadline) : undefined);

                // state 값 설정 (ref와 state 모두 업데이트, 값이 없으면 빈 값으로 설정)
                setActivityLocation(version.location || '');
                if (locationRef.current) {
                    locationRef.current.value = version.location || '';
                }

                setMaxParticipants(version.max_participants ? version.max_participants.toString() : '');
                if (maxParticipantsRef.current) {
                    maxParticipantsRef.current.value = version.max_participants ? version.max_participants.toString() : '';
                }

                setParticipationFee(version.participation_fee ? version.participation_fee.toString() : '');
                if (participationFeeRef.current) {
                    participationFeeRef.current.value = version.participation_fee ? version.participation_fee.toString() : '';
                }

                setContactInfo(version.contact_info || '');
                if (contactInfoRef.current) {
                    contactInfoRef.current.value = version.contact_info || '';
                }
            }
        } catch (error) {
            console.error('버전 데이터 로드 오류:', error);
            alert('버전 데이터를 불러오는데 실패했습니다.');
        }
    }, [activityId, initialData]);

    const fetchVersions = useCallback(async () => {
        if (!isEditing || !activityId) return;

        try {
            setLoadingVersions(true);
            console.log(`[DEBUG] 버전 조회 시도: activityId=${activityId}, typeof=${typeof activityId}`);
            const response = await fetch(`/api/activities/${activityId}/versions`);
            if (!response.ok) {
                // 404 또는 다른 에러가 발생해도 빈 배열로 처리
                console.warn(`버전 조회 실패 (status: ${response.status}), 활동 ID: ${activityId}`);
                const error = await response.json().catch(() => ({ error: '버전 조회에 실패했습니다.' }));
                console.error('Failed to fetch versions:', error);
                setVersions([]);
                // initialData에서 콘텐츠가 있으면 그대로 사용, 없으면 빈 콘텐츠로 초기화
                if (!initialData?.content) {
                    setContent({ type: "doc", content: [] });
                }
                return;
            }
            const data = await response.json();
            console.log('버전 목록 조회 성공:', {
                activityId,
                versionsCount: data.versions?.length || 0,
                publishedVersionId: data.published_version_id,
                versions: data.versions
            });

            // 버전 배열이 없거나 null이면 빈 배열로 설정
            const versionsArray = Array.isArray(data.versions) ? data.versions : [];
            setVersions(versionsArray);
            setPublishedVersionId(data.published_version_id || null);

            // 새 스키마: status 업데이트
            if (data.status) {
                const statusValue = data.status === 'published' ? 'public' : data.status;
                if (statusValue === 'public' || statusValue === 'private' || statusValue === 'draft') {
                    setCurrentStatus(statusValue);
                }
            }

            console.log('설정된 버전 목록:', versionsArray);

            // 새 스키마: published_version_id를 우선적으로 선택, 없으면 첫 번째 버전 선택
            if (versionsArray.length > 0) {
                let targetVersionId: number | null = null;
                let targetVersion: Record<string, unknown> | null = null;

                // 1. published_version_id가 있으면 우선 선택
                if (data.published_version_id) {
                    const publishedVersion = versionsArray.find((v: Record<string, unknown>) => v.id === data.published_version_id);
                    if (publishedVersion) {
                        targetVersionId = data.published_version_id;
                        targetVersion = publishedVersion;
                    }
                }

                // 2. published_version_id가 없으면 첫 번째 버전(최신) 선택
                if (!targetVersionId && versionsArray[0]) {
                    targetVersionId = versionsArray[0].id;
                    targetVersion = versionsArray[0];
                }

                // 선택된 버전이 있으면 로드
                if (targetVersionId && targetVersion) {
                    setSelectedVersionId(targetVersionId);

                    if (targetVersion.category_id) {
                        setSelectedVersionCategoryId(targetVersion.category_id as number);
                        setSelectedCategoryId(targetVersion.category_id as number);
                    }

                    // 버전 데이터를 로드하기 위해 handleVersionSelect 호출
                    setTimeout(() => {
                        handleVersionSelect(targetVersionId!);
                    }, 100);
                }
            } else {
                // 버전이 없고 initialData도 없는 경우 빈 콘텐츠로 초기화
                if (!initialData?.content) {
                    setContent({ type: "doc", content: [] });
                }
            }
        } catch (error) {
            console.error('버전 목록 로드 오류:', error);
        } finally {
            setLoadingVersions(false);
        }
    }, [isEditing, activityId, handleVersionSelect, initialData?.content]);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

    // 버전 복원 핸들러
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleVersionRestore = useCallback(async (versionId: number) => {
        if (!activityId) return;
        try {
            const response = await fetch(`/api/activities/${activityId}/versions/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version_id: versionId })
            });
            if (response.ok) {
                const data = await response.json();
                // 새로 생성된 버전을 선택하고 데이터 로드
                await handleVersionSelect(data.version_id);
                await fetchVersions();
                alert('버전이 복원되었습니다.');
            } else {
                const error = await response.json();
                alert(error.error || '버전 복원에 실패했습니다.');
            }
        } catch (error) {
            console.error('버전 복원 오류:', error);
            alert('버전 복원에 실패했습니다.');
        }
    }, [activityId, handleVersionSelect, fetchVersions]);

    // 버전 출판 핸들러
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleVersionPublish = useCallback(async (versionId: number) => {
        if (!activityId) return;
        try {
            const response = await fetch(`/api/activities/${activityId}/versions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version_id: versionId })
            });
            if (response.ok) {
                await fetchVersions();
                setCurrentStatus('public');
                alert('버전이 출판되었습니다.');
            } else {
                const error = await response.json();
                alert(error.error || '버전 출판에 실패했습니다.');
            }
        } catch (error) {
            console.error('버전 출판 오류:', error);
            alert('버전 출판에 실패했습니다.');
        }
    }, [activityId, fetchVersions]);

    // 새 버전 만들기 (명시적 버전 생성)
    const handleCreateNewVersion = useCallback(async (versionName?: string) => {
        if (!activityId) {
            alert('활동 ID가 없습니다.');
            return;
        }

        setIsCreatingNewVersion(true);
        try {
            let categoryId = 0;
            if (selectedCategoryId) {
                categoryId = selectedCategoryId;
            } else if (formData.category) {
                const category = categories.find(c => c.name === formData.category);
                categoryId = category?.id || 0;
            }

            const activityFormData = {
                title: formData.title,
                subtitle: formData.subtitle,
                category_id: categoryId,
                thumbnail: Array.isArray(formData.thumbnail) && formData.thumbnail.length > 0 ? formData.thumbnail : undefined,
                location: activityLocation.trim() || undefined,
                start_date: startDate ? startDate.toISOString() : undefined,
                end_date: endDate ? endDate.toISOString() : undefined,
                max_participants: hasParticipation && maxParticipants.trim() ? parseInt(maxParticipants) : undefined,
                participation_fee: hasParticipation && participationFee.trim() ? parseInt(participationFee) : undefined,
                contact_info: contactInfo.trim() || undefined,
                tags: tags.filter(tag => tag.trim()),
                has_voting: hasVoting,
                vote_options: hasVoting ? voteOptions.filter(option => option.text.trim()) : undefined,
                vote_deadline: hasVoting && voteDeadline ? voteDeadline.toISOString() : undefined,
                content: content,
            };

            // 새 버전 생성
            const draftResponse = await fetch(`/api/activities/${activityId}/draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...activityFormData,
                    version_label: versionName?.trim() || null
                })
            });

            if (!draftResponse.ok) {
                const error = await draftResponse.json();
                throw new Error(error.error || '새 버전 생성에 실패했습니다.');
            }

            const draftData = await draftResponse.json();
            await fetchVersions();

            // 새로 생성된 버전을 선택
            if (draftData.version_id) {
                await handleVersionSelect(draftData.version_id);
            }

            setCurrentStatus('draft');
            setShowNewVersionDialog(false);
            setNewVersionName('');
            alert('새 버전이 생성되었습니다.');
        } catch (err: unknown) {
            console.error('새 버전 생성 오류:', err);
            alert(err instanceof Error ? err.message : '새 버전 생성 중 오류가 발생했습니다.');
        } finally {
            setIsCreatingNewVersion(false);
        }
    }, [activityId, formData, selectedCategoryId, categories, activityLocation, startDate, endDate, hasParticipation, maxParticipants, participationFee, contactInfo, tags, hasVoting, voteOptions, voteDeadline, content, fetchVersions, handleVersionSelect]);

    // 새 버전 생성 버튼 클릭 핸들러
    const handleCreateNewVersionClick = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setShowNewVersionDialog(true);
        setNewVersionName('');
    }, []);

    // 버전 이름 가져오기 (version_label이 있으면 사용, 없으면 날짜/시간 형식)
    const getVersionDisplayName = useCallback((version: { version_label?: string; updated_at?: string; created_at?: string }) => {
        if (version.version_label && version.version_label.trim()) {
            return version.version_label.trim();
        }
        const date = new Date(version.updated_at || version.created_at || Date.now());
        return `${String(date.getFullYear()).slice(-2)}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }, []);

    // 버전 이름 편집 시작
    const handleStartEditVersionName = useCallback((versionId: number, currentName: string) => {
        setEditingVersionId(versionId);
        setEditingVersionName(currentName);
    }, []);

    // 버전 이름 편집 취소
    const handleCancelEditVersionName = useCallback(() => {
        setEditingVersionId(null);
        setEditingVersionName('');
    }, []);

    // 버전 이름 저장
    const handleSaveVersionName = useCallback(async (versionId: number) => {
        if (!activityId || isSavingVersionName) return;

        setIsSavingVersionName(true);
        try {
            const response = await fetch(`/api/activities/${activityId}/versions/${versionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version_label: editingVersionName.trim() || null
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '버전 이름 저장에 실패했습니다.');
            }

            await fetchVersions();
            setEditingVersionId(null);
            setEditingVersionName('');
            alert('버전 이름이 저장되었습니다.');
        } catch (err: unknown) {
            console.error('버전 이름 저장 오류:', err);
            alert(err instanceof Error ? err.message : '버전 이름 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSavingVersionName(false);
        }
    }, [activityId, editingVersionName, fetchVersions, isSavingVersionName]);

    // 버전 삭제 핸들러
    const handleVersionDelete = useCallback(async (versionId: number) => {
        if (!activityId) {
            console.error('버전 삭제 실패: activityId가 없습니다.');
            alert('활동 ID가 없어 버전을 삭제할 수 없습니다.');
            return;
        }

        // 버전 정보 확인
        const versionToDelete = versions.find(v => v.id === versionId);
        if (!versionToDelete) {
            console.error('버전 삭제 실패: 삭제할 버전을 찾을 수 없습니다.', { versionId, availableVersions: versions });
            alert('삭제할 버전을 찾을 수 없습니다.');
            return;
        }

        // 새 스키마: published_version_id로 설정된 버전은 삭제 불가
        if (publishedVersionId === versionId) {
            alert('출판 중인 버전은 삭제할 수 없습니다. 먼저 다른 버전을 출판하세요.');
            return;
        }

        // 현재 선택된 버전은 삭제 불가
        if (selectedVersionId === versionId) {
            alert('현재 선택된 버전은 삭제할 수 없습니다. 먼저 다른 버전을 선택하세요.');
            return;
        }

        if (!confirm('이 버전을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            // activityId와 versionId 확인
            console.log('버전 삭제 시도:', {
                activityId,
                versionId,
                activityIdType: typeof activityId,
                versionIdType: typeof versionId,
                versionData: versionToDelete
            });

            // activityId가 숫자인지 확인
            const numericActivityId = typeof activityId === 'number' ? activityId : parseInt(String(activityId));
            if (isNaN(numericActivityId)) {
                throw new Error(`유효하지 않은 활동 ID입니다: ${activityId}`);
            }

            const response = await fetch(`/api/activities/${numericActivityId}/versions/${versionId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                // 응답 본문을 텍스트로 먼저 읽어서 확인
                const responseText = await response.text();
                let errorData: { error?: string };

                try {
                    errorData = responseText ? JSON.parse(responseText) : {};
                } catch {
                    errorData = { error: responseText || '알 수 없는 오류가 발생했습니다.' };
                }

                console.error('버전 삭제 API 오류:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData,
                    responseText: responseText,
                    url: `/api/activities/${numericActivityId}/versions/${versionId}`
                });

                const errorMessage = errorData.error || `버전 삭제에 실패했습니다. (상태 코드: ${response.status})`;
                throw new Error(errorMessage);
            }

            await fetchVersions();

            // 삭제된 버전이 선택되어 있었으면 첫 번째 버전 선택
            if (selectedVersionId === versionId) {
                const newVersionsResponse = await fetch(`/api/activities/${numericActivityId}/versions`);
                if (newVersionsResponse.ok) {
                    const newVersionsData = await newVersionsResponse.json();
                    const firstVersion = newVersionsData.versions?.[0];
                    if (firstVersion) {
                        await handleVersionSelect(firstVersion.id);
                    }
                }
            }

            alert('버전이 삭제되었습니다.');
        } catch (err: unknown) {
            console.error('버전 삭제 오류:', err);
            const errorMessage = err instanceof Error ? err.message : '버전 삭제에 실패했습니다.';
            alert(errorMessage);
        }
    }, [activityId, versions, publishedVersionId, selectedVersionId, fetchVersions, handleVersionSelect]);

    // 상태 변경 핸들러
    // 새 스키마: status는 'draft', 'public', 'private'
    const handleStatusChange = useCallback(async (newStatus: 'public' | 'private') => {
        if (!activityId) return;
        try {
            // API는 기존 스키마 호환을 위해 'published'를 'public'으로 매핑
            const apiStatus = newStatus === 'public' ? 'public' : newStatus;

            const response = await fetch(`/api/activities/${activityId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: apiStatus })
            });

            if (response.ok) {
                setCurrentStatus(newStatus);
                const statusMessages: Record<string, string> = {
                    public: '공개',
                    private: '비공개'
                };
                alert(`상태가 ${statusMessages[newStatus] || newStatus}로 변경되었습니다.`);
                // 버전 목록 새로고침 (status 변경 반영)
                await fetchVersions();
            } else {
                const error = await response.json();
                alert(error.error || '상태 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('상태 변경 오류:', error);
            alert('상태 변경에 실패했습니다.');
        }
    }, [activityId, fetchVersions]);

    // 버전 드롭다운 및 새 버전 다이얼로그 외부 클릭 시 닫기
    useEffect(() => {
        let mouseDownTarget: HTMLElement | null = null;

        const handleMouseDown = (event: MouseEvent) => {
            // mousedown 시점의 타겟 저장
            mouseDownTarget = event.target as HTMLElement;
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (showVersionDropdown && versionDropdownRef.current) {
                const target = event.target as HTMLElement;

                // input 요소 내부 클릭인지 확인
                const isInputElement = target.tagName === 'INPUT' || target.closest('input') !== null;

                // 드롭다운 내부 클릭인지 확인
                const isInsideDropdown = versionDropdownRef.current.contains(target);

                // 텍스트 선택 중인지 확인 (mousedown과 mouseup이 같은 요소에서 발생했는지 확인)
                const selection = window.getSelection();
                const hasSelection = selection && selection.toString().length > 0;
                const isTextSelection = hasSelection && mouseDownTarget && (
                    mouseDownTarget.tagName === 'INPUT' ||
                    mouseDownTarget.closest('input') !== null ||
                    versionDropdownRef.current.contains(mouseDownTarget)
                );

                // 드롭다운 내부 클릭이거나 input 요소 클릭이거나 텍스트 선택 중인 경우 드롭다운 유지
                if (!isInsideDropdown && !isInputElement && !isTextSelection) {
                    setShowVersionDropdown(false);
                }

                mouseDownTarget = null;
            }

            // 새 버전 다이얼로그 외부 클릭 시 닫기
            if (showNewVersionDialog && newVersionDialogRef.current) {
                const target = event.target as HTMLElement;
                // 다이얼로그 내부 클릭인지 확인 (ref를 사용하여 정확히 확인)
                const isInsideDialog = newVersionDialogRef.current.contains(target);

                // 다이얼로그 내부가 아닌 경우에만 처리
                if (!isInsideDialog) {
                    // 외부 클릭인 경우, 새 버전 버튼(다이얼로그 외부) 클릭인지 확인
                    const clickedButton = target.closest('button');
                    const buttonText = clickedButton?.textContent?.trim() || '';
                    const hasPlusIcon = clickedButton?.querySelector('svg');

                    // ref를 사용하여 버튼 클릭을 정확히 감지 (모바일/데스크톱 버튼 모두)
                    const isNewVersionButtonRef = newVersionButtonRef.current && (
                        clickedButton === newVersionButtonRef.current ||
                        newVersionButtonRef.current.contains(target) ||
                        (target.closest('button') === newVersionButtonRef.current)
                    );

                    const isNewVersionButton = isNewVersionButtonRef || (clickedButton && (
                        (buttonText.includes('새 버전') && !newVersionDialogRef.current.contains(clickedButton)) ||
                        (buttonText === '+ 새 버전' && !newVersionDialogRef.current.contains(clickedButton)) ||
                        (hasPlusIcon && !newVersionDialogRef.current.contains(clickedButton) && clickedButton.title === '새 버전 만들기') // Plus 아이콘 버튼 (다이얼로그 외부)
                    ));

                    // 새 버전 버튼이 아닌 외부 클릭이면 다이얼로그 닫기
                    if (!isNewVersionButton) {
                        setShowNewVersionDialog(false);
                        setNewVersionName('');
                    }
                }
            }
        };

        if (showVersionDropdown || showNewVersionDialog) {
            // mousedown 이벤트 리스너 추가 (텍스트 선택 감지용)
            document.addEventListener('mousedown', handleMouseDown, true);

            // setTimeout을 사용하여 React의 onClick 핸들러가 먼저 실행되도록 지연 처리
            const timeoutId = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 0);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleMouseDown, true);
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [showVersionDropdown, showNewVersionDialog]);

    // 선택된 버전의 category_id 저장
    const [selectedVersionCategoryId, setSelectedVersionCategoryId] = useState<number | null>(null);

    // 편집 진입 시 초기 category_id를 기본 선택값으로 반영 (버전 선택 전에도 동작)
    useEffect(() => {
        if (isEditing && initialData?.category_id && selectedVersionCategoryId === null) {
            setSelectedVersionCategoryId(initialData.category_id);
            setSelectedCategoryId(initialData.category_id);
        }
    }, [isEditing, initialData?.category_id, selectedVersionCategoryId]);

    // category_id를 category name으로 변환 (편집 시 및 버전 선택 시)
    useEffect(() => {
        const categoryId = selectedVersionCategoryId || initialData?.category_id || selectedCategoryId || null;
        if (categoryId && categories.length > 0) {
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                setFormData(prev => {
                    if (prev.category === category.name) return prev;
                    return { ...prev, category: category.name };
                });
                if (selectedCategoryId !== categoryId) setSelectedCategoryId(categoryId);
            }
        }
    }, [selectedVersionCategoryId, initialData?.category_id, categories, selectedCategoryId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const id = value ? Number(value) : null;
        setSelectedCategoryId(id);
        if (id && categories.length > 0) {
            const category = categories.find(c => c.id === id);
            if (category) {
                setFormData(prev => ({ ...prev, category: category.name }));
            }
        } else {
            setFormData(prev => ({ ...prev, category: '' }));
        }
    };

    // 여러 이미지 업로드
    const handleMultipleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }

        setUploadingImage(true);
        setError('');

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`이미지 크기는 10MB 이하여야 합니다: ${file.name}`);
                }

                if (!file.type.startsWith('image/')) {
                    throw new Error(`이미지 파일만 업로드 가능합니다: ${file.name}`);
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', user?.id || '');

                const response = await fetch('/api/upload/image', {
                    method: 'POST',
                    headers: {
                        'x-post-type': 'activities',
                        'x-post-id': postId || activityId ? String(postId || activityId) : '',
                    },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.url;
                } else {
                    throw new Error(`이미지 업로드에 실패했습니다: ${file.name}`);
                }
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            const currentThumbnails = Array.isArray(formData.thumbnail) ? formData.thumbnail : [];
            setFormData(prev => ({
                ...prev,
                thumbnail: [...currentThumbnails, ...uploadedUrls]
            }));
        } catch (err: unknown) {
            setError((err as Error).message || '이미지 업로드에 실패했습니다.');
        } finally {
            setUploadingImage(false);
            event.target.value = '';
        }
    };

    // 개별 이미지 삭제
    const removeThumbnailAt = (index: number) => {
        if (Array.isArray(formData.thumbnail)) {
            const newThumbnails = formData.thumbnail.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, thumbnail: newThumbnails }));
            setSelectedImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(index);
                const adjustedSet = new Set<number>();
                newSet.forEach(i => {
                    if (i < index) adjustedSet.add(i);
                    else if (i > index) adjustedSet.add(i - 1);
                });
                return adjustedSet;
            });
        }
    };

    // 선택된 이미지들 일괄 삭제
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const removeSelectedThumbnails = () => {
        if (Array.isArray(formData.thumbnail)) {
            const newThumbnails = formData.thumbnail.filter((_, i) => !selectedImages.has(i));
            setFormData(prev => ({ ...prev, thumbnail: newThumbnails }));
            setSelectedImages(new Set());
        }
    };

    // 이미지 선택 토글
    const toggleImageSelection = (index: number) => {
        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

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

    // 일반 저장 (현재 버전만 업데이트, 새 버전 생성 안 함)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleSimpleSave = async () => {
        if (!activityId) {
            alert('활동 ID가 없습니다.');
            return;
        }

        setIsSavingDraft(true);
        try {
            let categoryId = 0;
            if (selectedCategoryId) {
                categoryId = selectedCategoryId;
            } else if (formData.category) {
                const category = categories.find(c => c.name === formData.category);
                categoryId = category?.id || 0;
            }

            const activityFormData = {
                title: formData.title,
                subtitle: formData.subtitle,
                category_id: categoryId,
                thumbnail: Array.isArray(formData.thumbnail) && formData.thumbnail.length > 0 ? formData.thumbnail : undefined,
                location: activityLocation.trim() || undefined,
                start_date: startDate ? startDate.toISOString() : undefined,
                end_date: endDate ? endDate.toISOString() : undefined,
                max_participants: hasParticipation && maxParticipants.trim() ? parseInt(maxParticipants) : undefined,
                participation_fee: hasParticipation && participationFee.trim() ? parseInt(participationFee) : undefined,
                contact_info: contactInfo.trim() || undefined,
                tags: tags.filter(tag => tag.trim()),
                has_voting: hasVoting,
                vote_options: hasVoting ? voteOptions.filter(option => option.text.trim()) : undefined,
                vote_deadline: hasVoting && voteDeadline ? voteDeadline.toISOString() : undefined,
                content: content,
            };

            const response = await fetch(`/api/activities/${activityId}/save`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityFormData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '저장에 실패했습니다.');
            }

            alert('저장되었습니다.');
        } catch (err: unknown) {
            console.error('저장 오류:', err);
            alert(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
        } finally {
            setIsSavingDraft(false);
        }
    };

    // 버전 스냅샷 생성
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleVersionSave = async () => {
        if (!activityId) {
            alert('활동 ID가 없습니다.');
            return;
        }

        setIsSavingDraft(true);
        try {
            const response = await fetch(`/api/activities/${activityId}/version`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version_label: prompt('버전 이름을 입력하세요 (선택사항):') || undefined
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '버전 저장에 실패했습니다.');
            }

            await fetchVersions(); // 버전 목록 새로고침
            alert('버전이 저장되었습니다.');
        } catch (err: unknown) {
            console.error('버전 저장 오류:', err);
            alert(err instanceof Error ? err.message : '버전 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSavingDraft(false);
        }
    };

    // 출판/재출판 처리
    const handlePublish = async () => {
        if (isEditing && !activityId) {
            alert('활동 ID가 없습니다.');
            return;
        }

        const validationErrors = [];
        if (!formData.title.trim()) {
            validationErrors.push('제목을 입력해주세요.');
        }
        if (!formData.subtitle.trim()) {
            validationErrors.push('소제목을 입력해주세요.');
        }
        if (!formData.category && !selectedCategoryId) {
            validationErrors.push('카테고리를 선택해주세요.');
        }
        if (validationErrors.length > 0) {
            alert(validationErrors[0]);
            return;
        }

        setIsPublishing(true);
        try {
            let categoryId = 0;
            if (selectedCategoryId) {
                categoryId = selectedCategoryId;
            } else if (formData.category) {
                const category = categories.find(c => c.name === formData.category);
                categoryId = category?.id || 0;
            }

            // 편집 모드: 현재 버전을 출판 상태로만 변경 (재출판하기)
            if (isEditing) {
                // 먼저 현재 버전의 내용을 업데이트 (수정사항 반영)
                const activityFormData = {
                    title: formData.title,
                    subtitle: formData.subtitle,
                    category_id: categoryId,
                    thumbnail: Array.isArray(formData.thumbnail) && formData.thumbnail.length > 0 ? formData.thumbnail : undefined,
                    location: activityLocation.trim() || undefined,
                    start_date: startDate ? startDate.toISOString() : undefined,
                    end_date: endDate ? endDate.toISOString() : undefined,
                    max_participants: hasParticipation && maxParticipants.trim() ? parseInt(maxParticipants) : undefined,
                    participation_fee: hasParticipation && participationFee.trim() ? parseInt(participationFee) : undefined,
                    contact_info: contactInfo.trim() || undefined,
                    tags: tags.filter(tag => tag.trim()),
                    has_voting: hasVoting,
                    vote_options: hasVoting ? voteOptions.filter(option => option.text.trim()) : undefined,
                    vote_deadline: hasVoting && voteDeadline ? voteDeadline.toISOString() : undefined,
                    content: content,
                };

                // 선택된 버전 업데이트 (수정하기)
                if (!selectedVersionId) {
                    throw new Error('선택된 버전이 없습니다.');
                }

                const saveResponse = await fetch(`/api/activities/${activityId}/save`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...activityFormData,
                        version_id: selectedVersionId  // 새 스키마: 버전 ID 명시
                    })
                });

                if (!saveResponse.ok) {
                    throw new Error('버전 업데이트에 실패했습니다.');
                }

                // 새 스키마: 선택된 버전 ID 사용
                if (!selectedVersionId) {
                    throw new Error('선택된 버전이 없습니다.');
                }

                // 선택된 버전을 출판 버전으로 설정 (재출판)
                const publishResponse = await fetch(`/api/activities/${activityId}/versions`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ version_id: selectedVersionId })
                });

                if (!publishResponse.ok) {
                    const errorData = await publishResponse.json().catch(() => ({ error: '알 수 없는 오류' }));
                    console.error('재출판 API 오류:', {
                        status: publishResponse.status,
                        statusText: publishResponse.statusText,
                        error: errorData
                    });
                    throw new Error(errorData.error || '재출판에 실패했습니다.');
                }

                setCurrentStatus('public');
                await fetchVersions();
                alert('재출판되었습니다!');

                // 재출판 후 게시판 페이지로 리다이렉트
                const referrer = document.referrer;
                if (referrer && (referrer.includes('/activities/') || referrer.includes('/admin'))) {
                    if (window.history.length > 1) {
                        router.back();
                    } else {
                        router.push(referrer.includes('/admin') ? '/admin' : '/activities');
                    }
                } else {
                    router.push('/activities');
                }
                return;
            }

            // 새 게시물 작성: 일반 저장 (onSave 호출)
            const activityFormData: ActivityPostFormData = {
                title: formData.title,
                subtitle: formData.subtitle,
                category_id: categoryId,
                thumbnail: Array.isArray(formData.thumbnail) && formData.thumbnail.length > 0 ? formData.thumbnail : undefined,
                status: 'published',
                location: locationRef.current?.value || undefined,
                start_date: startDate ? startDate.toISOString() : undefined,
                end_date: endDate ? endDate.toISOString() : undefined,
                max_participants: hasParticipation && maxParticipantsRef.current?.value ? parseInt(maxParticipantsRef.current.value) : undefined,
                participation_fee: hasParticipation && participationFeeRef.current?.value ? parseInt(participationFeeRef.current.value) : undefined,
                contact_info: contactInfoRef.current?.value || undefined,
                tags: tags.filter(tag => tag.trim()),
                has_voting: hasVoting,
                vote_options: hasVoting ? voteOptions.filter(option => option.text.trim()) : undefined,
                vote_deadline: hasVoting && voteDeadline ? voteDeadline.toISOString() : undefined,
            };

            await onSave(activityFormData, content);

            const finalPostId = postId || activityId;
            if (finalPostId) {
                window.localStorage.setItem(`novel-${finalPostId}-saved`, 'true');
            }
            setCurrentStatus('public');
        } catch (err: unknown) {
            console.error('출판 오류:', err);
            alert(err instanceof Error ? err.message : '출판 중 오류가 발생했습니다.');
        } finally {
            setIsPublishing(false);
        }
    };

    // 임시저장 처리 (새 버전 생성)
    const handleSaveDraft = async () => {
        if (isEditing && !activityId) {
            alert('활동 ID가 없습니다.');
            return;
        }

        // 새 게시물 작성 시 필수 입력값 검증
        if (!isEditing) {
            const validationErrors = [];
            if (!formData.title.trim()) {
                validationErrors.push('제목을 입력해주세요.');
            }
            if (!formData.subtitle.trim()) {
                validationErrors.push('소제목을 입력해주세요.');
            }
            if (!formData.category && !selectedCategoryId) {
                validationErrors.push('카테고리를 선택해주세요.');
            }
            if (validationErrors.length > 0) {
                alert(validationErrors[0]);
                return;
            }
        }

        setIsSavingDraft(true);
        try {
            let categoryId = 0;
            if (selectedCategoryId) {
                categoryId = selectedCategoryId;
            } else if (formData.category) {
                const category = categories.find(c => c.name === formData.category);
                categoryId = category?.id || 0;
            }

            const activityFormData = {
                title: formData.title,
                subtitle: formData.subtitle,
                category_id: categoryId,
                thumbnail: Array.isArray(formData.thumbnail) && formData.thumbnail.length > 0 ? formData.thumbnail : undefined,
                location: activityLocation.trim() || undefined,
                start_date: startDate ? startDate.toISOString() : undefined,
                end_date: endDate ? endDate.toISOString() : undefined,
                max_participants: hasParticipation && maxParticipants.trim() ? parseInt(maxParticipants) : undefined,
                participation_fee: hasParticipation && participationFee.trim() ? parseInt(participationFee) : undefined,
                contact_info: contactInfo.trim() || undefined,
                tags: tags.filter(tag => tag.trim()),
                has_voting: hasVoting,
                vote_options: hasVoting ? voteOptions.filter(option => option.text.trim()) : undefined,
                vote_deadline: hasVoting && voteDeadline ? voteDeadline.toISOString() : undefined,
                content: content,
            };

            // 편집 모드: 현재 버전 덮어쓰기 (수정하기)
            if (isEditing) {
                if (!selectedVersionId) {
                    alert('수정할 버전을 선택해주세요.');
                    setIsSavingDraft(false);
                    return;
                }

                // version_id를 포함하여 전송
                const saveResponse = await fetch(`/api/activities/${activityId}/save`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...activityFormData,
                        version_id: selectedVersionId
                    })
                });

                if (!saveResponse.ok) {
                    throw new Error('수정에 실패했습니다.');
                }

                await fetchVersions();
                setCurrentStatus('draft');
                alert('수정되었습니다.');

                // 수정 폼에서 현재 위치 유지 (페이지 이동하지 않음)
                return;
            }

            // 새 게시물 작성: 일반 저장 (onSave 호출)
            const finalFormData: ActivityPostFormData = {
                ...activityFormData,
                status: 'draft'
            };

            await onSave(finalFormData, content);

            const finalPostId = postId || activityId;
            if (finalPostId) {
                window.localStorage.setItem(`novel-${finalPostId}-saved`, 'true');
            }

            // 이전 페이지로 이동
            const referrer = document.referrer;
            if (referrer && (referrer.includes('/activities/') || referrer.includes('/admin'))) {
                if (window.history.length > 1) {
                    router.back();
                } else {
                    router.push(referrer.includes('/admin') ? '/admin' : '/activities');
                }
            } else {
                router.push('/activities');
            }
        } catch (err: unknown) {
            console.error('임시저장 오류:', err);
            alert(err instanceof Error ? err.message : '임시저장 중 오류가 발생했습니다.');
        } finally {
            setIsSavingDraft(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getTitle = () => {
        if (isEditing) return '게시물 수정하기';
        return '새 학회활동 게시물 추가하기';
    };

    // 사이드바 관련 이펙트 제거

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
                                            게시물의 카테고리, 날짜, 장소, 태그 등 상세 설정을 변경할 수 있습니다.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-4">
                                        <LeftSettingsPanel
                                            selectedCategoryId={selectedCategoryId}
                                            handleCategoryChange={handleCategoryChange}
                                            loadingData={loadingData}
                                            categories={categories}
                                            startDate={startDate}
                                            setStartDate={setStartDate}
                                            endDate={endDate}
                                            setEndDate={setEndDate}
                                            locationRef={locationRef}
                                            initialData={initialData}
                                            contactInfoRef={contactInfoRef}
                                            tagInput={tagInput}
                                            setTagInput={setTagInput}
                                            handleAddTag={handleAddTag}
                                            tags={tags}
                                            handleRemoveTag={handleRemoveTag}
                                            hasVoting={hasVoting}
                                            setHasVoting={setHasVoting}
                                            addVoteOption={addVoteOption}
                                            voteOptions={voteOptions}
                                            updateVoteOption={updateVoteOption}
                                            removeVoteOption={removeVoteOption}
                                            voteDeadline={voteDeadline}
                                            setVoteDeadline={setVoteDeadline}
                                            hasParticipation={hasParticipation}
                                            setHasParticipation={setHasParticipation}
                                            maxParticipantsRef={maxParticipantsRef}
                                            participationFeeRef={participationFeeRef}
                                            activityLocation={activityLocation}
                                            setActivityLocation={setActivityLocation}
                                            contactInfo={contactInfo}
                                            setContactInfo={setContactInfo}
                                            maxParticipants={maxParticipants}
                                            setMaxParticipants={setMaxParticipants}
                                            participationFee={participationFee}
                                            setParticipationFee={setParticipationFee}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                        {/* 상단 고정 헤더 (네비게이션 바를 대체) */}
                        <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm lg:col-span-12">
                            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
                                {/* 데스크톱: 1행 레이아웃, 모바일: 1행 컴팩트 레이아웃 */}
                                <div className="flex flex-row items-center justify-between gap-1 sm:gap-4">
                                    {/* 왼쪽 영역: 뒤로가기 + 버전 관리 + 상태 전환 */}
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

                                        {/* 데스크톱: 편집 모드일 때 표시 (모바일에서는 3행으로 이동) */}
                                        {isEditing && activityId && (
                                            <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                {/* 새 버전 만들기 */}
                                                <div className="relative">
                                                    <button
                                                        ref={newVersionButtonRef}
                                                        onClick={handleCreateNewVersionClick}
                                                        disabled={isSavingDraft || isPublishing || isCreatingNewVersion || loading || showNewVersionDialog}
                                                        className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 whitespace-nowrap flex items-center gap-1"
                                                    >
                                                        {isCreatingNewVersion ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400/30 border-t-blue-600"></div>
                                                                <span className="hidden sm:inline">생성 중...</span>
                                                            </>
                                                        ) : (
                                                            <span>+ 새 버전</span>
                                                        )}
                                                    </button>
                                                    {/* 새 버전 이름 입력 폼 (드롭다운 방식) */}
                                                    {showNewVersionDialog && (
                                                        <div ref={newVersionDialogRef} className="absolute top-full mt-2 left-0 sm:left-2 w-[200px] sm:w-[240px] bg-white border border-blue-300 rounded-lg shadow-xl z-50 p-2.5" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                                                            <div className="mb-2">
                                                                <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-1.5">
                                                                    버전 이름 (선택사항)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={newVersionName}
                                                                    onChange={(e) => setNewVersionName(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleCreateNewVersion(newVersionName);
                                                                        } else if (e.key === 'Escape') {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setShowNewVersionDialog(false);
                                                                            setNewVersionName('');
                                                                        }
                                                                    }}
                                                                    placeholder="이름 미입력 시 자동 지정"
                                                                    autoFocus
                                                                    className="w-full px-2 py-1.5 text-[10px] sm:text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                                <p className="text-[9px] text-slate-500 mt-1">
                                                                    이름 미입력 시 날짜/시간 형식 자동 지정
                                                                </p>
                                                            </div>
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setShowNewVersionDialog(false);
                                                                        setNewVersionName('');
                                                                    }}
                                                                    className="px-2 py-1 text-[10px] sm:text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                                                >
                                                                    취소
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleCreateNewVersion(newVersionName);
                                                                    }}
                                                                    disabled={isCreatingNewVersion || isPublishing}
                                                                    className="px-2 py-1 text-[10px] sm:text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {isCreatingNewVersion ? '생성 중...' : '생성'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* 버전 선택 */}
                                                <div ref={versionDropdownRef} className="relative flex items-center gap-1">
                                                    <button
                                                        onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                                                        disabled={loadingVersions || versions.length === 0}
                                                        className="text-[10px] sm:text-xs border border-slate-200 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-slate-900 bg-white hover:bg-slate-50 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed w-[180px] sm:w-[220px] flex items-center justify-between gap-1 sm:gap-2 whitespace-nowrap"
                                                        title="버전 선택"
                                                    >
                                                        <span className="truncate flex items-center gap-1.5 flex-shrink-0 min-w-0">
                                                            {selectedVersionId ? (
                                                                (() => {
                                                                    const selected = versions.find(v => v.id === selectedVersionId);
                                                                    if (!selected) return <span className="text-[10px] sm:text-xs">버전 선택</span>;
                                                                    const versionCode = selected.version_code || `v${selected.version_number}`;
                                                                    const isPublished = publishedVersionId === selected.id;
                                                                    const displayName = getVersionDisplayName(selected);
                                                                    return (
                                                                        <>
                                                                            {/* 출판 중인 버전: 초록색 점 아이콘 */}
                                                                            <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${isPublished ? 'bg-green-500' : 'bg-transparent'}`} />
                                                                            {/* 새 스키마: version_code 표시 (이름 앞에) */}
                                                                            <span className="inline-flex items-center px-0.5 sm:px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                                                                                {versionCode}
                                                                            </span>
                                                                            <span className="truncate text-[10px] sm:text-xs">{displayName}</span>
                                                                        </>
                                                                    );
                                                                })()
                                                            ) : (
                                                                <span className="text-[10px] sm:text-xs">버전 선택</span>
                                                            )}
                                                        </span>
                                                        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${showVersionDropdown ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {showVersionDropdown && versions.length > 0 && (
                                                        <div className="absolute top-full mt-2 left-0 w-[180px] sm:w-[220px] bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                            {versions.map((version, index) => {
                                                                const isPublished = publishedVersionId === version.id;
                                                                return (
                                                                    <div
                                                                        key={version.id}
                                                                        className={`w-full flex items-center justify-between gap-2 ${index === 0 ? 'rounded-t-xl' : ''
                                                                            } ${index === versions.length - 1 ? 'rounded-b-xl' : ''
                                                                            } ${selectedVersionId === version.id
                                                                                ? "bg-slate-100"
                                                                                : ""
                                                                            }`}
                                                                    >
                                                                        {editingVersionId === version.id ? (
                                                                            <div className="flex-1 px-3 py-2 flex items-center gap-1.5">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editingVersionName}
                                                                                    onChange={(e) => setEditingVersionName(e.target.value)}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            savedByEnterRef.current = true;
                                                                                            handleSaveVersionName(version.id);
                                                                                        } else if (e.key === 'Escape') {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            savedByEnterRef.current = false;
                                                                                            handleCancelEditVersionName();
                                                                                        }
                                                                                    }}
                                                                                    onMouseDown={(e) => {
                                                                                        // input 내부 클릭은 버튼 클릭이 아님
                                                                                        // 드롭다운이 닫히지 않도록 이벤트 전파 중단
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                    onSelect={(e) => {
                                                                                        // 텍스트 선택 중에는 드롭다운이 닫히지 않도록
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                    onBlur={() => {
                                                                                        // 버튼 클릭이 아니고 Enter 키로 저장한 경우가 아니면 저장
                                                                                        if (!isButtonClickRef.current && !savedByEnterRef.current) {
                                                                                            // setTimeout을 사용하여 다른 이벤트가 먼저 처리되도록 함
                                                                                            setTimeout(() => {
                                                                                                if (!isButtonClickRef.current) {
                                                                                                    handleSaveVersionName(version.id);
                                                                                                }
                                                                                                isButtonClickRef.current = false;
                                                                                            }, 150);
                                                                                        } else {
                                                                                            isButtonClickRef.current = false;
                                                                                        }
                                                                                        savedByEnterRef.current = false;
                                                                                    }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    autoFocus
                                                                                    className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                                    placeholder="버전 이름"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    if (e.detail === 2) {
                                                                                        // 더블 클릭 시 편집 모드
                                                                                        const displayName = getVersionDisplayName(version);
                                                                                        handleStartEditVersionName(version.id, displayName);
                                                                                    } else {
                                                                                        // 단일 클릭 시 버전 선택
                                                                                        handleVersionSelect(version.id);
                                                                                        setShowVersionDropdown(false);
                                                                                    }
                                                                                }}
                                                                                onDoubleClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    const displayName = getVersionDisplayName(version);
                                                                                    handleStartEditVersionName(version.id, displayName);
                                                                                }}
                                                                                className={`flex-1 px-3 py-2 text-left text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap min-w-0 ${selectedVersionId === version.id
                                                                                    ? "text-slate-900"
                                                                                    : "text-slate-700 hover:bg-slate-50"
                                                                                    }`}
                                                                                title="더블 클릭하여 이름 편집"
                                                                            >
                                                                                {/* 출판 중인 버전: 초록색 점 아이콘, 아닌 경우 투명 점으로 공간 확보 (정렬 유지) */}
                                                                                <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${isPublished ? 'bg-green-500' : 'bg-transparent'}`} />
                                                                                {/* 새 스키마: version_code 표시 (이름 앞에) */}
                                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                                                                                    {version.version_code || `v${version.version_number}`}
                                                                                </span>
                                                                                <span className="truncate">
                                                                                    {getVersionDisplayName(version)}
                                                                                </span>
                                                                            </button>
                                                                        )}
                                                                        {/* 버전 액션 버튼 (편집 또는 삭제) */}
                                                                        <div className="flex items-center gap-1 mr-2 flex-shrink-0">
                                                                            {/* 선택된 버전: 편집 버튼 표시 */}
                                                                            {selectedVersionId === version.id && editingVersionId !== version.id && (
                                                                                <button
                                                                                    onMouseDown={(e) => {
                                                                                        // 버튼 클릭 플래그 설정
                                                                                        isButtonClickRef.current = true;
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        const displayName = getVersionDisplayName(version);
                                                                                        handleStartEditVersionName(version.id, displayName);
                                                                                    }}
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                    className="px-2 py-1 text-xs text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors"
                                                                                    title="이름 편집"
                                                                                >
                                                                                    <PenTool className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            )}
                                                                            {/* 삭제 버튼 (출판 중인 버전 및 현재 선택된 버전 제외) */}
                                                                            {publishedVersionId !== version.id && selectedVersionId !== version.id && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        handleVersionDelete(version.id);
                                                                                        setShowVersionDropdown(false);
                                                                                    }}
                                                                                    className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                                                    title="버전 삭제"
                                                                                >
                                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* 출판된 버전이 선택되었을 때만 상태 전환 버튼 표시 (데스크톱) */}
                                                {selectedVersionId && selectedVersionId === publishedVersionId && (
                                                    currentStatus === 'public' ? (
                                                        <button
                                                            onClick={() => handleStatusChange('private')}
                                                            disabled={isSavingDraft || isPublishing || isCreatingNewVersion || loading}
                                                            className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 whitespace-nowrap flex items-center gap-1"
                                                        >
                                                            <EyeOff className="w-3 h-3" />
                                                            비공개로 전환
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusChange('public')}
                                                            disabled={isSavingDraft || isPublishing || isCreatingNewVersion || loading}
                                                            className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-green-200 whitespace-nowrap flex items-center gap-1"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            공개로 전환
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* 모바일: 버전 관리 버튼들 */}
                                        {isEditing && activityId && (
                                            <div className="flex sm:hidden items-center gap-1">
                                                {/* 새 버전 만들기 */}
                                                <div className="relative">
                                                    <button
                                                        ref={newVersionButtonRef}
                                                        onClick={handleCreateNewVersionClick}
                                                        disabled={isSavingDraft || isPublishing || isCreatingNewVersion || loading || showNewVersionDialog}
                                                        className="p-2 sm:px-2 sm:py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 flex items-center justify-center"
                                                        title="새 버전 만들기"
                                                    >
                                                        {isCreatingNewVersion ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400/30 border-t-blue-600"></div>
                                                        ) : (
                                                            <>
                                                                <Plus className="w-4 h-4 sm:hidden" />
                                                                <GitBranch className="hidden sm:block w-3.5 h-3.5" />
                                                            </>
                                                        )}
                                                    </button>
                                                    {/* 새 버전 이름 입력 폼 */}
                                                    {showNewVersionDialog && (
                                                        <div ref={newVersionDialogRef} className="absolute top-full mt-2 left-0 w-[200px] bg-white border border-blue-300 rounded-lg shadow-xl z-50 p-2.5" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                                                            <div className="mb-2">
                                                                <label className="block text-[10px] font-medium text-slate-700 mb-1.5">
                                                                    버전 이름 (선택사항)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={newVersionName}
                                                                    onChange={(e) => setNewVersionName(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            handleCreateNewVersion(newVersionName);
                                                                        } else if (e.key === 'Escape') {
                                                                            e.preventDefault();
                                                                            setShowNewVersionDialog(false);
                                                                            setNewVersionName('');
                                                                        }
                                                                    }}
                                                                    placeholder="이름 미입력 시 자동 지정"
                                                                    autoFocus
                                                                    className="w-full px-2 py-1.5 text-[10px] border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                                <p className="text-[9px] text-slate-500 mt-1">
                                                                    이름 미입력 시 날짜/시간 형식 자동 지정
                                                                </p>
                                                            </div>
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => {
                                                                        setShowNewVersionDialog(false);
                                                                        setNewVersionName('');
                                                                    }}
                                                                    className="px-2 py-1 text-[10px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                                                >
                                                                    취소
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCreateNewVersion(newVersionName)}
                                                                    disabled={isCreatingNewVersion || isPublishing}
                                                                    className="px-2 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {isCreatingNewVersion ? '생성 중...' : '생성'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* 버전 선택 */}
                                                <div ref={versionDropdownRef} className="relative">
                                                    <button
                                                        onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                                                        disabled={loadingVersions || versions.length === 0}
                                                        className="px-2 sm:px-2 sm:px-2.5 py-2 sm:py-1.5 text-[11px] sm:text-[10px] border border-slate-200 rounded-lg text-slate-900 bg-white hover:bg-slate-50 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-1.5 min-w-[60px] sm:min-w-[180px] max-w-[80px] sm:max-w-[220px]"
                                                        title="버전 선택"
                                                    >
                                                        <span className="truncate flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0 min-w-0">
                                                            {selectedVersionId ? (
                                                                (() => {
                                                                    const selected = versions.find(v => v.id === selectedVersionId);
                                                                    if (!selected) return <span className="text-[9px] sm:text-[10px]">버전</span>;
                                                                    const versionCode = selected.version_code || `v${selected.version_number}`;
                                                                    const isPublished = publishedVersionId === selected.id;
                                                                    return (
                                                                        <>
                                                                            <span className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${isPublished ? 'bg-green-500' : 'bg-transparent'}`} />
                                                                            <span className="hidden sm:inline-flex items-center px-0.5 sm:px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                                                                                {versionCode}
                                                                            </span>
                                                                            <span className="text-[10px] sm:hidden font-medium">{versionCode}</span>
                                                                            <span className="hidden sm:inline truncate text-[10px] sm:text-xs">{getVersionDisplayName(selected)}</span>
                                                                        </>
                                                                    );
                                                                })()
                                                            ) : (
                                                                <span className="text-[9px] sm:text-[10px]">버전</span>
                                                            )}
                                                        </span>
                                                        <ChevronDown className={`w-3.5 h-3.5 sm:w-3 sm:h-3.5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${showVersionDropdown ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {/* 버전 드롭다운 메뉴 */}
                                                    {showVersionDropdown && versions.length > 0 && (
                                                        <div className="absolute top-full mt-2 left-0 w-[180px] bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                            {versions.map((version, index) => {
                                                                const isPublished = publishedVersionId === version.id;
                                                                return (
                                                                    <div
                                                                        key={version.id}
                                                                        className={`w-full flex items-center justify-between gap-2 ${index === 0 ? 'rounded-t-xl' : ''
                                                                            } ${index === versions.length - 1 ? 'rounded-b-xl' : ''
                                                                            } ${selectedVersionId === version.id
                                                                                ? "bg-slate-100"
                                                                                : ""
                                                                            }`}
                                                                    >
                                                                        {editingVersionId === version.id ? (
                                                                            <div className="flex-1 px-3 py-2 flex items-center gap-1.5">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editingVersionName}
                                                                                    onChange={(e) => setEditingVersionName(e.target.value)}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            savedByEnterRef.current = true;
                                                                                            handleSaveVersionName(version.id);
                                                                                        } else if (e.key === 'Escape') {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            savedByEnterRef.current = false;
                                                                                            handleCancelEditVersionName();
                                                                                        }
                                                                                    }}
                                                                                    onMouseDown={(e) => {
                                                                                        // input 내부 클릭은 버튼 클릭이 아님
                                                                                        // 드롭다운이 닫히지 않도록 이벤트 전파 중단
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                    onSelect={(e) => {
                                                                                        // 텍스트 선택 중에는 드롭다운이 닫히지 않도록
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                    onBlur={() => {
                                                                                        // 버튼 클릭이 아니고 Enter 키로 저장한 경우가 아니면 저장
                                                                                        if (!isButtonClickRef.current && !savedByEnterRef.current) {
                                                                                            // setTimeout을 사용하여 다른 이벤트가 먼저 처리되도록 함
                                                                                            setTimeout(() => {
                                                                                                if (!isButtonClickRef.current) {
                                                                                                    handleSaveVersionName(version.id);
                                                                                                }
                                                                                                isButtonClickRef.current = false;
                                                                                            }, 150);
                                                                                        } else {
                                                                                            isButtonClickRef.current = false;
                                                                                        }
                                                                                        savedByEnterRef.current = false;
                                                                                    }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    autoFocus
                                                                                    className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                                    placeholder="버전 이름"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    if (e.detail === 2) {
                                                                                        const displayName = getVersionDisplayName(version);
                                                                                        handleStartEditVersionName(version.id, displayName);
                                                                                    } else {
                                                                                        handleVersionSelect(version.id);
                                                                                        setShowVersionDropdown(false);
                                                                                    }
                                                                                }}
                                                                                onDoubleClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    const displayName = getVersionDisplayName(version);
                                                                                    handleStartEditVersionName(version.id, displayName);
                                                                                }}
                                                                                className={`flex-1 px-3 py-2 text-left text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap min-w-0 ${selectedVersionId === version.id
                                                                                    ? "text-slate-900"
                                                                                    : "text-slate-700 hover:bg-slate-50"
                                                                                    }`}
                                                                                title="더블 클릭하여 이름 편집"
                                                                            >
                                                                                <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${isPublished ? 'bg-green-500' : 'bg-transparent'}`} />
                                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                                                                                    {version.version_code || `v${version.version_number}`}
                                                                                </span>
                                                                                <span className="truncate">
                                                                                    {getVersionDisplayName(version)}
                                                                                </span>
                                                                            </button>
                                                                        )}
                                                                        {/* 버전 액션 버튼 */}
                                                                        <div className="flex items-center gap-1 mr-2 flex-shrink-0">
                                                                            {selectedVersionId === version.id && editingVersionId !== version.id && (
                                                                                <button
                                                                                    onMouseDown={(e) => {
                                                                                        // 버튼 클릭 플래그 설정
                                                                                        isButtonClickRef.current = true;
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        const displayName = getVersionDisplayName(version);
                                                                                        handleStartEditVersionName(version.id, displayName);
                                                                                    }}
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                    className="px-2 py-1 text-xs text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors"
                                                                                    title="이름 편집"
                                                                                >
                                                                                    <PenTool className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            )}
                                                                            {publishedVersionId !== version.id && selectedVersionId !== version.id && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        handleVersionDelete(version.id);
                                                                                        setShowVersionDropdown(false);
                                                                                    }}
                                                                                    className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                                                    title="버전 삭제"
                                                                                >
                                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* 상태 전환 버튼 */}
                                                {selectedVersionId && selectedVersionId === publishedVersionId && (
                                                    currentStatus === 'public' ? (
                                                        <button
                                                            onClick={() => handleStatusChange('private')}
                                                            disabled={isSavingDraft || isPublishing || isCreatingNewVersion || loading}
                                                            className="p-2 sm:px-2 sm:py-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
                                                            title="비공개로 전환"
                                                        >
                                                            <EyeOff className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusChange('public')}
                                                            disabled={isSavingDraft || isPublishing || isCreatingNewVersion || loading}
                                                            className="p-2 sm:px-2 sm:py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
                                                            title="공개로 전환"
                                                        >
                                                            <Eye className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {!isEditing && (
                                            <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">새 게시물 작성</span>
                                        )}
                                    </div>

                                    {/* 오른쪽: 저장 버튼들 */}
                                    <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
                                        {/* 편집 모드일 때 */}
                                        {isEditing && activityId && (
                                            <>
                                                <button
                                                    onClick={handleSaveDraft}
                                                    disabled={isSavingDraft || isPublishing || isCreatingNewVersion || loading}
                                                    className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm text-slate-700 bg-white border border-slate-300 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-400 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-1"
                                                >
                                                    {isSavingDraft ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 border-2 border-slate-400/30 border-t-slate-600"></div>
                                                            <span className="hidden sm:inline">수정 중...</span>
                                                            <span className="sm:hidden text-xs">중</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs sm:text-sm">수정하기</span>
                                                    )}
                                                </button>
                                                {/* 출판된 버전이 선택되어 있지 않을 때만 "재출판하기" 버튼 표시 */}
                                                {selectedVersionId && selectedVersionId !== publishedVersionId && (
                                                    <button
                                                        onClick={handlePublish}
                                                        disabled={isSavingDraft || isPublishing || isCreatingNewVersion || loading}
                                                        className="flex items-center gap-1 sm:gap-1 px-2.5 sm:px-4 py-2 sm:py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                                    >
                                                        {isPublishing ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 border-2 border-white/30 border-t-white"></div>
                                                                <span className="hidden sm:inline">재출판 중...</span>
                                                                <span className="sm:hidden text-xs">중</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span className="text-xs sm:text-sm">재출판하기</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </>
                                        )}

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
                                                    onClick={handleSaveDraft}
                                                    disabled={isSavingDraft || isPublishing || loading}
                                                    className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-1"
                                                >
                                                    {isSavingDraft ? (
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
                                                    onClick={handlePublish}
                                                    disabled={isSavingDraft || isPublishing || loading}
                                                    className="flex items-center gap-1 sm:gap-1 px-2.5 sm:px-4 py-2 sm:py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                                >
                                                    {isPublishing ? (
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
                                    startDate={startDate}
                                    setStartDate={setStartDate}
                                    endDate={endDate}
                                    setEndDate={setEndDate}
                                    locationRef={locationRef}
                                    initialData={initialData}
                                    contactInfoRef={contactInfoRef}
                                    tagInput={tagInput}
                                    activityLocation={activityLocation}
                                    setActivityLocation={setActivityLocation}
                                    contactInfo={contactInfo}
                                    setContactInfo={setContactInfo}
                                    maxParticipants={maxParticipants}
                                    setMaxParticipants={setMaxParticipants}
                                    participationFee={participationFee}
                                    setParticipationFee={setParticipationFee}
                                    setTagInput={setTagInput}
                                    handleAddTag={handleAddTag}
                                    tags={tags}
                                    handleRemoveTag={handleRemoveTag}
                                    hasVoting={hasVoting}
                                    setHasVoting={setHasVoting}
                                    addVoteOption={addVoteOption}
                                    voteOptions={voteOptions}
                                    updateVoteOption={updateVoteOption}
                                    removeVoteOption={removeVoteOption}
                                    voteDeadline={voteDeadline}
                                    setVoteDeadline={setVoteDeadline}
                                    hasParticipation={hasParticipation}
                                    setHasParticipation={setHasParticipation}
                                    maxParticipantsRef={maxParticipantsRef}
                                    participationFeeRef={participationFeeRef}
                                />
                            </div>
                        </aside>

                        {/* 중앙: 본문 편집 컬럼 */}
                        <section className="lg:col-span-9">
                            {/* 에러 메시지 */}
                            {error && (
                                <div className="mb-6 max-w-4xl mx-auto">
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                                </div>
                            )}

                            {/* 대표 이미지 (제목 위로 이동) */}
                            <div className="mb-8 lg:mt-8">
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Images className="w-4 h-4 text-slate-600" />
                                                        <label className="block text-sm font-semibold text-slate-700">대표 이미지</label>
                                                    </div>
                                                    <p className="text-xs text-slate-500">+ 버튼을 클릭하여 활동을 대표하는 이미지들을 추가하세요</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                                {/* 추가 버튼 - 첫 번째 아이템 */}
                                                <label className={`relative aspect-square rounded-xl overflow-hidden border-2 border-dashed ${uploadingImage ? 'border-slate-300 cursor-not-allowed' : 'border-slate-300 hover:border-blue-400 cursor-pointer'} flex items-center justify-center bg-slate-50/50 hover:bg-slate-100/50 transition-all duration-200`}>
                                                    <div className="text-center p-4">
                                                        {uploadingImage ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                                <div className="text-slate-500 text-xs">업로드 중...</div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-8 h-8 text-slate-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                                <div className="text-slate-500 text-xs font-medium">추가</div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} disabled={uploadingImage} className="hidden" />
                                                </label>

                                                {/* 업로드된 이미지들 */}
                                                {Array.isArray(formData.thumbnail) && formData.thumbnail.map((url, index) => (
                                                    <div key={index} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImages.has(index) ? 'border-blue-500 ring-2 ring-blue-300' : 'border-slate-200'}`}>
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={url}
                                                                alt={`썸네일 ${index + 1}`}
                                                                fill
                                                                sizes="(min-width:1280px) 16vw, (min-width:1024px) 19vw, (min-width:768px) 24vw, (min-width:640px) 31vw, 48vw"
                                                                className="object-cover"
                                                                unoptimized
                                                                priority={index < 4}
                                                            />
                                                        </div>
                                                        <div className="absolute top-2 left-2" onClick={(e) => { e.stopPropagation(); toggleImageSelection(index); }}>
                                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${selectedImages.has(index) ? 'bg-blue-600 border-blue-600' : 'bg-white/90 border-slate-300'}`}>
                                                                {selectedImages.has(index) && (<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>)}
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); removeThumbnailAt(index); }} className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 기본 정보 - 제목/소제목 */}
                            <div className="mb-8">
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-6">
                                        <input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} className="w-full text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl font-bold bg-transparent border-none outline-none text-slate-900 placeholder-gray-400 resize-none" placeholder="제목을 입력하세요" required />
                                    </div>
                                    <div className="mb-4">
                                        <textarea
                                            id="subtitle"
                                            name="subtitle"
                                            value={formData.subtitle}
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
                                            postId={postId || activityId}
                                            postType="activities"
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


