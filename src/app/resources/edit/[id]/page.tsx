'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ResourcePostForm from '@/components/forms/ResourcePostForm';

interface ResourceData {
    id: number;
    title: string;
    subtitle: string;
    content: any;
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
}

export default function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { user, loading } = useAuth();
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
            } catch (error) {
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

    const handleSave = async (formData: any, content: unknown) => {
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

            const result = await response.json();

            if (formData.status === 'draft') {
                alert('자료가 임시저장되었습니다!');
            } else {
                alert('자료가 성공적으로 수정되었습니다!');
                router.push('/mypage');
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
                resource_type_id: resource.resource_type?.id,
                subject: resource.subject || '',
                professor: resource.professor || '',
                semester: resource.semester || '',
                year: resource.year,
                difficulty_level: resource.difficulty_level || '',
                status: resource.status
            }}
            initialContent={resource.content}
        />
    );
}
