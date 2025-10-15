'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ActivityPostForm from '@/components/forms/ActivityPostForm';
import { JSONContent } from 'novel';

interface ActivityFormData {
  title: string;
  subtitle?: string;
  category_id: number;
  activity_type_id: number;
  thumbnail?: string;
  status?: string;
  activity_status?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  max_participants?: number;
  participation_fee?: number;
  contact_info?: string;
  tags?: string[];
}

interface Activity {
  id: number;
  title: string;
  subtitle?: string;
  content: JSONContent;
  category_id: number;
  activity_type_id: number;
  thumbnail?: string;
  status: string;
  activity_status?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  max_participants?: number;
  participation_fee?: number;
  contact_info?: string;
  tags?: string[];
  author_id: string;
}

export default function EditActivityPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`/api/activities/${id}`);
        if (!response.ok) {
          throw new Error('활동을 불러올 수 없습니다.');
        }
        const data = await response.json();
        setActivity(data.activity);
      } catch (error) {
        console.error('활동 로드 오류:', error);
        alert('활동을 불러오는데 실패했습니다.');
        router.push('/activities');
      } finally {
        setLoading(false);
      }
    };

    if (id && !authLoading) {
      fetchActivity();
    }
  }, [id, authLoading, router]);

  const handleSave = async (formData: ActivityFormData, content: JSONContent) => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '활동 수정에 실패했습니다.');
      }

      alert('활동이 성공적으로 수정되었습니다!');
      router.push(`/activities/${id}`);
    } catch (error) {
      throw error;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    alert('활동 게시물은 관리자만 수정할 수 있습니다.');
    router.push('/activities');
    return null;
  }

  if (!activity) {
    return null;
  }

  return (
    <ActivityPostForm
      onSave={handleSave}
      isEditing={true}
      initialData={activity}
      loading={false}
    />
  );
}

