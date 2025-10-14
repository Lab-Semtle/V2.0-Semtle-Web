'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/layout/Navigation';
import ResourceCommentComponent from '@/components/resources/ResourceCommentComponent';
import { ResourcePost } from '@/types/resource';
import { Calendar, Download, File, Code, Image as ImageIcon, Video, Presentation, GraduationCap, User, Star, Pin, CheckCircle, AlertCircle, Heart, Bookmark, ArrowLeft, Share2, MessageCircle, Share } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ResourceDetailPage() {
    const params = useParams();
    const resourceId = params.id as string;
    const [resource, setResource] = useState<ResourcePost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [bookmarksCount, setBookmarksCount] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowingLoading, setIsFollowingLoading] = useState(false);
    const { user } = useAuth();

    // 자료 상세 정보 조회
    useEffect(() => {
        fetchResource();
    }, [resourceId]);

    // 좋아요, 북마크, 팔로우 상태 확인
    useEffect(() => {
        if (user && resource) {
            checkLikeStatus();
            checkBookmarkStatus();
            checkFollowStatus();
        }
    }, [user, resource]);

    const fetchResource = async () => {
            try {
                setLoading(true);
            const response = await fetch(`/api/resources/${resourceId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('자료 데이터:', data);
                setResource(data.resource);
                setLikesCount(data.resource.likes_count || 0);
                setBookmarksCount(data.resource.bookmarks_count || 0);
            } else {
                setError('자료를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('자료 조회 오류:', error);
            setError('자료를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

    const checkLikeStatus = async () => {
        try {
            const response = await fetch(`/api/resources/${resourceId}/like`);
            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.isLiked);
            }
        } catch (error) {
            console.error('좋아요 상태 확인 오류:', error);
        }
    };

    const checkBookmarkStatus = async () => {
        try {
            const response = await fetch(`/api/resources/${resourceId}/bookmark`);
            if (response.ok) {
                const data = await response.json();
                setIsBookmarked(data.isBookmarked);
            }
        } catch (error) {
            console.error('북마크 상태 확인 오류:', error);
        }
    };

    const checkFollowStatus = async () => {
        try {
            const response = await fetch(`/api/follow?userId=${resource?.author_id}`);
            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
            }
        } catch (error) {
            console.error('팔로우 상태 확인 오류:', error);
        }
    };

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
            });

            if (response.ok) {
                const data = await response.json();
                console.log('좋아요 응답 데이터:', data);
                setIsLiked(data.isLiked);
                setLikesCount(data.likesCount);
            }
        } catch (error) {
            console.error('좋아요 처리 오류:', error);
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
                setBookmarksCount(data.bookmarksCount);
            }
        } catch (error) {
            console.error('북마크 처리 오류:', error);
        }
    };

    const handleDownload = async (fileUrl?: string, fileName?: string) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        const downloadUrl = fileUrl || resource?.file_path;
        const downloadFileName = fileName || resource?.original_filename || `resource_${resourceId}`;

        if (!downloadUrl) {
            alert('다운로드할 파일이 없습니다.');
            return;
        }

        setIsDownloading(true);

        try {
            const response = await fetch(`/api/resources/${resourceId}/download${fileUrl ? `?file=${encodeURIComponent(fileUrl)}` : ''}`);

            if (response.ok) {
                // 파일 다운로드
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = downloadFileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                alert('다운로드에 실패했습니다.');
            }
        } catch (error) {
            console.error('다운로드 처리 오류:', error);
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
            } catch (error) {
                console.log('공유 취소됨');
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
                console.error('팔로우 응답:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('팔로우 오류:', error);
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

    const getFileTypeIcon = (fileType: string) => {
        switch (fileType) {
            case 'document':
                return File;
            case 'code':
                return Code;
            case 'presentation':
                return Presentation;
            case 'image':
                return ImageIcon;
            case 'video':
                return Video;
            default:
                return File;
        }
    };

    const getFileTypeLabel = (fileType: string) => {
        switch (fileType) {
            case 'document':
                return '문서';
            case 'code':
                return '코드';
            case 'presentation':
                return '프레젠테이션';
            case 'image':
                return '이미지';
            case 'video':
                return '동영상';
            case 'other':
                return '기타';
            default:
                return '파일';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navigation />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (error || !resource) {
        return (
            <div className="min-h-screen bg-white">
                <Navigation />
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

    const FileTypeIcon = getFileTypeIcon(resource.resource_type?.name || 'other');

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
            <Navigation />

            <main className="pt-24 pb-24 lg:pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto relative">

                    {/* 자료 대표 이미지 */}
                            <div className="mb-8">
                        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
                            {resource.thumbnail ? (
                                <Image
                                    src={resource.thumbnail}
                                    alt={resource.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                    <FileTypeIcon className="w-16 h-16 text-purple-400" />
                                </div>
                            )}

                            {/* 배지들 */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                {resource.is_pinned && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-500/90 text-white shadow-md">
                                        <Pin className="w-4 h-4 mr-1" />
                                        고정
                                    </span>
                                )}
                                {resource.is_featured && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/90 text-white shadow-md">
                                        <Star className="w-4 h-4 mr-1" />
                                        추천
                                    </span>
                                )}
                            </div>

                            {/* 파일 타입 */}
                            <div className="absolute top-4 right-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/90 text-slate-700 shadow-md">
                                    {getFileTypeLabel(resource.resource_type?.name || 'other')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 자료 헤더 */}
                    <div className="mb-4 p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-slate-900 mb-4">{resource.title}</h1>
                                {resource.subtitle && (
                                    <p className="text-xl text-slate-600 mb-3 leading-relaxed">{resource.subtitle}</p>
                                )}

                                {/* 작성자 정보와 작성일자 */}
                                <div className="flex items-center gap-3">
                                    {/* 작성자 정보 */}
                                    {resource.author && (
                                        <div className="flex items-center gap-2">
                                            <div
                                                onClick={() => window.location.href = `/profile/${resource.author?.nickname}`}
                                                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
                                            >
                                                {resource.author.profile_image ? (
                                                    <Image
                                                        src={resource.author.profile_image}
                                                        alt={resource.author.nickname}
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <span className="text-white text-sm font-bold">
                                                        {resource.author.nickname.charAt(0).toUpperCase()}
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
                                        {formatDate(resource.created_at)}
                                    </p>
                                </div>

                                {/* 액션 버튼들과 통계 정보 */}
                                <div className="flex items-center justify-between mt-4">
                                    {/* 통계 정보 */}
                                    <div className="flex items-center gap-6">
                                        {/* 다운로드 수 */}
                                        <div className="flex items-center gap-1">
                                            <Download className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm font-medium text-gray-600">{resource?.downloads_count || 0}</span>
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
                                        <button
                                            onClick={handleLike}
                                            disabled={!user}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 ${!user
                                                ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                                                : isLiked
                                                    ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
                                                    : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                            <span className="text-sm font-medium">{likesCount}</span>
                                        </button>

                                        {/* 북마크 버튼 */}
                                        <button
                                            onClick={handleBookmark}
                                            disabled={!user}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 ${!user
                                                ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                                                : isBookmarked
                                                    ? 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
                                                    : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
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
                            </div>
                        </div>
                    </div>

                    {/* 자료 정보 */}
                    <div className="mb-8 pt-4 pb-8 px-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">자료 정보</h2>
                        <div className="border-b border-gray-200 mb-6"></div>

                        {/* 기본 정보 그리드 - 미니멀 디자인 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {/* 자료 타입 */}
                            <div className="bg-gradient-to-br from-purple-50/60 to-purple-100/40 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                                        <File className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">자료 타입</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">{getFileTypeLabel(resource.resource_type?.name || 'other')}</div>
                            </div>

                            {/* 과목 */}
                            {resource.subject && (
                                <div className="bg-gradient-to-br from-blue-50/60 to-blue-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                                            <GraduationCap className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">과목</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{resource.subject}</div>
                                </div>
                            )}

                            {/* 교수 */}
                            {resource.professor && (
                                <div className="bg-gradient-to-br from-emerald-50/60 to-emerald-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                                            <User className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">교수</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{resource.professor}</div>
                                </div>
                            )}

                            {/* 학기 */}
                            {resource.semester && (
                                <div className="bg-gradient-to-br from-orange-50/60 to-orange-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                                            <Calendar className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">학기</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{resource.semester}</div>
                                </div>
                            )}

                            {/* 연도 */}
                            {resource.year && (
                                <div className="bg-gradient-to-br from-red-50/60 to-red-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                                            <Calendar className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">연도</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{resource.year}</div>
                                </div>
                            )}

                            {/* 난이도 */}
                            {resource.difficulty_level && (
                                <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-slate-500 rounded flex items-center justify-center">
                                            <Star className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">난이도</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {resource.difficulty_level === 'beginner' ? '초급' :
                                            resource.difficulty_level === 'intermediate' ? '중급' : '고급'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 첨부 파일 */}
                        {resource.files && resource.files.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">첨부 파일</h3>
                                <div className="space-y-3">
                                    {resource.files.map((file, index) => (
                                        <div key={file.id || index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <File className="w-5 h-5 text-slate-500" />
                                                <div>
                                                    <p className="font-medium text-slate-900">{file.original_filename}</p>
                                                    <p className="text-sm text-slate-500">{formatFileSize(file.file_size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(file.file_path, file.original_filename)}
                                                disabled={isDownloading}
                                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Download className="w-4 h-4" />
                                                다운로드
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 자료 내용 */}
                    {resource.content && (
                        <div className="mb-4 pt-4 pb-4 px-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">자료 상세 내용</h3>
                            <div className="border-b border-gray-200 mb-6"></div>
                            <div className="prose prose-lg max-w-none">
                                {typeof resource.content === 'string' ? (
                                    <div dangerouslySetInnerHTML={{ __html: resource.content }} />
                                ) : (
                                    <pre className="whitespace-pre-wrap text-slate-700">{JSON.stringify(resource.content, null, 2)}</pre>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* 댓글 섹션 */}
            {resource && (
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="p-8">
                            <ResourceCommentComponent resource={resource} />
                        </div>
                    </div>
                </div>
            )}

            {/* 댓글 섹션 하단 여백 */}
            <div className="h-16"></div>

            {/* 모바일/태블릿용 하단 고정 메뉴바 */}
            <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between gap-3">
                        {/* 디버깅 정보 */}
                        {console.log('모바일 메뉴바 렌더링 - likesCount:', likesCount, 'comments_count:', resource?.comments_count)}
                        {/* 좋아요, 댓글 수 */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLike}
                                disabled={!user}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${!user
                                    ? 'text-gray-400'
                                    : isLiked
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-xs font-medium">{likesCount || 0}</span>
                            </button>

                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-gray-600">{resource?.comments_count || 0}</span>
                            </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-2">
                            {/* 북마크 버튼 */}
                            <button
                                onClick={handleBookmark}
                                disabled={!user}
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
        </div>
    );
}