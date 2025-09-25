'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PostForm from '@/components/PostForm';

interface ProjectData {
    id: number;
    title: string;
    subtitle: string;
    content: any;
    thumbnail: string;
    category: {
        name: string;
    };
    project_type: {
        id: number;
        name: string;
    };
    team_size: number;
    needed_skills: string[];
    deadline: string;
    difficulty: string;
    location: string;
    project_goals: string;
    tech_stack: string[];
    github_url: string;
    demo_url: string;
    status: 'published' | 'draft';
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    // params를 unwrap
    const resolvedParams = use(params);

    const [project, setProject] = useState<ProjectData | null>(null);
    const [loadingProject, setLoadingProject] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${resolvedParams.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProject(data.project);
                } else {
                    alert('프로젝트를 불러올 수 없습니다.');
                    router.push('/mypage');
                }
            } catch (error) {
                console.error('프로젝트 로드 오류:', error);
                alert('프로젝트를 불러오는 중 오류가 발생했습니다.');
                router.push('/mypage');
            } finally {
                setLoadingProject(false);
            }
        };

        if (user && resolvedParams.id) {
            fetchProject();
        }
    }, [user, resolvedParams.id, router]);

    const handleSave = async (formData: any, content: unknown) => {
        try {
            const response = await fetch(`/api/projects/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    content,
                    board_type: 'projects'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '프로젝트 수정에 실패했습니다.');
            }

            const result = await response.json();
            console.log('Project updated:', result);

            if (formData.status === 'draft') {
                alert('프로젝트가 임시저장되었습니다!');
            } else {
                alert('프로젝트가 성공적으로 수정되었습니다!');
                router.push('/mypage');
            }
        } catch (error) {
            console.error('프로젝트 수정 중 오류:', error);
            throw error;
        }
    };

    if (loading || loadingProject) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !project) {
        return null;
    }

    // 작성자가 아닌 경우 접근 차단
    if (project.author_id !== user.id) {
        alert('수정 권한이 없습니다.');
        router.push('/mypage');
        return null;
    }

    return (
        <PostForm
            onSave={handleSave}
            isEditing={true}
            loading={false}
            boardType="projects"
            initialData={{
                title: project.title,
                description: project.subtitle,
                category: project.category?.name || '',
                thumbnail: project.thumbnail || '',
                project_type_id: project.project_type?.id,
                team_size: project.team_size,
                needed_skills: project.needed_skills || [],
                deadline: project.deadline,
                difficulty: project.difficulty,
                location: project.location,
                project_goals: project.project_goals || '',
                tech_stack: project.tech_stack || [],
                github_url: project.github_url || '',
                demo_url: project.demo_url || '',
                status: project.status
            }}
            initialContent={project.content}
        />
    );
}
