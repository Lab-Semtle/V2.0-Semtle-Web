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
    category: {
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

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const response = await fetch(`/api/resources/${resolvedParams.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setResource(data.resource);
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
                // 사용자 프로필 페이지로 이동
                if (profile?.nickname) {
                    router.push(`/profile/${profile.nickname}`);
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

    return (
        <ResourcePostForm
            onSave={handleSave}
            isEditing={true}
            loading={false}
            initialData={{
                title: resource.title,
                description: resource.subtitle,
                category: resource.category?.name || '',
                thumbnail: resource.thumbnail || '',
                subject: resource.subject || '',
                professor: resource.professor || '',
                semester: resource.semester || '',
                year: resource.year,
                status: resource.status,
                files: resource.files?.map(file => ({
                    id: file.id,
                    name: file.original_filename,
                    size: file.file_size || file.size || 0, // file_size 우선 사용
                    type: file.file_type || file.type || 'application/octet-stream',
                    url: file.file_path || file.url,
                    file_path: file.file_path || file.url
                })) || []
            }}
            initialContent={resource.content}
        />
    );
}
