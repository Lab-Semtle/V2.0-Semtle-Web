'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NovelEditor from '@/components/editor/NovelEditor';
import FileUpload from '@/components/resources/FileUpload';
import { JSONContent } from 'novel';
import { Plus, ChevronDown, Eye, EyeOff, XCircle, PenTool, GitBranch, PanelLeftOpen, ClipboardList } from 'lucide-react';
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

interface ResourcePostFormData {
    title: string;
    description: string;
    subtitle?: string;
    category: string;
    category_id?: number;
    thumbnail: string;
    status?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    files?: Array<{
        id: string;
        name: string;
        size: number;
        type: string;
        url?: string;
        file_path?: string;
    }>;
}

// LeftSettingsPanel 컴포넌트
function LeftSettingsPanel({
    selectedCategoryId,
    handleCategoryChange,
    loadingData,
    categories,
    subjectRef,
    professorRef,
    semesterRef,
    yearRef,
    initialData
}: {
    selectedCategoryId: number | null;
    handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    loadingData: boolean;
    categories: Category[];
    subjectRef: React.RefObject<HTMLInputElement | null>;
    professorRef: React.RefObject<HTMLInputElement | null>;
    semesterRef: React.RefObject<HTMLSelectElement | null>;
    yearRef: React.RefObject<HTMLInputElement | null>;
    initialData?: ResourcePostFormProps['initialData'];
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
                        <label htmlFor="subject" className="block text-xs font-medium text-slate-600 mb-1.5">과목명</label>
                        <input
                            ref={subjectRef}
                            type="text"
                            id="subject"
                            name="subject"
                            defaultValue={initialData?.subject || ''}
                            placeholder="예: 데이터베이스시스템"
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150"
                        />
                    </div>
                    <div>
                        <label htmlFor="professor" className="block text-xs font-medium text-slate-600 mb-1.5">교수명</label>
                        <input
                            ref={professorRef}
                            type="text"
                            id="professor"
                            name="professor"
                            defaultValue={initialData?.professor || ''}
                            placeholder="예: 홍길동 교수"
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150"
                        />
                    </div>
                    <div>
                        <label htmlFor="semester" className="block text-xs font-medium text-slate-600 mb-1.5">학기</label>
                        <select
                            ref={semesterRef}
                            id="semester"
                            name="semester"
                            defaultValue={initialData?.semester || ''}
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150"
                        >
                            <option value="">학기를 선택하세요</option>
                            <option value="1학기">1학기</option>
                            <option value="2학기">2학기</option>
                            <option value="여름학기">여름학기</option>
                            <option value="겨울학기">겨울학기</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="year" className="block text-xs font-medium text-slate-600 mb-1.5">연도</label>
                        <input
                            ref={yearRef}
                            type="number"
                            id="year"
                            name="year"
                            defaultValue={initialData?.year || new Date().getFullYear()}
                            min="2020"
                            max={new Date().getFullYear() + 1}
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all duration-150"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

interface ResourcePostFormProps {
    onSave: (formData: ResourcePostFormData, content: JSONContent) => Promise<void>;
    onSaveDraft?: (formData: ResourcePostFormData, content: JSONContent) => Promise<void>;
    onPublish?: () => Promise<void>;
    onToggleVisibility?: () => Promise<void>;
    isEditing?: boolean;
    loading?: boolean;
    resourceId?: number; // 자료 ID (편집 시)
    postId?: string | number; // 게시물 ID (편집 시, resourceId와 동일하거나 별도로 지정)
    initialData?: {
        title?: string;
        description?: string;
        category?: string;
        thumbnail?: string | string[];
        content?: JSONContent;
        category_id?: number;
        status?: string;
        is_published?: boolean;
        visibility?: 'public' | 'private' | 'unlisted';
        subject?: string;
        professor?: string;
        semester?: string;
        year?: number;
        files?: Array<{
            id: string;
            name: string;
            size: number;
            type: string;
            url?: string;
            file_path?: string;
        }>;
    };
    initialContent?: JSONContent;
}

export default function ResourcePostForm({
    onSave,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSaveDraft,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPublish,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onToggleVisibility,
    isEditing = false,
    loading = false,
    resourceId,
    postId,
    initialData,
    initialContent
}: ResourcePostFormProps) {
    const router = useRouter();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        thumbnail: '', // 자료실은 썸네일 없음
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
    const [uploadedFiles, setUploadedFiles] = useState<Array<{
        id: string;
        name: string;
        size: number;
        type: string;
        url?: string;
        file_path?: string;
    }>>(initialData?.files || []);

    // 카테고리 데이터
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingData, setLoadingData] = useState(false);
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
    const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
    const [editingVersionName, setEditingVersionName] = useState<string>('');
    const [isSavingVersionName, setIsSavingVersionName] = useState(false);
    const [showNewVersionDialog, setShowNewVersionDialog] = useState(false);
    const [newVersionName, setNewVersionName] = useState<string>('');
    const savedByEnterRef = useRef(false);
    const [currentStatus, setCurrentStatus] = useState<'draft' | 'public' | 'private'>(() => {
        const initialStatus = initialData?.status;
        if (initialStatus === 'published') return 'public';
        if (initialStatus === 'public' || initialStatus === 'private') return initialStatus;
        return 'draft';
    });
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // refs for form fields
    const subjectRef = React.useRef<HTMLInputElement>(null);
    const professorRef = React.useRef<HTMLInputElement>(null);
    const semesterRef = React.useRef<HTMLSelectElement>(null);
    const yearRef = React.useRef<HTMLInputElement>(null);

    // 카테고리 로드
    const loadData = useCallback(async () => {
        try {
            setLoadingData(true);
            const categoryResponse = await fetch('/api/categories?board_type=resources');
            if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                setCategories(categoryData.categories || []);
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

    // 카테고리가 로드된 후 initialData의 category_id로 selectedCategoryId 설정
    useEffect(() => {
        if (categories.length > 0 && initialData?.category_id) {
            // 카테고리 목록에 해당 ID가 존재하는지 확인
            const categoryExists = categories.some(cat => cat.id === initialData.category_id);
            if (categoryExists && selectedCategoryId !== initialData.category_id) {
                setSelectedCategoryId(initialData.category_id);
            }
        }
    }, [categories, initialData?.category_id, selectedCategoryId]);

    // 버전 이름 가져오기
    const getVersionDisplayName = useCallback((version: { version_label?: string; updated_at?: string; created_at?: string }) => {
        if (version.version_label && version.version_label.trim()) {
            return version.version_label.trim();
        }
        const date = new Date(version.updated_at || version.created_at || Date.now());
        return `${String(date.getFullYear()).slice(-2)}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }, []);

    // 버전 선택 핸들러
    const handleVersionSelect = useCallback(async (versionId: number | null) => {
        if (!versionId || !resourceId) {
            setSelectedVersionId(null);
            if (initialData) {
                setFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    category: initialData.category || '',
                    thumbnail: '',
                    status: initialData.status || 'draft'
                });
                const dataContent = initialData.content as JSONContent;
                if (dataContent && dataContent.type === 'doc' && dataContent.content && dataContent.content.length > 0) {
                    setContent(dataContent);
                } else {
                    setContent({ type: "doc", content: [] });
                }
            }
            return;
        }

        try {
            const response = await fetch(`/api/resources/${resourceId}/versions`, {
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
                setSelectedCategoryId(version.category_id || null);

                setFormData({
                    title: version.title || '',
                    description: version.subtitle || '',
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

                // 자료실 전용 필드 복원
                if (subjectRef.current) subjectRef.current.value = version.subject || '';
                if (professorRef.current) professorRef.current.value = version.professor || '';
                if (semesterRef.current) semesterRef.current.value = version.semester || '';
                if (yearRef.current) yearRef.current.value = version.year?.toString() || '';
            }
        } catch (error) {
            console.error('버전 데이터 로드 오류:', error);
            alert('버전 데이터를 불러오는데 실패했습니다.');
        }
    }, [resourceId, initialData]);

    // 버전 목록 조회
    const fetchVersions = useCallback(async () => {
        if (!isEditing || !resourceId) return;

        try {
            setLoadingVersions(true);
            const response = await fetch(`/api/resources/${resourceId}/versions`);
            if (!response.ok) {
                console.warn(`버전 조회 실패 (status: ${response.status}), 자료 ID: ${resourceId}`);
                setVersions([]);
                if (!initialData?.content) {
                    setContent({ type: "doc", content: [] });
                }
                return;
            }
            const data = await response.json();

            const versionsArray = Array.isArray(data.versions) ? data.versions : [];
            setVersions(versionsArray);
            setPublishedVersionId(data.published_version_id || null);

            if (data.status) {
                const statusValue = data.status === 'published' ? 'public' : data.status;
                if (statusValue === 'public' || statusValue === 'private' || statusValue === 'draft') {
                    setCurrentStatus(statusValue);
                }
            }

            if (versionsArray.length > 0) {
                let targetVersionId: number | null = null;
                let targetVersion: Record<string, unknown> | null = null;

                if (data.published_version_id) {
                    const publishedVersion = versionsArray.find((v: Record<string, unknown>) => v.id === data.published_version_id);
                    if (publishedVersion) {
                        targetVersionId = data.published_version_id;
                        targetVersion = publishedVersion;
                    }
                }

                if (!targetVersionId && versionsArray[0]) {
                    targetVersionId = versionsArray[0].id;
                    targetVersion = versionsArray[0];
                }

                if (targetVersionId && targetVersion) {
                    setSelectedVersionId(targetVersionId);
                    if (targetVersion.category_id) {
                        setSelectedCategoryId(targetVersion.category_id as number);
                    }
                    setTimeout(() => {
                        handleVersionSelect(targetVersionId!);
                    }, 100);
                }
            } else {
                if (!initialData?.content) {
                    setContent({ type: "doc", content: [] });
                }
            }
        } catch (error) {
            console.error('버전 목록 로드 오류:', error);
        } finally {
            setLoadingVersions(false);
        }
    }, [isEditing, resourceId, handleVersionSelect, initialData?.content]);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

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
        if (!resourceId || isSavingVersionName) return;

        setIsSavingVersionName(true);
        try {
            const response = await fetch(`/api/resources/${resourceId}/versions/${versionId}`, {
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
    }, [resourceId, editingVersionName, fetchVersions, isSavingVersionName]);

    // 버전 삭제
    const handleVersionDelete = useCallback(async (versionId: number) => {
        if (!resourceId) return;

        if (publishedVersionId === versionId) {
            alert('출판 중인 버전은 삭제할 수 없습니다. 먼저 다른 버전을 출판하세요.');
            return;
        }

        if (selectedVersionId === versionId) {
            alert('현재 선택된 버전은 삭제할 수 없습니다. 먼저 다른 버전을 선택하세요.');
            return;
        }

        if (!confirm('이 버전을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            const response = await fetch(`/api/resources/${resourceId}/versions/${versionId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '버전 삭제에 실패했습니다.');
            }

            await fetchVersions();

            if (selectedVersionId === versionId) {
                const newVersionsResponse = await fetch(`/api/resources/${resourceId}/versions`);
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
            alert(err instanceof Error ? err.message : '버전 삭제에 실패했습니다.');
        }
    }, [resourceId, publishedVersionId, selectedVersionId, fetchVersions, handleVersionSelect]);

    // 새 버전 만들기
    const handleCreateNewVersion = useCallback(async (versionName?: string) => {
        console.log('handleCreateNewVersion 호출됨', { resourceId, versionName });

        if (!resourceId) {
            alert('자료 ID가 없습니다.');
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

            const resourceFormData = {
                title: formData.title,
                subtitle: formData.description,
                category_id: categoryId,
                thumbnail: Array.isArray(formData.thumbnail) && formData.thumbnail.length > 0 ? formData.thumbnail : undefined,
                content: content,
                subject: subjectRef.current?.value || undefined,
                professor: professorRef.current?.value || undefined,
                semester: semesterRef.current?.value || undefined,
                year: yearRef.current?.value ? parseInt(yearRef.current.value) : undefined,
                resource_type_id: undefined,
                file_url: undefined,
                file_size: undefined,
                file_extension: undefined,
                original_filename: undefined,
                difficulty_level: undefined,
                rating: 0,
                rating_count: 0,
                tags: [],
                parent_version_id: selectedVersionId || null,
                version_label: versionName?.trim() || null
            };

            const draftResponse = await fetch(`/api/resources/${resourceId}/draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resourceFormData)
            });

            if (!draftResponse.ok) {
                const error = await draftResponse.json();
                throw new Error(error.error || '새 버전 생성에 실패했습니다.');
            }

            const draftData = await draftResponse.json();
            await fetchVersions();

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
            setIsSavingDraft(false);
        }
    }, [resourceId, formData, selectedCategoryId, categories, content, selectedVersionId, fetchVersions, handleVersionSelect]);

    const handleCreateNewVersionClick = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setShowNewVersionDialog(true);
        setNewVersionName('');
    }, []);

    // 상태 변경
    const handleStatusChange = useCallback(async (newStatus: 'public' | 'private') => {
        if (!resourceId) return;
        try {
            const apiStatus = newStatus === 'public' ? 'public' : newStatus;

            const response = await fetch(`/api/resources/${resourceId}/status`, {
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
                alert(`상태가 ${statusMessages[newStatus]}로 변경되었습니다.`);
                await fetchVersions();
            } else {
                const error = await response.json();
                throw new Error(error.error || '상태 변경에 실패했습니다.');
            }
        } catch (err: unknown) {
            console.error('상태 변경 오류:', err);
            alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
        }
    }, [resourceId, fetchVersions]);

    // 외부 클릭 처리
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showVersionDropdown && versionDropdownRef.current && !versionDropdownRef.current.contains(event.target as Node)) {
                setShowVersionDropdown(false);
            }

            if (showNewVersionDialog && newVersionDialogRef.current) {
                const target = event.target as HTMLElement;
                // 다이얼로그 내부 클릭인지 확인 (ref를 사용하여 정확히 확인)
                const isInsideDialog = newVersionDialogRef.current.contains(target);

                // 다이얼로그 내부가 아닌 경우에만 처리
                if (!isInsideDialog) {
                    // 외부 클릭인 경우, 새 버전 버튼(다이얼로그 외부) 클릭인지 확인
                    const clickedButton = target.closest('button');
                    const isNewVersionButton = clickedButton && (
                        (clickedButton.textContent?.includes('새 버전') && !newVersionDialogRef.current.contains(clickedButton)) ||
                        (clickedButton.textContent?.includes('+ 새 버전') && !newVersionDialogRef.current.contains(clickedButton)) ||
                        (clickedButton.querySelector('svg') && !newVersionDialogRef.current.contains(clickedButton)) // Plus 아이콘 버튼 (다이얼로그 외부)
                    );

                    // 새 버전 버튼이 아닌 외부 클릭이면 다이얼로그 닫기
                    if (!isNewVersionButton) {
                        setShowNewVersionDialog(false);
                        setNewVersionName('');
                    }
                }
            }
        };

        if (showVersionDropdown || showNewVersionDialog) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showVersionDropdown, showNewVersionDialog]);

    // category_id를 category name으로 변환
    useEffect(() => {
        const categoryId = selectedCategoryId || initialData?.category_id || null;
        if (categoryId && categories.length > 0) {
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                setFormData(prev => {
                    if (prev.category === category.name) return prev;
                    return { ...prev, category: category.name };
                });
            }
        }
    }, [selectedCategoryId, initialData?.category_id, categories]);

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

    const handleFilesChange = (files: Array<{
        id: string;
        name: string;
        size: number;
        type: string;
        url?: string;
        file_path?: string;
        progress?: number;
        error?: string;
    }>) => {
        const successfulFiles = files
            .filter(file => (file.url || file.file_path) && !file.error)
            .map(file => ({
                id: file.id,
                name: file.name,
                size: file.size,
                type: file.type,
                url: file.url,
                file_path: file.file_path
            }));

        setUploadedFiles(successfulFiles);
    };

    // 일반 저장 (현재 버전 내용만 업데이트, 새 버전 생성 안 함) - 편집 모드에서 "수정하기"
    const handleSimpleSave = async () => {
        if (!resourceId || !selectedVersionId) {
            alert('자료 ID 또는 선택된 버전이 없습니다.');
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

            const resourceFormData = {
                title: formData.title,
                subtitle: formData.description,
                category_id: categoryId,
                thumbnail: Array.isArray(formData.thumbnail) && formData.thumbnail.length > 0 ? formData.thumbnail : undefined,
                content: content,
                subject: subjectRef.current?.value || undefined,
                professor: professorRef.current?.value || undefined,
                semester: semesterRef.current?.value || undefined,
                year: yearRef.current?.value ? parseInt(yearRef.current.value) : undefined,
                resource_type_id: undefined,
                file_url: undefined,
                file_size: undefined,
                file_extension: undefined,
                original_filename: undefined,
                difficulty_level: undefined,
                rating: 0,
                rating_count: 0,
                tags: [],
                version_id: selectedVersionId,
                files: uploadedFiles
            };

            const response = await fetch(`/api/resources/${resourceId}/save`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resourceFormData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '저장에 실패했습니다.');
            }

            // 버전 정보 업데이트
            await fetchVersions();

            // 최신 상태 확인을 위해 버전 정보 다시 조회
            const versionResponse = await fetch(`/api/resources/${resourceId}/versions`);
            let isDraft = false;
            if (versionResponse.ok) {
                const versionData = await versionResponse.json();
                // draft 상태이거나 published_version_id가 없으면 초안 상태
                isDraft = versionData.status === 'draft' || (!versionData.published_version_id && versionData.status !== 'public' && versionData.status !== 'private');
            } else {
                // 버전 정보 조회 실패 시 currentStatus와 publishedVersionId로 판단
                isDraft = currentStatus === 'draft' || !publishedVersionId;
            }

            alert('수정되었습니다.');

            // 아직 출판되지 않은 초안 상태이고, 자료실 게시판에서 접근했다면 게시판으로 리다이렉트
            if (isDraft) {
                const referrer = document.referrer;
                // referrer에 '/resources'가 포함되어 있고 '/resources/edit'이 아니면 게시판에서 접근한 것으로 간주
                if (referrer && referrer.includes('/resources') && !referrer.includes('/resources/edit')) {
                    router.push('/resources');
                } else {
                    // 자료실 게시판에서 접근하지 않았으면 게시물 상세 페이지로
                    router.push(`/resources/${resourceId}`);
                }
            } else {
                // 출판된 게시물이면 상세 페이지로
                router.push(`/resources/${resourceId}`);
            }
        } catch (err: unknown) {
            console.error('저장 오류:', err);
            alert(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
        } finally {
            setIsSavingDraft(false);
        }
    };

    // 임시저장 처리
    const handleSaveDraft = async () => {
        if (isEditing && resourceId) {
            // 편집 모드: 일반 저장 (현재 버전 덮어쓰기)
            await handleSimpleSave();
            return;
        }

        // 새 게시물 작성 시 필수 입력값 검증
        const validationErrors = [];
        if (!formData.title.trim()) {
            validationErrors.push('제목을 입력해주세요.');
        }
        if (!formData.description.trim()) {
            validationErrors.push('설명을 입력해주세요.');
        }
        if (!formData.category && !selectedCategoryId) {
            validationErrors.push('카테고리를 선택해주세요.');
        }
        if (validationErrors.length > 0) {
            alert(validationErrors[0]);
            return;
        }

        setIsSavingDraft(true);
        try {
            // category_id 계산
            let categoryId = 0;
            if (selectedCategoryId) {
                categoryId = selectedCategoryId;
            } else if (formData.category) {
                const category = categories.find(c => c.name === formData.category);
                categoryId = category?.id || 0;
            }

            const resourceFormData: ResourcePostFormData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                thumbnail: '',
                status: 'draft',
                category_id: categoryId,
                subtitle: formData.description, // API는 subtitle을 기대함
                subject: subjectRef.current?.value || undefined,
                professor: professorRef.current?.value || undefined,
                semester: semesterRef.current?.value || undefined,
                year: yearRef.current?.value ? parseInt(yearRef.current.value) : undefined,
                files: uploadedFiles
            };

            await onSave(resourceFormData, content);

            const finalPostId = postId || resourceId;
            if (finalPostId) {
                window.localStorage.setItem(`novel-${finalPostId}-saved`, 'true');
            }
        } catch (err: unknown) {
            console.error('임시저장 오류:', err);
            alert(err instanceof Error ? err.message : '임시저장 중 오류가 발생했습니다.');
        } finally {
            setIsSavingDraft(false);
        }
    };

    // 출판/재출판 처리
    const handlePublish = async () => {
        if (isEditing && resourceId) {
            // 편집 모드: 재출판하기
            const validationErrors = [];
            if (!formData.title.trim()) {
                validationErrors.push('제목을 입력해주세요.');
            }
            if (!formData.description.trim()) {
                validationErrors.push('설명을 입력해주세요.');
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

                const resourceFormData = {
                    title: formData.title,
                    subtitle: formData.description,
                    category_id: categoryId,
                    thumbnail: Array.isArray(formData.thumbnail) && formData.thumbnail.length > 0 ? formData.thumbnail : undefined,
                    content: content,
                    subject: subjectRef.current?.value || undefined,
                    professor: professorRef.current?.value || undefined,
                    semester: semesterRef.current?.value || undefined,
                    year: yearRef.current?.value ? parseInt(yearRef.current.value) : undefined,
                    resource_type_id: undefined,
                    file_url: undefined,
                    file_size: undefined,
                    file_extension: undefined,
                    original_filename: undefined,
                    difficulty_level: undefined,
                    rating: 0,
                    rating_count: 0,
                    tags: [],
                    version_id: selectedVersionId
                };

                // 먼저 현재 버전의 내용을 업데이트
                const saveResponse = await fetch(`/api/resources/${resourceId}/save`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(resourceFormData)
                });

                if (!saveResponse.ok) {
                    throw new Error('버전 업데이트에 실패했습니다.');
                }

                // 선택된 버전을 출판 버전으로 설정
                const publishResponse = await fetch(`/api/resources/${resourceId}/versions`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ version_id: selectedVersionId })
                });

                if (!publishResponse.ok) {
                    const errorData = await publishResponse.json().catch(() => ({ error: '알 수 없는 오류' }));
                    throw new Error(errorData.error || '재출판에 실패했습니다.');
                }

                setCurrentStatus('public');
                await fetchVersions();
                alert('재출판되었습니다!');
                router.push(`/resources/${resourceId}`);
            } catch (err: unknown) {
                console.error('재출판 오류:', err);
                alert(err instanceof Error ? err.message : '재출판 중 오류가 발생했습니다.');
            } finally {
                setIsPublishing(false);
            }
            return;
        }

        // 새 게시물 작성: 일반 저장 (onSave 호출)
        const validationErrors = [];
        if (!formData.title.trim()) {
            validationErrors.push('제목을 입력해주세요.');
        }
        if (!formData.description.trim()) {
            validationErrors.push('설명을 입력해주세요.');
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

            const resourceFormData: ResourcePostFormData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                category_id: categoryId,
                thumbnail: '',
                status: 'published',
                subtitle: formData.description, // API는 subtitle을 기대함
                subject: subjectRef.current?.value || undefined,
                professor: professorRef.current?.value || undefined,
                semester: semesterRef.current?.value || undefined,
                year: yearRef.current?.value ? parseInt(yearRef.current.value) : undefined,
                files: uploadedFiles
            };

            await onSave(resourceFormData, content);

            const finalPostId = postId || resourceId;
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getTitle = () => {
        if (isEditing) return '게시물 수정하기';
        return '새 자료 등록하기';
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
                                            게시물의 카테고리와 자료실 기본 정보를 변경할 수 있습니다.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-4">
                                        <LeftSettingsPanel
                                            selectedCategoryId={selectedCategoryId}
                                            handleCategoryChange={handleCategoryChange}
                                            loadingData={loadingData}
                                            categories={categories}
                                            subjectRef={subjectRef}
                                            professorRef={professorRef}
                                            semesterRef={semesterRef}
                                            yearRef={yearRef}
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
                                        {isEditing && resourceId && (
                                            <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                {/* 새 버전 만들기 */}
                                                <div className="relative">
                                                    <button
                                                        onClick={handleCreateNewVersionClick}
                                                        disabled={isSavingDraft || isPublishing || loading || showNewVersionDialog}
                                                        className="px-2.5 py-1.5 text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 whitespace-nowrap flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        새 버전
                                                    </button>
                                                    {/* 새 버전 이름 입력 폼 */}
                                                    {showNewVersionDialog && (
                                                        <div ref={newVersionDialogRef} className="absolute top-full mt-2 left-0 w-[200px] bg-white border border-blue-300 rounded-lg shadow-xl z-50 p-2.5">
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
                                                                    className="px-2 py-1 text-[10px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                                                >
                                                                    취소
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleCreateNewVersion(newVersionName);
                                                                    }}
                                                                    disabled={isSavingDraft || isPublishing}
                                                                    className="px-2 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {(isSavingDraft || isPublishing) ? '생성 중...' : '생성'}
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
                                                        className="w-[180px] sm:w-[220px] text-[10px] sm:text-xs border border-slate-200 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-slate-900 bg-white hover:bg-slate-50 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-1 sm:gap-2 whitespace-nowrap"
                                                    >
                                                        <span className="truncate flex items-center gap-1.5 flex-shrink-0 min-w-0">
                                                            {selectedVersionId && editingVersionId === selectedVersionId ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingVersionName}
                                                                    onChange={(e) => setEditingVersionName(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            savedByEnterRef.current = true;
                                                                            handleSaveVersionName(selectedVersionId);
                                                                        } else if (e.key === 'Escape') {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            savedByEnterRef.current = false;
                                                                            handleCancelEditVersionName();
                                                                        }
                                                                    }}
                                                                    onBlur={() => {
                                                                        if (!savedByEnterRef.current) {
                                                                            handleSaveVersionName(selectedVersionId);
                                                                        }
                                                                        savedByEnterRef.current = false;
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    autoFocus
                                                                    className="flex-1 px-1.5 py-0.5 text-[10px] sm:text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                                                                    placeholder="버전 이름"
                                                                />
                                                            ) : selectedVersionId ? (
                                                                (() => {
                                                                    const selected = versions.find(v => v.id === selectedVersionId);
                                                                    if (!selected) return <span className="text-[10px] sm:text-xs">버전 선택</span>;
                                                                    const versionCode = selected.version_code || `v${selected.version_number}`;
                                                                    const isPublished = publishedVersionId === selected.id;
                                                                    const displayName = getVersionDisplayName(selected);
                                                                    return (
                                                                        <>
                                                                            <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${isPublished ? 'bg-green-500' : 'bg-transparent'}`} />
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
                                                                        className={`w-full flex items-center justify-between gap-2 ${index === 0 ? 'rounded-t-xl' : ''} ${index === versions.length - 1 ? 'rounded-b-xl' : ''} ${selectedVersionId === version.id ? "bg-slate-100" : ""}`}
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
                                                                                    onBlur={() => {
                                                                                        if (!savedByEnterRef.current) {
                                                                                            handleSaveVersionName(version.id);
                                                                                        }
                                                                                        savedByEnterRef.current = false;
                                                                                    }}
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
                                                                                className={`flex-1 px-3 py-2 text-left text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap min-w-0 ${selectedVersionId === version.id ? "text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
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
                                                                        <div className="flex items-center gap-1 mr-2 flex-shrink-0">
                                                                            {selectedVersionId === version.id && editingVersionId !== version.id && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        const displayName = getVersionDisplayName(version);
                                                                                        handleStartEditVersionName(version.id, displayName);
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

                                                {/* 출판된 버전이 선택되었을 때만 상태 전환 버튼 표시 */}
                                                {selectedVersionId && selectedVersionId === publishedVersionId && (
                                                    currentStatus === 'public' ? (
                                                        <button
                                                            onClick={() => handleStatusChange('private')}
                                                            disabled={isSavingDraft || isPublishing || loading}
                                                            className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 whitespace-nowrap flex items-center gap-1"
                                                        >
                                                            <EyeOff className="w-3 h-3" />
                                                            비공개로 전환
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusChange('public')}
                                                            disabled={isSavingDraft || isPublishing || loading}
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
                                        {isEditing && resourceId && (
                                            <div className="flex sm:hidden items-center gap-1">
                                                {/* 새 버전 만들기 */}
                                                <div className="relative">
                                                    <button
                                                        onClick={handleCreateNewVersionClick}
                                                        disabled={isSavingDraft || isPublishing || loading || showNewVersionDialog}
                                                        className="p-2 sm:px-2 sm:py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
                                                        title="새 버전 만들기"
                                                    >
                                                        <Plus className="w-4 h-4 sm:hidden" />
                                                        <GitBranch className="hidden sm:block w-3.5 h-3.5" />
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
                                                                    className="w-full px-2 py-1.5 text-[10px] border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                                    className="px-2 py-1 text-[10px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                                                >
                                                                    취소
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleCreateNewVersion(newVersionName);
                                                                    }}
                                                                    disabled={isSavingDraft || isPublishing}
                                                                    className="px-2 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {(isSavingDraft || isPublishing) ? '생성 중...' : '생성'}
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
                                                            {selectedVersionId && editingVersionId === selectedVersionId ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingVersionName}
                                                                    onChange={(e) => setEditingVersionName(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            savedByEnterRef.current = true;
                                                                            handleSaveVersionName(selectedVersionId);
                                                                        } else if (e.key === 'Escape') {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            savedByEnterRef.current = false;
                                                                            handleCancelEditVersionName();
                                                                        }
                                                                    }}
                                                                    onBlur={() => {
                                                                        if (!savedByEnterRef.current) {
                                                                            handleSaveVersionName(selectedVersionId);
                                                                        }
                                                                        savedByEnterRef.current = false;
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    autoFocus
                                                                    className="flex-1 px-1 py-0.5 text-[8px] sm:px-1.5 sm:py-0.5 sm:text-[10px] border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                                                                    placeholder="이름"
                                                                />
                                                            ) : selectedVersionId ? (
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
                                                                        className={`w-full flex items-center justify-between gap-2 ${index === 0 ? 'rounded-t-xl' : ''} ${index === versions.length - 1 ? 'rounded-b-xl' : ''} ${selectedVersionId === version.id ? "bg-slate-100" : ""}`}
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
                                                                                    onBlur={() => {
                                                                                        if (!savedByEnterRef.current) {
                                                                                            handleSaveVersionName(version.id);
                                                                                        }
                                                                                        savedByEnterRef.current = false;
                                                                                    }}
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
                                                                                className={`flex-1 px-3 py-2 text-left text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap min-w-0 ${selectedVersionId === version.id ? "text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
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
                                                                        <div className="flex items-center gap-1 mr-2 flex-shrink-0">
                                                                            {selectedVersionId === version.id && editingVersionId !== version.id && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        const displayName = getVersionDisplayName(version);
                                                                                        handleStartEditVersionName(version.id, displayName);
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
                                                            disabled={isSavingDraft || isPublishing || loading}
                                                            className="p-2 sm:px-2 sm:py-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
                                                            title="비공개로 전환"
                                                        >
                                                            <EyeOff className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusChange('public')}
                                                            disabled={isSavingDraft || isPublishing || loading}
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
                                            <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">새 자료 작성</span>
                                        )}
                                    </div>

                                    {/* 오른쪽: 저장 버튼들 */}
                                    <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
                                        {/* 편집 모드일 때 */}
                                        {isEditing && resourceId && (
                                            <>
                                                <button
                                                    onClick={handleSaveDraft}
                                                    disabled={isSavingDraft || isPublishing || loading}
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
                                                        disabled={isSavingDraft || isPublishing || loading}
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
                                    subjectRef={subjectRef}
                                    professorRef={professorRef}
                                    semesterRef={semesterRef}
                                    yearRef={yearRef}
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

                            {/* 파일 업로드 섹션 */}
                            <div className="mb-8">
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <label className="block text-sm font-semibold text-slate-700">파일 업로드</label>
                                        </div>
                                        <p className="text-xs text-slate-500">자료에 포함할 파일을 업로드하세요</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                        <FileUpload
                                            onFilesChange={handleFilesChange}
                                            maxFiles={10}
                                            maxSizePerFile={100}
                                            acceptedTypes={['*']}
                                            disabled={loading}
                                            userId={user?.id}
                                            initialFiles={initialData?.files || []}
                                        />
                                    </div>
                                    {/* 구분선 */}
                                    <div className="border-t border-slate-200 mt-6 mb-2"></div>
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
                                            postId={postId || resourceId}
                                            postType="resources"
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
