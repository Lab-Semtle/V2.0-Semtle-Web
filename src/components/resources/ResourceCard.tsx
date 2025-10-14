'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ResourcePost } from '@/types/resource';
import { Calendar, Download, File, Code, Image as ImageIcon, Video, Presentation, GraduationCap, User, Star, Pin, CheckCircle, AlertCircle, Heart, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ResourceCardProps {
    resource: ResourcePost;
    className?: string;
}

export default function ResourceCard({ resource, className = '' }: ResourceCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likesCount, setLikesCount] = useState(resource.likes_count || 0);
    const [bookmarksCount, setBookmarksCount] = useState(resource.bookmarks_count || 0);
    const [isDownloading, setIsDownloading] = useState(false);
    const { user } = useAuth();

    // 좋아요 및 북마크 상태 확인
    useEffect(() => {
        if (user) {
            checkLikeStatus();
            checkBookmarkStatus();
        }
    }, [user, resource.id]);

    const checkLikeStatus = async () => {
        try {
            const response = await fetch(`/api/resources/${resource.id}/like`);
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
            const response = await fetch(`/api/resources/${resource.id}/bookmark`);
            if (response.ok) {
                const data = await response.json();
                setIsBookmarked(data.isBookmarked);
            }
        } catch (error) {
            console.error('북마크 상태 확인 오류:', error);
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`/api/resources/${resource.id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.isLiked);
                setLikesCount(data.likesCount);
            }
        } catch (error) {
            console.error('좋아요 처리 오류:', error);
        }
    };

    const handleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`/api/resources/${resource.id}/bookmark`, {
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

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!resource.file_url) {
            alert('다운로드할 파일이 없습니다.');
            return;
        }

        setIsDownloading(true);

        try {
            const response = await fetch(`/api/resources/${resource.id}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();

                // 파일 다운로드
                const link = document.createElement('a');
                link.href = data.fileUrl;
                link.download = data.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // 다운로드 수 업데이트
                setLikesCount(prev => prev); // 좋아요 수는 변경되지 않음
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
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

    // 자료 타입별 기본 색상 가져오기
    const getResourceTypeColor = () => {
        const resourceType = resource.resource_type;
        if (resourceType?.color) {
            return resourceType.color;
        }

        // 기본 색상 매핑 (fallback)
        const defaultColors: { [key: string]: string } = {
            '문서': '#3B82F6',
            '코드': '#10B981',
            '프레젠테이션': '#8B5CF6',
            '이미지': '#EC4899',
            '동영상': '#EF4444',
            '기타': '#6B7280'
        };

        return defaultColors[resourceType?.name] || '#3B82F6';
    };

    const getStatusInfo = (resource: ResourcePost) => {
        if (!resource.resource_data) {
            return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        }

        return { label: '활성', color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
    };

    const StatusInfo = getStatusInfo(resource);
    const StatusIcon = StatusInfo.icon;
    const FileTypeIcon = getFileTypeIcon(resource.resource_type?.name || 'other');

    return (
        <article
            onClick={() => window.location.href = `/resources/${resource.id}`}
            className={`group bg-transparent rounded-2xl border-0 shadow-none overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-row h-full ${className}`}
        >
            {/* 썸네일 - 왼쪽 */}
            <div className="relative w-48 h-full flex-shrink-0 overflow-hidden rounded-2xl">
                {resource.thumbnail && !imageError ? (
                    <Image
                        src={resource.thumbnail}
                        alt={resource.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div
                        className="w-full h-full relative overflow-hidden flex items-center justify-center rounded-2xl"
                        style={{
                            background: `linear-gradient(135deg, ${getResourceTypeColor()}15 0%, ${getResourceTypeColor()}25 50%, ${getResourceTypeColor()}35 100%)`
                        }}
                    >
                        {/* 그라데이션 오버레이 효과 */}
                        <div
                            className="absolute inset-0 opacity-20 rounded-2xl"
                            style={{
                                background: `radial-gradient(circle at 30% 20%, ${getResourceTypeColor()}40 0%, transparent 50%), 
                                            radial-gradient(circle at 70% 80%, ${getResourceTypeColor()}30 0%, transparent 50%)`
                            }}
                        ></div>

                        {/* 미묘한 패턴 효과 */}
                        <div
                            className="absolute inset-0 opacity-10 rounded-2xl"
                            style={{
                                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${getResourceTypeColor()}20 10px, ${getResourceTypeColor()}20 20px)`
                            }}
                        ></div>

                        <div className="relative z-10">
                            <FileTypeIcon className="w-12 h-12 text-slate-400" />
                        </div>
                    </div>
                )}

                {/* 배지들 */}
                <div className="absolute top-2 left-2 flex gap-1">
                    {resource.is_pinned && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white shadow-md backdrop-blur-sm">
                            <Pin className="w-3 h-3 mr-1" />
                            고정
                        </span>
                    )}
                    {resource.is_featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/90 text-white shadow-md backdrop-blur-sm">
                            <Star className="w-3 h-3 mr-1" />
                            추천
                        </span>
                    )}
                </div>

                {/* 파일 타입 배지와 북마크 버튼 */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {/* 파일 타입 배지 */}
                    <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm"
                        style={{
                            backgroundColor: `${resource.resource_type?.color || '#6B7280'}E6`,
                            color: 'white',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                    >
                        {resource.resource_type?.name || '기타'}
                    </span>

                    {/* 북마크 버튼 */}
                    {user && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleBookmark(e);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-sm ${isBookmarked
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-white/90 text-slate-600 hover:bg-white hover:text-blue-500'
                                }`}
                        >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* 내용 - 우측 */}
            <div className="flex-1 px-4 pt-3 pb-6 flex flex-col">
                {/* 카테고리 */}
                {resource.category && (
                    <div className="mb-2">
                        <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                                backgroundColor: `${resource.category.color}20`,
                                color: resource.category.color
                            }}
                        >
                            {resource.category.name}
                        </span>
                    </div>
                )}

                {/* 제목 */}
                <h3 className="text-2xl text-slate-900 mb-2 line-clamp-2" style={{ fontWeight: 950 }}>
                    {resource.title}
                </h3>

                {/* 부제목 */}
                {resource.subtitle && (
                    <p className="text-lg text-slate-600 mb-3 line-clamp-2">
                        {resource.subtitle}
                    </p>
                )}

                {/* 자료 정보 - 간소화 */}
                {resource.resource_data && (
                    <div className="space-y-2 mb-4">
                        {resource.resource_data.subject && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <GraduationCap className="w-4 h-4" />
                                <span className="truncate">{resource.resource_data.subject}</span>
                            </div>
                        )}

                        {resource.resource_data.professor && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <User className="w-4 h-4" />
                                <span className="truncate">{resource.resource_data.professor} 교수</span>
                            </div>
                        )}

                        {resource.resource_data.semester && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" />
                                <span>{resource.resource_data.semester}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 작성자 정보와 하단 메타 정보 */}
                <div className="mt-auto">
                    {/* 하단 메타 정보 - Medium 스타일 */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
                        <div className="flex items-center gap-4">
                            {/* 작성일자 */}
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(resource.created_at)}</span>
                            </div>
                            {/* 다운로드 수 */}
                            <div className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                <span>{resource.downloads_count || 0}</span>
                            </div>
                            {/* 댓글 수 */}
                            <div className="flex items-center gap-1">
                                <File className="w-3 h-3" />
                                <span>{resource.comments_count || 0}</span>
                            </div>
                        </div>

                        {/* 작성자 정보 */}
                        {resource.author && (
                            <div className="flex items-center gap-2">
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/profile/${resource.author.nickname}`;
                                    }}
                                    className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
                                >
                                    {resource.author.profile_image ? (
                                        <Image
                                            src={resource.author.profile_image}
                                            alt={resource.author.nickname}
                                            width={20}
                                            height={20}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <span className="text-white text-xs font-bold">
                                            {resource.author.nickname.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/profile/${resource.author.nickname}`;
                                    }}
                                    className="text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                                >
                                    {resource.author.nickname}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

