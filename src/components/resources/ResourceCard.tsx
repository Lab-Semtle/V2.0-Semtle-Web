'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ResourcePost } from '@/types/resource';
import { Calendar, Download, File, Code, Image as ImageIcon, Video, Presentation, GraduationCap, User, Star, Pin, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ResourceCardProps {
    resource: ResourcePost;
    className?: string;
}

export default function ResourceCard({ resource, className = '' }: ResourceCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const { user } = useAuth();

    const checkLikeStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/resources/${resource.id}/like`);
            if (response.ok) {
                // 좋아요 상태는 현재 사용하지 않으므로 주석 처리
                // setIsLiked(data.isLiked);
            }
        } catch {
        }
    }, [resource.id]);

    const checkBookmarkStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/resources/${resource.id}/bookmark`);
            if (response.ok) {
                const data = await response.json();
                setIsBookmarked(data.isBookmarked);
            }
        } catch {
        }
    }, [resource.id]);

    // 좋아요 및 북마크 상태 확인
    useEffect(() => {
        if (user) {
            checkLikeStatus();
            checkBookmarkStatus();
        }
    }, [user, resource.id, checkBookmarkStatus, checkLikeStatus]);

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
            }
        } catch {
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
        const resourceType = (resource as unknown as Record<string, unknown>).resource_type as { name: string; color: string } | undefined;
        return resourceType?.color || '#3B82F6';
    };

    const FileTypeIcon = getFileTypeIcon(((resource as unknown as Record<string, unknown>).resource_type as { name: string } | undefined)?.name || 'other');

    return (
        <article
            onClick={() => window.location.href = `/resources/${resource.id}`}
            className={`group bg-transparent rounded-2xl border-0 shadow-none overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row h-full ${className}`}
        >
            {/* 썸네일 - 상단(모바일) / 왼쪽(데스크톱) */}
            <div className="relative w-full sm:w-48 h-48 sm:h-full flex-shrink-0 overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
                {resource.thumbnail && !imageError ? (
                    <Image
                        src={resource.thumbnail}
                        alt={resource.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div
                        className="w-full h-full relative overflow-hidden flex items-center justify-center rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
                        style={{
                            background: `linear-gradient(135deg, ${getResourceTypeColor()}15 0%, ${getResourceTypeColor()}25 50%, ${getResourceTypeColor()}35 100%)`
                        }}
                    >
                        {/* 그라데이션 오버레이 효과 */}
                        <div
                            className="absolute inset-0 opacity-20 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
                            style={{
                                background: `radial-gradient(circle at 30% 20%, ${getResourceTypeColor()}40 0%, transparent 50%), 
                                            radial-gradient(circle at 70% 80%, ${getResourceTypeColor()}30 0%, transparent 50%)`
                            }}
                        ></div>

                        {/* 미묘한 패턴 효과 */}
                        <div
                            className="absolute inset-0 opacity-10 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
                            style={{
                                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${getResourceTypeColor()}20 10px, ${getResourceTypeColor()}20 20px)`
                            }}
                        ></div>

                        <div className="relative z-10">
                            <FileTypeIcon className="w-12 h-12 text-slate-400" />
                        </div>
                    </div>
                )}

                {/* 배지들 - 반응형 */}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {resource.is_pinned && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white shadow-md backdrop-blur-sm">
                            <Pin className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">고정</span>
                        </span>
                    )}
                    {resource.is_featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/90 text-white shadow-md backdrop-blur-sm">
                            <Star className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">추천</span>
                        </span>
                    )}
                </div>

                {/* 파일 타입 배지와 북마크 버튼 - 반응형 */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {/* 파일 타입 배지 */}
                    <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm max-w-20 truncate"
                        style={{
                            backgroundColor: `${((resource as unknown as Record<string, unknown>).resource_type as { color: string } | undefined)?.color || '#6B7280'}E6`,
                            color: 'white',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                    >
                        <span className="truncate">{((resource as unknown as Record<string, unknown>).resource_type as { name: string } | undefined)?.name || '기타'}</span>
                    </span>

                    {/* 북마크 버튼 */}
                    {user && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleBookmark(e);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-sm flex-shrink-0 ${isBookmarked
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-white/90 text-slate-600 hover:bg-white hover:text-blue-500'
                                }`}
                        >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* 내용 - 하단(모바일) / 우측(데스크톱) */}
            <div className="flex-1 px-4 pt-3 pb-6 flex flex-col">
                {/* 카테고리 */}
                {resource.category && (
                    <div className="mb-2">
                        <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold truncate max-w-full"
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
                <h3 className="text-xl sm:text-2xl text-slate-900 mb-2 line-clamp-2" style={{ fontWeight: 950 }}>
                    {resource.title}
                </h3>

                {/* 부제목 */}
                {resource.subtitle && (
                    <p className="text-base sm:text-lg text-slate-600 mb-3 line-clamp-2">
                        {resource.subtitle}
                    </p>
                )}

                {/* 자료 정보 - 반응형 그리드 */}
                {resource.resource_data && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {resource.resource_data.subject && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                                <GraduationCap className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{resource.resource_data.subject}</span>
                            </div>
                        )}

                        {resource.resource_data.professor && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{resource.resource_data.professor} 교수</span>
                            </div>
                        )}

                        {resource.resource_data.semester && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{resource.resource_data.semester}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 작성자 정보와 하단 메타 정보 */}
                <div className="mt-auto">
                    {/* 하단 메타 정보 - 반응형 레이아웃 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs text-slate-500 pt-3">
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                            {/* 작성일자 */}
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{formatDate(resource.created_at)}</span>
                            </div>
                            {/* 다운로드 수 */}
                            <div className="flex items-center gap-1">
                                <Download className="w-3 h-3 flex-shrink-0" />
                                <span>{resource.resource_data?.downloads_count || 0}</span>
                            </div>
                            {/* 댓글 수 */}
                            <div className="flex items-center gap-1">
                                <File className="w-3 h-3 flex-shrink-0" />
                                <span>{resource.comments_count || 0}</span>
                            </div>
                        </div>

                        {/* 작성자 정보 */}
                        {resource.author && (
                            <div className="flex items-center gap-2 min-w-0">
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/profile/${resource.author?.nickname}`;
                                    }}
                                    className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 flex-shrink-0"
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
                                            {resource.author?.nickname?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/profile/${resource.author?.nickname}`;
                                    }}
                                    className="text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer truncate"
                                >
                                    {resource.author?.nickname}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

