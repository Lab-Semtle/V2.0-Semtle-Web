'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import NovelEditor from '@/components/editor/NovelEditor';
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectPost } from '@/types/project';
import { JSONContent } from 'novel';

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { user, loading: authLoading } = useAuth();

    const [post, setPost] = useState<ProjectPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null); // 이전 오류 상태 초기화

                if (authLoading) return;

                // 실제 API 호출
                const response = await fetch(`/api/projects/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '프로젝트를 불러올 수 없습니다.');
                }

                setPost(data.project);
            } catch (err) {
                console.error('프로젝트 로드 오류:', err);
                setError(err instanceof Error ? err.message : '프로젝트를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, authLoading]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navigation />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-white">
                <Navigation />
                <div className="flex items-center justify-center min-h-[400px]">
                    <EmptyState
                        title="프로젝트를 찾을 수 없습니다"
                        description={error || '요청하신 프로젝트가 존재하지 않습니다.'}
                        action={
                            error
                                ? {
                                    label: "다시 시도",
                                    onClick: () => window.location.reload()
                                }
                                : {
                                    label: "프로젝트 목록으로 돌아가기",
                                    onClick: () => window.location.href = "/projects"
                                }
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* 프로젝트 헤더 */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                        {post.subtitle && (
                            <p className="text-lg text-gray-600 mb-4">{post.subtitle}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                            {post.category && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    {post.category.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 프로젝트 정보 */}
                    {post.project_data && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">프로젝트 정보</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="font-medium">프로젝트 타입:</span> {post.project_data.project_type}
                                </div>
                                <div>
                                    <span className="font-medium">팀 크기:</span> {post.project_data.current_members}/{post.project_data.team_size}명
                                </div>
                                <div>
                                    <span className="font-medium">난이도:</span> {post.project_data.difficulty}
                                </div>
                                <div>
                                    <span className="font-medium">진행 방식:</span> {post.project_data.location}
                                </div>
                                <div>
                                    <span className="font-medium">모집 마감:</span> {new Date(post.project_data.deadline).toLocaleDateString('ko-KR')}
                                </div>
                                <div>
                                    <span className="font-medium">상태:</span> {post.project_data.project_status}
                                </div>
                            </div>

                            {post.project_data.needed_skills && post.project_data.needed_skills.length > 0 && (
                                <div className="mt-4">
                                    <span className="font-medium">필요 기술:</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {post.project_data.needed_skills.map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {post.project_data.project_goals && (
                                <div className="mt-4">
                                    <span className="font-medium">프로젝트 목표:</span>
                                    <p className="mt-1 text-gray-700">{post.project_data.project_goals}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 프로젝트 내용 */}
                    <div className="prose prose-lg max-w-none">
                        <NovelEditor
                            initialContent={post.content as JSONContent | null | undefined}
                            editable={false}
                            className="min-h-[400px]"
                            showToolbar={false}
                            showStatus={false}
                        />
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="mt-8 flex gap-4">
                        {user && (
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                프로젝트 신청하기
                            </button>
                        )}
                        <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            공유하기
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}