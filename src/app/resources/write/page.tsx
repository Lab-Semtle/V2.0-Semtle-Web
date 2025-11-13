'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ResourcePostForm from '@/components/forms/ResourcePostForm';

interface PostFormData {
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  category_id?: number;
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
        const errorData = await response.json();
        throw new Error(errorData.error || '자료 저장에 실패했습니다.');
      }

      // 상태에 따라 다른 메시지 표시
      const responseData = await response.json();

      if (formData.status === 'draft') {
        // 임시저장된 자료의 편집 페이지로 이동 (버전 목록 확인 가능)
        if (responseData.resource?.id) {
          // alert는 비동기로 처리하고, 렌더링 완료 후 이동
          window.setTimeout(() => {
            alert('자료가 임시저장되었습니다!');
            router.push(`/resources/edit/${responseData.resource.id}`);
          }, 100);
        } else {
          alert('자료가 임시저장되었습니다!');
        }
      } else {
        window.setTimeout(() => {
          alert('자료가 성공적으로 등록되었습니다!');
          router.push('/resources');
        }, 100);
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
