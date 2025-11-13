'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ResourcePostForm from '@/components/forms/ResourcePostForm';
import { JSONContent } from 'novel';

interface ResourcePostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    difficulty_level?: string;
    files?: Array<{
        id: string;
        name: string;
        size: number;
        type: string;
        url?: string;
        file_path?: string;
    }>;
}

interface ResourceData {
    id: number;
    author_id: string;
    title: string;
    subtitle: string;
    content: Record<string, unknown>;
    thumbnail: string;
    category_id?: number;
    category?: {
        id?: number;
        name: string;
    };
    resource_type: {
        id: number;
        name: string;
    };
    subject: string;
    professor: string;
    semester: string;
    year: number;
    difficulty_level: string;
    file_extension: string;
    original_filename: string;
    downloads_count: number;
    rating: number;
    rating_count: number;
    status: 'published' | 'draft';
    files?: Array<{
        id: string;
        name: string;
        size: number;
        file_size: number;
        type: string;
        file_type: string;
        url: string;
        file_path: string;
        original_filename: string;
    }>;
}

export default function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { user, loading, profile } = useAuth();
    const router = useRouter();

    // params를 unwrap
    const resolvedParams = use(params);

    const [resource, setResource] = useState<ResourceData | null>(null);
    const [loadingResource, setLoadingResource] = useState(true);
    const [returnUrl, setReturnUrl] = useState<string | null>(null);
    const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        // URL 파라미터에서 returnUrl 가져오기
        const searchParams = new URLSearchParams(window.location.search);
        const returnUrlParam = searchParams.get('returnUrl');
        setReturnUrl(returnUrlParam);
    }, []);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                // 편집 모드임을 표시하는 헤더 추가
                const response = await fetch(`/api/resources/${resolvedParams.id}`, {
                    headers: {
                        'x-edit-mode': 'true'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setResource(data.resource);
                    setVisibility(data.resource.visibility || 'public');
                } else {
                    alert('자료를 불러올 수 없습니다.');
                    router.push('/mypage');
                }
            } catch {
                alert('자료를 불러오는 중 오류가 발생했습니다.');
                router.push('/mypage');
            } finally {
                setLoadingResource(false);
            }
        };

        if (user && resolvedParams.id) {
            fetchResource();
        }
    }, [user, resolvedParams.id, router]);

    const handleSaveDraft = async (formData: ResourcePostFormData, content: JSONContent) => {
        try {
            const response = await fetch(`/api/resources/${resolvedParams.id}/draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    content
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '임시저장에 실패했습니다.');
            }

            alert('임시저장되었습니다!');
        } catch (error) {
            console.error('Draft save error:', error);
            throw error;
        }
    };

    const handlePublish = async () => {
        try {
            const response = await fetch(`/api/resources/${resolvedParams.id}/publish`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '출판에 실패했습니다.');
            }

            alert('재출판되었습니다! 게시판에 즉시 반영됩니다.');

            // returnUrl이 있으면 해당 URL로, 없으면 프로필 페이지로
            if (returnUrl) {
                router.push(returnUrl);
            } else if (profile?.nickname) {
                window.location.href = `/profile/${profile.nickname}#my-resources`;
            } else {
                router.push('/mypage');
            }
        } catch (error) {
            throw error;
        }
    };

    const handleToggleVisibility = async () => {
        const newVisibility = visibility === 'public' ? 'private' : 'public';

        try {
            const response = await fetch(`/api/resources/${resolvedParams.id}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visibility: newVisibility })
            });

            if (!response.ok) {
                throw new Error('가시성 변경에 실패했습니다.');
            }

            setVisibility(newVisibility);
            alert(newVisibility === 'public' ? '공개로 설정되었습니다.' : '비공개로 설정되었습니다.');
        } catch {
            alert('가시성 설정 변경에 실패했습니다.');
        }
    };

    const handleSave = async (formData: ResourcePostFormData, content: JSONContent) => {
        try {
            const response = await fetch(`/api/resources/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    content,
                    board_type: 'resources'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '자료 수정에 실패했습니다.');
            }

            await response.json();

            if (formData.status === 'draft') {
                alert('자료가 임시저장되었습니다!');
            } else {
                alert('자료가 성공적으로 수정되었습니다!');

                // returnUrl이 있으면 해당 URL로, 없으면 프로필 페이지로
                if (returnUrl) {
                    router.push(returnUrl);
                } else if (profile?.nickname) {
                    // 내 자료실 탭이 선택되도록 리다이렉트
                    window.location.href = `/profile/${profile.nickname}#my-resources`;
                } else {
                    router.push('/mypage');
                }
            }
        } catch (error) {
            throw error;
        }
    };

    if (loading || loadingResource) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !resource) {
        return null;
    }

    // 작성자가 아닌 경우 접근 차단
    if (resource.author_id !== user.id) {
        alert('수정 권한이 없습니다.');
        router.push('/mypage');
        return null;
    }

    const isPublished = resource.status === 'published';

    // resource.id와 URL 파라미터가 다르면 resource.id를 우선 사용
    const finalResourceId = resource?.id || parseInt(resolvedParams.id);

    return (
        <ResourcePostForm
            onSave={handleSave}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            onToggleVisibility={handleToggleVisibility}
            isEditing={true}
            loading={false}
            resourceId={finalResourceId}
            postId={String(finalResourceId)}
            initialData={{
                title: resource.title,
                description: resource.subtitle || '',
                category: resource.category?.name || '',
                category_id: resource.category_id || resource.category?.id || undefined,
                thumbnail: Array.isArray(resource.thumbnail) ? resource.thumbnail : (resource.thumbnail ? [resource.thumbnail] : []),
                subject: resource.subject || '',
                professor: resource.professor || '',
                semester: resource.semester || '',
                year: resource.year,
                status: resource.status === 'published' ? 'public' : resource.status || 'draft',
                is_published: isPublished,
                visibility: visibility,
                files: resource.files?.map(file => ({
                    id: file.id,
                    name: file.original_filename,
                    size: file.file_size || file.size || 0,
                    type: file.file_type || file.type || 'application/octet-stream',
                    url: file.file_path || file.url,
                    file_path: file.file_path || file.url
                })) || []
            }}
            initialContent={resource.content}
        />
    );
}
