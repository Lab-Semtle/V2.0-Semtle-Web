'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ActivityPostForm from '@/components/forms/ActivityPostForm';
import { JSONContent } from 'novel';

interface ActivityFormData {
  title: string;
  subtitle?: string;
  category_id: number;
  thumbnail?: string | string[];
  status?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  max_participants?: number;
  participation_fee?: number;
  contact_info?: string;
  tags?: string[];
  has_voting?: boolean;
  vote_options?: { id: string; text: string; votes: number }[];
  vote_deadline?: string;
}

export default function WriteActivityPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  const handleSave = async (formData: ActivityFormData, content: JSONContent) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content,
          author_id: user?.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '활동 게시물 저장에 실패했습니다.');
      }

      // 상태에 따라 다른 메시지 표시
      const responseData = await response.json();

      if (formData.status === 'draft') {
        // 임시저장된 활동의 편집 페이지로 이동 (버전 목록 확인 가능)
        if (responseData.activity?.id) {
          // alert는 비동기로 처리하고, 렌더링 완료 후 이동
          window.setTimeout(() => {
            alert('활동이 임시저장되었습니다!');
            router.push(`/activities/edit/${responseData.activity.id}`);
          }, 100);
        } else {
          alert('활동이 임시저장되었습니다!');
        }
      } else {
        window.setTimeout(() => {
          alert('활동이 성공적으로 등록되었습니다!');
          router.push('/activities');
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

  if (!user || !isAdmin()) {
    alert('활동 게시물은 관리자만 작성할 수 있습니다.');
    router.push('/activities');
    return null;
  }

  return (
    <ActivityPostForm
      onSave={handleSave}
      isEditing={false}
      loading={false}
    />
  );
}

