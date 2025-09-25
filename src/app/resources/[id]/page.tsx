'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import NovelEditor from '@/components/editor/NovelEditor';
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { JSONContent } from 'novel';

interface Post {
    id: string;
    title: string;
    thumbnail?: string;
    category?: {
        name: string;
    };
    date: string;
    description?: string;
    content: unknown;
}

export default function ResourceDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { loading: authLoading } = useAuth();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null); // 이전 오류 상태 초기화

                if (authLoading) return;

                // 실제 API 호출
                const response = await fetch(`/api/resources/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '자료를 불러올 수 없습니다.');
                }

                setPost(data.resource);
            } catch (err) {
                console.error('게시물 로드 중 오류:', err);
                setError(err instanceof Error ? err.message : '게시물을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (id && !authLoading) {
            fetchData();
        }
    }, [id, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-black">
                <Navigation />
                <main className="px-3 sm:px-4 md:px-6 py-8">
                    <div className="max-w-4xl mx-auto">
                        <EmptyState
                            title="자료를 찾을 수 없습니다"
                            description={error || '요청하신 자료가 존재하지 않습니다.'}
                            action={{
                                label: "자료실로 돌아가기",
                                onClick: () => window.location.href = "/resources"
                            }}
                            className="text-white"
                        />
                    </div>
                </main>
            </div>
        );
    }

    // const relatedPosts = allPosts
    //     .filter(p => p.category?.name === post.category?.name && p.slug !== post.slug)
    //     .slice(0, 3);

    return (
        <div className="flex flex-col min-h-screen bg-black">
            <Navigation />
            <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 pt-20 sm:pt-24 md:pt-28 lg:pt-8 md:ml-28">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-6">
                        <div className="flex-1 lg:max-w-none max-w-4xl lg:max-w-none">
                            {/* Post Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
                                {post.description && (
                                    <p className="text-gray-300 text-lg mb-4">{post.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span>{post.date}</span>
                                    {post.category && <span>• {post.category.name}</span>}
                                    {post.resource_type && <span>• {post.resource_type.name}</span>}
                                </div>
                            </div>

                            <article>
                                <NovelEditor
                                    initialContent={post.content as JSONContent | null | undefined}
                                    editable={false}
                                    className="text-lg sm:text-xl"
                                    showToolbar={false}
                                    showStatus={false}
                                />
                            </article>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}