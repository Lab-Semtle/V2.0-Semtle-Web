'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CommentSystem from '@/components/common/CommentSystem';
import NovelEditor from '@/components/editor/NovelEditor';
import { ResourcePost } from '@/types/resource';
import { Download, ArrowLeft, MessageCircle, Share, Heart, Bookmark, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { JSONContent } from 'novel';
import { useRouter } from 'next/navigation';

export default function ResourceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const resourceId = params.id as string;
    const [resource, setResource] = useState<ResourcePost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowingLoading, setIsFollowingLoading] = useState(false);
    const { user, isAdmin } = useAuth();

    const fetchResource = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/resources/${resourceId}`);
            if (response.ok) {
                const data = await response.json();
                setResource(data.resource);
                setLikesCount(data.resource.likes_count || 0);
            } else {
                setError('자료를 찾을 수 없습니다.');
            }
        } catch {
            setError('자료를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [resourceId]);

    const checkLikeStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/resources/${resourceId}/like`);
            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.isLiked);
            }
        } catch {
        }
    }, [resourceId]);

    const checkBookmarkStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/resources/${resourceId}/bookmark`);
            if (response.ok) {
                const data = await response.json();
                setIsBookmarked(data.isBookmarked);
            }
        } catch {
        }
    }, [resourceId]);

    const checkFollowStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/follow?userId=${resource?.author_id}`);
            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
            }
        } catch {
        }
    }, [resource?.author_id]);

    // 자료 상세 정보 조회
    useEffect(() => {
        fetchResource();
    }, [resourceId, fetchResource]);

    // 좋아요, 북마크, 팔로우 상태 확인
    useEffect(() => {
        if (user && resource) {
            checkLikeStatus();
            checkBookmarkStatus();
            checkFollowStatus();
        }
    }, [user, resource, checkBookmarkStatus, checkFollowStatus, checkLikeStatus]);

    const handleLike = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`/api/resources/${resourceId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.isLiked);
                setLikesCount(data.likesCount || 0);
            } else {
                const errorData = await response.json().catch(() => ({ error: '좋아요 처리 중 오류가 발생했습니다.' }));
                console.error('좋아요 처리 오류:', errorData);
                alert(errorData.error || '좋아요 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('좋아요 처리 중 오류:', error);
            alert('좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    const handleBookmark = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`/api/resources/${resourceId}/bookmark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsBookmarked(data.isBookmarked);
            }
        } catch {
        }
    };

    const handleDownload = async (fileUrl?: string, fileName?: string) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        const downloadUrl = fileUrl || resource?.files?.[0]?.file_path;
        const downloadFileName = fileName || resource?.files?.[0]?.original_filename || `resource_${resourceId}`;

        if (!downloadUrl) {
            alert('다운로드할 파일이 없습니다.');
            return;
        }

        setIsDownloading(true);

        try {
            const apiUrl = `/api/resources/${resourceId}/download${fileUrl ? `?file=${encodeURIComponent(fileUrl)}` : ''}`;
            const response = await fetch(apiUrl);

            if (response.ok) {
                // Safari 호환성을 위한 다운로드 방식
                const blob = await response.blob();

                // Safari 감지
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

                if (isSafari) {
                    // Safari의 경우 새 창에서 직접 다운로드
                    const url = window.URL.createObjectURL(blob);
                    const newWindow = window.open(url, '_blank');
                    if (!newWindow) {
                        // 팝업이 차단된 경우 대체 방법
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = downloadFileName;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    // URL 정리는 약간 지연 후
                    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                } else {
                    // 다른 브라우저의 경우 기존 방식
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = downloadFileName;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }

                // 다운로드 후 자료 정보 갱신
                await fetchResource();
            } else {
                alert('다운로드에 실패했습니다.');
            }
        } catch (error) {
            console.error('다운로드 오류:', error);
            alert('다운로드 중 오류가 발생했습니다.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: resource?.title,
                    text: resource?.subtitle,
                    url: window.location.href,
                });
            } catch {
            }
        } else {
            // 클립보드에 URL 복사
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 클립보드에 복사되었습니다.');
        }
    };

    // 팔로우 토글
    const handleFollow = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (user.id === resource?.author_id) {
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
                body: JSON.stringify({ userId: resource?.author_id })
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '알 수 없음';

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDelete = async () => {
        if (!resource) return;

        if (!confirm('정말로 이 자료를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            const response = await fetch(`/api/resources/${resourceId}/delete`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                alert('자료가 성공적으로 삭제되었습니다.');
                router.push('/resources');
            } else {
                const data = await response.json();
                alert(data.error || '자료 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('자료 삭제 오류:', error);
            alert('자료 삭제 중 오류가 발생했습니다.');
        }
    };

    // getFileTypeIcon, getFileTypeLabel 함수 정의 및 관련 사용 코드 모두 삭제

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (error || !resource) {
        return (
            <div className="min-h-screen bg-white">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-900 mb-4">자료를 찾을 수 없습니다</h1>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <Link
                            href="/resources"
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            자료실로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // getFileTypeIcon 함수 정의 제거
    // const FileTypeIcon = getFileTypeIcon();

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">

            <main className="pt-12 sm:pt-24 pb-24 lg:pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* 상단 버튼들 */}
                    <div className="flex mb-6 sm:mb-8 items-center justify-between gap-2 sm:gap-4">
                        {/* 좌측: 자료실 게시판으로 버튼 (항상 표시) */}
                        <Link
                            href="/resources"
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-base rounded-lg sm:rounded-xl hover:bg-blue-700 hover:shadow-md transition-all duration-300 font-medium group whitespace-nowrap"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-300 flex-shrink-0" />
                            <span className="hidden sm:inline">자료실 게시판으로</span>
                            <span className="sm:hidden">목록</span>
                        </Link>
                        {/* 우측: 권한 있는 유저용 수정/삭제 버튼 */}
                        {(isAdmin() || (user && resource?.author_id === user.id)) && (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/resources/edit/${resourceId}`}
                                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-600 text-white text-xs sm:text-base rounded-lg sm:rounded-xl hover:bg-amber-700 hover:shadow-md transition-all duration-300 font-medium group whitespace-nowrap"
                                >
                                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">수정하기</span>
                                    <span className="sm:hidden">수정</span>
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white text-xs sm:text-base rounded-lg sm:rounded-xl hover:bg-red-700 hover:shadow-md transition-all duration-300 font-medium group whitespace-nowrap"
                                >
                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">삭제하기</span>
                                    <span className="sm:hidden">삭제</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 자료 헤더 */}
                    <div>
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 pt-4 sm:pt-0">{resource.title}</h1>
                                {resource.subtitle && (
                                    <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-3 leading-relaxed">{resource.subtitle}</p>
                                )}

                                {/* 작성자 정보와 작성일자 */}
                                <div className="flex items-center gap-3">
                                    {/* 작성자 정보 */}
                                    {resource.author && (
                                        <div className="flex items-center gap-2">
                                            <div
                                                onClick={() => window.location.href = `/profile/${resource.author?.nickname}`}
                                                className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 overflow-hidden"
                                            >
                                                {resource.author.profile_image ? (
                                                    <Image
                                                        src={resource.author.profile_image ?? ''}
                                                        alt={resource.author.nickname ?? ''}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-slate-600 text-sm font-bold">
                                                        {(resource.author.nickname?.charAt(0).toUpperCase()) ?? ''}
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                onClick={() => window.location.href = `/profile/${resource.author?.nickname}`}
                                                className="font-semibold text-slate-900 text-sm hover:text-purple-600 transition-colors duration-200 cursor-pointer"
                                            >
                                                {resource.author.nickname}
                                            </p>
                                        </div>
                                    )}

                                    {/* 팔로우 버튼 */}
                                    {resource.author && user && user.id !== resource.author_id && (
                                        <button
                                            onClick={handleFollow}
                                            disabled={isFollowingLoading}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isFollowing
                                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                : 'bg-purple-500 text-white hover:bg-purple-600'
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
                                        {(() => {
                                            interface ResourceWithCreatedAt extends Omit<ResourcePost, 'created_at'> {
                                                created_at?: string;
                                            }
                                            const resourceWithDate = resource as ResourceWithCreatedAt;
                                            return resource.published_at
                                                ? formatDate(resource.published_at)
                                                : resourceWithDate.created_at
                                                    ? formatDate(resourceWithDate.created_at)
                                                    : '날짜 정보 없음';
                                        })()}
                                    </p>
                                </div>

                                {/* 액션 버튼들과 통계 정보 */}
                                <div className="flex items-center justify-between mt-4">
                                    {/* 통계 정보 */}
                                    <div className="flex items-center gap-6">
                                        {/* 다운로드 수 */}
                                        <div className="flex items-center gap-1">
                                            <Download className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm font-medium text-gray-600">{resource?.downloads_count ?? 0}</span>
                                        </div>

                                        {/* 댓글 수 */}
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-gray-600">{resource?.comments_count || 0}</span>
                                        </div>
                                    </div>

                                    {/* 액션 버튼들 */}
                                    <div className="flex items-center gap-3">
                                        {/* 좋아요 버튼 */}
                                        <div className="flex items-center gap-2">
                                            {/* 좋아요 숫자 - 모바일에서만 표시 */}
                                            <span className="sm:hidden text-sm font-medium text-gray-600">{likesCount}</span>

                                            <button
                                                onClick={handleLike}
                                                disabled={!user}
                                                className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg border transition-all duration-200 ${!user
                                                    ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                                                    : isLiked
                                                        ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
                                                        : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                                <span className="hidden sm:inline text-sm font-medium">{likesCount}</span>
                                            </button>
                                        </div>

                                        {/* 북마크 버튼 */}
                                        <button
                                            onClick={handleBookmark}
                                            disabled={!user}
                                            className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg border transition-all duration-200 ${!user
                                                ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                                                : isBookmarked
                                                    ? 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
                                                    : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                            <span className="hidden sm:inline text-sm font-medium">{isBookmarked ? '저장됨' : '저장'}</span>
                                        </button>


                                        {/* 공유하기 버튼 */}
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-gray-100 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-200 transition-all duration-200"
                                        >
                                            <Share className="w-4 h-4" />
                                            <span className="hidden sm:inline text-sm font-medium">공유</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 자료 정보 */}
                    <div className="mb-8">
                        {/* 구분선 */}
                        <div className="border-b border-gray-200 mb-6"></div>

                        {/* 자료 상세 정보 뱃지들 */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(() => {
                                interface ResourceWithDetails extends ResourcePost {
                                    year?: number | null;
                                    semester?: string | null;
                                    subject?: string | null;
                                    professor?: string | null;
                                    difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null;
                                }
                                const resourceWithDetails = resource as ResourceWithDetails;
                                return (
                                    <>
                                        {/* 연도 + 학기 */}
                                        {(resourceWithDetails.year || resourceWithDetails.semester) && (
                                            <span className="inline-flex items-center px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                                                {resourceWithDetails.year && resourceWithDetails.semester ? `${resourceWithDetails.year}년도 ${resourceWithDetails.semester}` :
                                                    resourceWithDetails.year ? `${resourceWithDetails.year}년도` : resourceWithDetails.semester}
                                            </span>
                                        )}
                                        {/* 과목 */}
                                        {resourceWithDetails.subject && (
                                            <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                                {resourceWithDetails.subject}
                                            </span>
                                        )}
                                        {/* 교수 */}
                                        {resourceWithDetails.professor && (
                                            <span className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium">
                                                {resourceWithDetails.professor}
                                            </span>
                                        )}
                                        {/* 난이도 */}
                                        {resourceWithDetails.difficulty_level && (
                                            <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-sm font-medium">
                                                {resourceWithDetails.difficulty_level === 'beginner' ? '초급' :
                                                    resourceWithDetails.difficulty_level === 'intermediate' ? '중급' : '고급'}
                                            </span>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* 첨부 파일 - 자료정보 위쪽에 표시 */}
                        {resource.files && resource.files.length > 0 && (
                            <div className="mb-6">
                                <div className="space-y-3">
                                    {resource.files.map((file, index) => (
                                        <div key={file.id || index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-medium text-slate-900">{file.original_filename}</p>
                                                    <p className="text-sm text-slate-500">{formatFileSize(file.file_size || file.size || 0)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(file.file_path || file.url, file.original_filename)}
                                                disabled={isDownloading}
                                                className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span className="hidden sm:inline">다운로드</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 자료 내용 */}
                    {((resource as unknown as { content?: JSONContent }).content) && (
                        <div className="mb-4 pt-4 pb-4">
                            <div className="prose prose-sm sm:prose-lg max-w-none [&_.novel-editor]:!min-h-0 [&_.novel-editor]:!h-auto">
                                <NovelEditor
                                    initialContent={(resource as unknown as { content?: JSONContent }).content}
                                    editable={false}
                                    className="!min-h-0"
                                />
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* 댓글 섹션 */}
            {resource && (
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <CommentSystem postType="resource" postId={resource.id} />
                    </div>
                </div>
            )}

            {/* 댓글 섹션 하단 여백 */}
            <div className="h-16"></div>

        </div>
    );
}