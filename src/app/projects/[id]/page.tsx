'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import NovelEditor from '@/components/editor/NovelEditor';
import EmptyState from '@/components/common/EmptyState';
import CommentComponent from '@/components/projects/CommentComponent';
import { useAuth } from '@/contexts/AuthContext';
import { useViewCount } from '@/hooks/useViewCount';
import { ProjectPost } from '@/types/project';
import { JSONContent } from 'novel';
import { Heart, MessageCircle, Bookmark, Share } from 'lucide-react';

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { user, loading: authLoading } = useAuth();

    const [post, setPost] = useState<ProjectPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowingLoading, setIsFollowingLoading] = useState(false);


    // 조회수 훅
    const { views } = useViewCount({
        postType: 'project',
        postId: parseInt(id),
        initialViews: post?.views || 0
    });

    // 최신 좋아요 카운트만 가져오는 함수
    const fetchLatestLikesCount = useCallback(async () => {
        try {
            const response = await fetch(`/api/projects/${id}`);
            const data = await response.json();
            if (response.ok && data.project) {
                setPost(prev => prev ? { ...prev, likes_count: data.project.likes_count } : null);
            }
        } catch {

        }
    }, [id]);

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

                // 사용자 신청 상태 및 북마크 상태 확인
                if (user) {
                    const [applicationResponse, bookmarkResponse, likeResponse, followResponse] = await Promise.all([
                        fetch(`/api/projects/${id}/apply?userId=${user.id}`, { credentials: 'include' }),
                        fetch(`/api/posts/${id}/bookmark`, { credentials: 'include' }),
                        fetch(`/api/projects/${id}/like`, { credentials: 'include' }),
                        fetch(`/api/follow?userId=${data.project.author_id}`, { credentials: 'include' })
                    ]);

                    if (applicationResponse.ok) {
                        const applicationData = await applicationResponse.json();
                        setHasApplied(applicationData.hasApplied);
                    }

                    if (bookmarkResponse.ok) {
                        const bookmarkData = await bookmarkResponse.json();
                        setIsBookmarked(bookmarkData.isBookmarked);
                    }

                    if (likeResponse.ok) {
                        const likeData = await likeResponse.json();
                        setIsLiked(likeData.liked);
                    }

                    if (followResponse.ok) {
                        const followData = await followResponse.json();
                        setIsFollowing(followData.isFollowing);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : '프로젝트를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, authLoading, user]);

    // 프로젝트 데이터 새로고침 함수
    const refreshProjectData = useCallback(async () => {
        try {
            const response = await fetch(`/api/projects/${id}?t=${Date.now()}`);
            const data = await response.json();

            if (response.ok && data.project) {
                setPost(data.project);
            }
        } catch {

        }
    }, [id]);

    // 페이지 포커스 시 최신 데이터 업데이트 (새로고침 효과)
    useEffect(() => {
        const handleFocus = () => {
            fetchLatestLikesCount();
            refreshProjectData();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [id, fetchLatestLikesCount, refreshProjectData]);

    // 조회수는 useViewCount 훅에서 자동으로 처리됨 (세션당 1회)

    const handleApply = () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (user.id === post?.author_id) {
            alert('자신의 프로젝트에는 신청할 수 없습니다.');
            return;
        }

        if (post?.project_data?.project_status !== 'recruiting') {
            alert('모집이 마감된 프로젝트입니다.');
            return;
        }

        if (hasApplied) {
            alert('이미 신청한 프로젝트입니다.');
            return;
        }

        setShowApplicationModal(true);
    };

    const handleBookmark = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (isBookmarking) return;

        setIsBookmarking(true);
        try {
            const response = await fetch(`/api/posts/${id}/bookmark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '북마크 처리에 실패했습니다.');
            }

            setIsBookmarked(data.isBookmarked);
        } catch {
            alert('북마크 처리 중 오류가 발생했습니다.');
        } finally {
            setIsBookmarking(false);
        }
    };

    // 좋아요 토글
    const handleLike = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (isLiking) return;

        setIsLiking(true);

        try {
            const response = await fetch(`/api/projects/${id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.liked);
                // 좋아요 수 업데이트
                if (data.likes_count !== undefined) {
                    setPost(prev => prev ? { ...prev, likes_count: data.likes_count } : null);
                }
            } else {
            }
        } catch {
        } finally {
            setIsLiking(false);
        }
    };

    // 팔로우 토글
    const handleFollow = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (user.id === post?.author_id) {
            alert('자신을 팔로우할 수 없습니다.');
            return;
        }

        if (isFollowingLoading) return;

        setIsFollowingLoading(true);

        try {
            const response = await fetch('/api/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ userId: post?.author_id })
            });

            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
            } else {
            }
        } catch {
        } finally {
            setIsFollowingLoading(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title || '프로젝트',
                    text: post?.subtitle || '',
                    url: window.location.href,
                });
            } catch {
            }
        } else {
            // 클립보드에 URL 복사
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('링크가 클립보드에 복사되었습니다.');
            } catch {
                alert('링크 복사에 실패했습니다.');
            }
        }
    };

    // 프로젝트 타입별 기본 색상 가져오기
    const getProjectTypeColor = () => {
        const projectType = (post as unknown as Record<string, unknown>)?.project_type as Record<string, unknown>;
        if (projectType?.color) {
            return projectType.color as string;
        }

        // 기본 색상 (fallback)
        return '#3B82F6';
    };

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
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
            <Navigation />

            <main className="pt-24 pb-24 lg:pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto relative">
                    {/* 프로젝트 대표 이미지 */}
                    <div className="mb-8">
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
                            {post.thumbnail ? (
                                <Image
                                    src={post.thumbnail}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div
                                    className="w-full h-full rounded-2xl relative overflow-hidden"
                                    style={{
                                        background: `linear-gradient(135deg, ${getProjectTypeColor()}15 0%, ${getProjectTypeColor()}25 50%, ${getProjectTypeColor()}35 100%)`
                                    }}
                                >
                                    {/* 그라데이션 오버레이 효과 */}
                                    <div
                                        className="absolute inset-0 opacity-20"
                                        style={{
                                            background: `radial-gradient(circle at 30% 20%, ${getProjectTypeColor()}40 0%, transparent 50%), 
                                                        radial-gradient(circle at 70% 80%, ${getProjectTypeColor()}30 0%, transparent 50%)`
                                        }}
                                    ></div>

                                    {/* 미묘한 패턴 효과 */}
                                    <div
                                        className="absolute inset-0 opacity-10"
                                        style={{
                                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${getProjectTypeColor()}20 10px, ${getProjectTypeColor()}20 20px)`
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 프로젝트 헤더 */}
                    <div className="mb-4 p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
                                {post.subtitle && (
                                    <p className="text-xl text-slate-600 mb-3 leading-relaxed">{post.subtitle}</p>
                                )}


                                {/* 작성자 정보와 작성일자 */}
                                <div className="flex items-center gap-3">
                                    {/* 작성자 정보 */}
                                    {post.author && (
                                        <div className="flex items-center gap-2">
                                            <div
                                                onClick={() => window.location.href = `/profile/${post.author?.nickname}`}
                                                className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 overflow-hidden"
                                            >
                                                {post.author.profile_image ? (
                                                    <Image
                                                        src={post.author.profile_image}
                                                        alt={post.author.nickname}
                                                        fill
                                                        className="object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <span className="text-white text-sm font-bold">
                                                        {post.author.nickname.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                onClick={() => window.location.href = `/profile/${post.author?.nickname}`}
                                                className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                                            >
                                                {post.author.nickname}
                                            </p>
                                        </div>
                                    )}

                                    {/* 팔로우 버튼 */}
                                    {post.author && user && user.id !== post.author_id && (
                                        <button
                                            onClick={handleFollow}
                                            disabled={isFollowingLoading}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isFollowing
                                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                                }`}
                                        >
                                            {isFollowingLoading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                            ) : isFollowing ? (
                                                '팔로잉'
                                            ) : (
                                                '팔로우'
                                            )}
                                        </button>
                                    )}

                                    {/* 작성일자 */}
                                    <p className="text-sm text-slate-500">
                                        {new Date(post.created_at).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* 통계 정보와 액션 버튼들 - 좌우 배치 */}
                                <div className="flex items-center justify-between mt-4">
                                    {/* 왼쪽: 조회수, 댓글 수 */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-600">{views}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-gray-600">{post.comments_count || 0}</span>
                                        </div>
                                    </div>

                                    {/* 오른쪽: 액션 버튼들 */}
                                    <div className="flex items-center gap-2">
                                        {/* 좋아요 버튼 */}
                                        <button
                                            onClick={handleLike}
                                            disabled={isLiking || !user}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${!user
                                                ? 'text-gray-400'
                                                : isLiked
                                                    ? 'text-red-600 bg-red-50'
                                                    : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                            <span className="text-sm font-medium">{post.likes_count || 0}</span>
                                        </button>

                                        {/* 북마크 버튼 */}
                                        <button
                                            onClick={handleBookmark}
                                            disabled={isBookmarking || !user}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${!user
                                                ? 'text-gray-400'
                                                : isBookmarked
                                                    ? 'text-yellow-600 bg-yellow-50'
                                                    : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
                                                }`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                            <span className="text-sm font-medium">{isBookmarked ? '저장됨' : '저장'}</span>
                                        </button>

                                        {/* 공유하기 버튼 */}
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-200 transition-all duration-200"
                                        >
                                            <Share className="w-4 h-4" />
                                            <span className="text-sm font-medium">공유</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 프로젝트 신청 버튼 - 조회수, 댓글 수 아래에 배치 */}
                                {post?.project_data?.project_status === 'recruiting' &&
                                    new Date(post.project_data.deadline) > new Date() && (
                                        <div className="mt-4 flex justify-center">
                                            <button
                                                onClick={handleApply}
                                                disabled={hasApplied || !user || user.id === post.author_id}
                                                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${!user || user.id === post.author_id || hasApplied
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:-translate-y-1'
                                                    }`}
                                            >
                                                {hasApplied ? (
                                                    '신청 완료'
                                                ) : (
                                                    '프로젝트 신청하기'
                                                )}
                                            </button>
                                        </div>
                                    )}
                            </div>
                        </div>


                    </div>

                    {/* 프로젝트 정보 */}
                    {post.project_data && (
                        <div className="mb-8 pt-4 pb-8 px-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">프로젝트 정보</h2>
                            <div className="border-b border-gray-200 mb-6"></div>

                            {/* 프로젝트 목표 */}
                            {post.project_data.project_goals && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">프로젝트 목표</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                                        <p className="text-slate-700 leading-relaxed font-semibold">
                                            {post.project_data.project_goals}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 기본 정보 그리드 - 미니멀 디자인 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {/* 프로젝트 타입 */}
                                <div className="bg-gradient-to-br from-blue-50/60 to-blue-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">프로젝트 타입</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{post.project_type?.name || 'N/A'}</div>
                                </div>

                                {/* 팀 구성 */}
                                <div className="bg-gradient-to-br from-emerald-50/60 to-emerald-100/40 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">팀 구성</span>
                                        </div>
                                        {(post.applicant_count || 0) > 0 && (
                                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                                대기 {post.applicant_count}명
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {post.approved_members || 0}/{post.project_data.team_size}명
                                    </div>
                                    <div className="mt-2 w-full bg-emerald-200 rounded-full h-1.5">
                                        <div
                                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min(((post.approved_members || 0) / post.project_data.team_size) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* 난이도 */}
                                <div className="bg-gradient-to-br from-orange-50/60 to-orange-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">난이도</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {post.project_data.difficulty === 'beginner' ? '초급' :
                                            post.project_data.difficulty === 'intermediate' ? '중급' :
                                                post.project_data.difficulty === 'advanced' ? '고급' :
                                                    post.project_data.difficulty}
                                    </div>
                                </div>

                                {/* 진행 방식 */}
                                <div className="bg-gradient-to-br from-purple-50/60 to-purple-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">진행 방식</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {post.project_data.location === 'online' ? '온라인' :
                                            post.project_data.location === 'offline' ? '오프라인' :
                                                post.project_data.location === 'hybrid' ? '하이브리드' :
                                                    post.project_data.location}
                                    </div>
                                </div>

                                {/* 모집 마감 */}
                                <div className="bg-gradient-to-br from-red-50/60 to-red-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">모집 마감</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {new Date(post.project_data.deadline).toLocaleDateString('ko-KR', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                {/* 프로젝트 상태 */}
                                <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center ${post.project_data.project_status === 'recruiting' ? 'bg-red-500' :
                                            post.project_data.project_status === 'active' ? 'bg-green-500' :
                                                post.project_data.project_status === 'completed' ? 'bg-purple-500' :
                                                    'bg-gray-500'
                                            }`}>
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">프로젝트 상태</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {post.project_data.project_status === 'recruiting' ? '모집중' :
                                            post.project_data.project_status === 'active' ? '진행중' :
                                                post.project_data.project_status === 'completed' ? '완료' :
                                                    post.project_data.project_status === 'cancelled' ? '취소됨' :
                                                        post.project_data.project_status}
                                    </div>
                                </div>
                            </div>

                            {/* 필요 기술 */}
                            {post.project_data.needed_skills && post.project_data.needed_skills.length > 0 && (
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900">필요 기술</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {post.project_data.needed_skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-bold">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(post.project_data.github_url || post.project_data.demo_url) && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">외부 링크</h3>
                                    <div className="flex gap-4">
                                        {post.project_data.github_url && (
                                            <a
                                                href={post.project_data.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 font-medium"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                                </svg>
                                                GitHub
                                            </a>
                                        )}
                                        {post.project_data.demo_url && (
                                            <a
                                                href={post.project_data.demo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                데모 보기
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 프로젝트 내용 */}
                    <div className="mb-4 pt-4 pb-4 px-8">
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">프로젝트 상세 내용</h3>
                        <div className="border-b border-gray-200 mb-6"></div>
                        <div className="prose prose-lg max-w-none [&_.novel-editor]:!min-h-0 [&_.novel-editor]:!h-auto">
                            <NovelEditor
                                initialContent={post.content as JSONContent | null | undefined}
                                editable={false}
                                className="!min-h-0"
                            />
                        </div>
                    </div>

                </div>
            </main>

            {/* 댓글 섹션 */}
            {post && (
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="p-8">
                            <CommentComponent projectId={post.id} />
                        </div>
                    </div>
                </div>
            )}

            {/* 모바일/태블릿용 하단 고정 메뉴바 */}
            <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between gap-3">
                        {/* 조회수, 좋아요, 댓글 수 */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="text-xs font-medium text-gray-600">{views}</span>
                            </div>

                            <button
                                onClick={handleLike}
                                disabled={isLiking || !user}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${!user
                                    ? 'text-gray-400'
                                    : isLiked
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-xs font-medium">{post?.likes_count || 0}</span>
                            </button>

                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-gray-600">{post?.comments_count || 0}</span>
                            </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-2">
                            {/* 프로젝트 신청 버튼 */}
                            {post?.project_data?.project_status === 'recruiting' &&
                                new Date(post.project_data.deadline) > new Date() && (
                                    <button
                                        onClick={handleApply}
                                        disabled={hasApplied || !user || user.id === post.author_id}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${!user || user.id === post.author_id || hasApplied
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                    >
                                        {hasApplied ? '신청완료' : '신청'}
                                    </button>
                                )}

                            {/* 북마크 버튼 */}
                            <button
                                onClick={handleBookmark}
                                disabled={isBookmarking || !user}
                                className={`p-2 rounded-lg transition-all duration-200 ${!user
                                    ? 'text-gray-400'
                                    : isBookmarked
                                        ? 'text-yellow-600 bg-yellow-50'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>

                            {/* 공유하기 버튼 */}
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
                            >
                                <Share className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 프로젝트 신청 모달 */}
            {showApplicationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">프로젝트 신청</h2>
                            <button
                                onClick={() => setShowApplicationModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <ProjectApplicationForm
                            projectId={id}
                            onSuccess={() => {
                                setShowApplicationModal(false);
                                setHasApplied(true);
                                alert('프로젝트 신청이 완료되었습니다!');
                            }}
                            onCancel={() => setShowApplicationModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// 프로젝트 신청 폼 컴포넌트
function ProjectApplicationForm({ projectId, onSuccess, onCancel }: {
    projectId: string;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        motivation: '',
        relevantExperience: '',
        availableTime: '',
        portfolioUrl: '',
        githubUrl: '',
        additionalInfo: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.motivation.trim()) {
            setError('지원 동기를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(`/api/projects/${projectId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id,
                    ...formData
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '신청에 실패했습니다.');
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : '신청 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-700 font-medium">{error}</span>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="motivation" className="block text-sm font-semibold text-slate-900 mb-2">
                    지원 동기 <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="이 프로젝트에 지원하는 이유를 자세히 설명해주세요."
                    required
                />
            </div>

            <div>
                <label htmlFor="relevantExperience" className="block text-sm font-semibold text-slate-900 mb-2">
                    관련 경험
                </label>
                <textarea
                    id="relevantExperience"
                    value={formData.relevantExperience}
                    onChange={(e) => setFormData(prev => ({ ...prev, relevantExperience: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="이 프로젝트와 관련된 경험이나 기술을 설명해주세요."
                />
            </div>

            <div>
                <label htmlFor="availableTime" className="block text-sm font-semibold text-slate-900 mb-2">
                    참여 가능 시간
                </label>
                <input
                    type="text"
                    id="availableTime"
                    value={formData.availableTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, availableTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="예: 주 10시간, 주말 가능 등"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="portfolioUrl" className="block text-sm font-semibold text-slate-900 mb-2">
                        포트폴리오 URL
                    </label>
                    <input
                        type="text"
                        id="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="포트폴리오 링크 또는 텍스트를 입력하세요"
                    />
                </div>

                <div>
                    <label htmlFor="githubUrl" className="block text-sm font-semibold text-slate-900 mb-2">
                        GitHub URL
                    </label>
                    <input
                        type="text"
                        id="githubUrl"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="GitHub 링크 또는 텍스트를 입력하세요"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="additionalInfo" className="block text-sm font-semibold text-slate-900 mb-2">
                    추가 정보
                </label>
                <textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="기타 전달하고 싶은 내용이 있다면 작성해주세요."
                />
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? '신청 중...' : '신청하기'}
                </button>
            </div>
        </form>
    );
}