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

export default function WriteResourcePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSave = async (formData: PostFormData, content: unknown) => {
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
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
        throw new Error('자료 저장에 실패했습니다.');
      }

      const result = await response.json();
      console.log('Resource saved:', result);

      alert('자료가 성공적으로 저장되었습니다!');
      router.push('/resources');
    } catch (error) {
      console.error('자료 저장 중 오류:', error);
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
      boardType="resources"
    />
  );
}
