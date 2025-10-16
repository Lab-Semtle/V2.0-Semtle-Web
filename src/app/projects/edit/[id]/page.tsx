'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProjectPostForm from '@/components/forms/ProjectPostForm';
import { JSONContent } from 'novel';

interface ProjectPostFormData {
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    status?: string;
    project_type_id?: number;
    team_size?: number;
    deadline?: string;
    difficulty?: string;
    location?: string;
    project_status?: string;
    project_goals?: string;
    needed_skills?: string[];
    tech_stack?: string[];
    github_url?: string;
    demo_url?: string;
}

interface ProjectData {
    id: number;
    title: string;
    subtitle: string;
    content: Record<string, unknown>;
    thumbnail: string;
    author_id: string;
    category: {
        name: string;
    };
    project_type: {
        id: number;
        name: string;
    };
    project_data?: {
        team_size: number;
        needed_skills: string[];
        deadline: string;
        difficulty: string;
        location: string;
        project_goals: string;
        tech_stack: string[];
        github_url: string;
        demo_url: string;
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
    const { user, profile, loading } = useAuth();
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
            } catch {
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

    const handleSave = async (formData: ProjectPostFormData, content: JSONContent) => {
        try {
            const response = await fetch(`/api/projects/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    content,
                    board_type: 'projects',
                    userId: user?.id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '프로젝트 수정에 실패했습니다.');
            }

            await response.json();

            if (formData.status === 'draft') {
                alert('프로젝트가 임시저장되었습니다!');
                router.push(`/profile/${profile?.nickname}`);
            } else {
                alert('프로젝트가 성공적으로 수정되었습니다!');
                router.push(`/profile/${profile?.nickname}`);
            }
        } catch (error) {
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
        <ProjectPostForm
            onSave={handleSave}
            isEditing={true}
            loading={false}
            initialData={{
                title: project.title,
                description: project.subtitle,
                category: project.category?.name || '',
                thumbnail: project.thumbnail || '',
                status: project.status,
                project_type_id: project.project_type?.id,
                team_size: project.project_data?.team_size || project.team_size,
                needed_skills: project.project_data?.needed_skills || project.needed_skills || [],
                deadline: project.project_data?.deadline || project.deadline,
                difficulty: project.project_data?.difficulty || project.difficulty,
                location: project.project_data?.location || project.location,
                project_goals: project.project_data?.project_goals || project.project_goals || '',
                tech_stack: project.project_data?.tech_stack || project.tech_stack || [],
                github_url: project.project_data?.github_url || project.github_url || '',
                demo_url: project.project_data?.demo_url || project.demo_url || '',
            }}
            initialContent={project.content}
        />
    );
}
