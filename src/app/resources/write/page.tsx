'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ResourcePostForm from '@/components/forms/ResourcePostForm';

interface PostFormData {
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  status?: string;
  resource_type_id?: number;
  subject?: string;
  professor?: string;
  semester?: string;
  year?: number;
  difficulty_level?: string;
  file_extension?: string;
  original_filename?: string;
  downloads_count?: number;
  rating?: number;
  rating_count?: number;
}

export default function WriteResourcePage() {
  const { user, loading, profile } = useAuth();
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
        const errorData = await response.json();
        throw new Error(errorData.error || '자료 저장에 실패했습니다.');
      }

      await response.json();

      // 상태에 따라 다른 메시지 표시
      if (formData.status === 'draft') {
        alert('자료가 임시저장되었습니다!');
      } else {
        alert('자료가 성공적으로 등록되었습니다!');
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
    <ResourcePostForm
      onSave={handleSave}
      isEditing={false}
      loading={false}
    />
  );
}
