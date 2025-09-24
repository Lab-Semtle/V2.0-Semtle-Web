'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PostForm from '@/components/PostForm';

interface PostFormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnail: string;
  status?: string;
}

export default function WriteProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSave = async (formData: PostFormData, content: unknown) => {
    try {
      console.log('Saving project with data:', { formData, content });

      const response = await fetch('/api/projects', {
        method: 'POST',
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
        throw new Error(errorData.error || '게시물 저장에 실패했습니다.');
      }

      const result = await response.json();
      console.log('Project post saved:', result);

      alert('프로젝트가 성공적으로 등록되었습니다!');
      router.push('/projects');
    } catch (error) {
      console.error('게시물 저장 중 오류:', error);
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
    <PostForm
      onSave={handleSave}
      isEditing={false}
      loading={false}
      boardType="projects"
    />
  );
}
