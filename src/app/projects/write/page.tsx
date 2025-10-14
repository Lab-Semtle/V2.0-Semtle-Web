'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProjectPostForm from '@/components/forms/ProjectPostForm';
import { JSONContent } from 'novel';

interface PostFormData {
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  status?: string;
  project_type_id?: number;
  team_size?: number;
  needed_skills?: string[];
  deadline?: string;
  difficulty?: string;
  location?: string;
  project_goals?: string;
  tech_stack?: string[];
  github_url?: string;
  demo_url?: string;
}

export default function WriteProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSave = async (formData: PostFormData, content: JSONContent) => {
    try {

      const response = await fetch('/api/projects', {
        method: 'POST',
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
        throw new Error(errorData.error || '게시물 저장에 실패했습니다.');
      }

      const result = await response.json();

      // 상태에 따라 다른 메시지 표시
      if (formData.status === 'draft') {
        alert('프로젝트가 임시저장되었습니다!');
      } else {
        alert('프로젝트가 성공적으로 등록되었습니다!');
        router.push('/projects');
      }
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <ProjectPostForm
      onSave={handleSave}
      isEditing={false}
      loading={false}
    />
  );
}
