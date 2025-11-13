'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/post';
import { ArrowLeft, Eye, Heart, MessageCircle, Bookmark, Share2, Pin, Star, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PostHeaderProps {
    post: Post;
    onEdit?: () => void;
    onDelete?: () => void;
    onShare?: () => void;
}

export default function PostHeader({ post, onEdit, onDelete, onShare }: PostHeaderProps) {
    const { user, isAdmin } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryColor = (color: string) => {
        return color || '#3B82F6';
    };

    const isAuthor = user?.id === post.author_id;
    const canEdit = isAuthor || isAdmin();

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.subtitle || '',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 클립보드에 복사되었습니다.');
        }
        onShare?.();
    };

    // 1) board_type 안전하게 추출
    const safeBoardType = (post as unknown as { board_type?: string }).board_type ?? '';
    const boardTypeLabel = safeBoardType.replace('board_prefix_', '');

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 mb-8">
            {/* 뒤로 가기 버튼 */}
            <Link
                href={`/${safeBoardType}`}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 text-slate-700 font-medium w-fit"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>{boardTypeLabel}</span> 목록으로
            </Link>

            {/* 썸네일 */}
            {post.thumbnail && !imageError && (
                <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl">
                    <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                    />

                    {/* 배지들 */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        {((post as unknown as { is_pinned?: boolean }).is_pinned === true) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-md">
                                <Pin className="w-3 h-3 mr-1" />
                                고정
                            </span>
                        )}
                        {((post as unknown as { is_featured?: boolean }).is_featured === true) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-pink-500 text-white shadow-md">
                                <Star className="w-3 h-3 mr-1" />
                                추천
                            </span>
                        )}
                    </div>

                    <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-500">
                            {safeBoardType.replace('board_prefix_', '')}
                        </span>
                    </div>
                </div>
            )}

            {/* 제목 및 카테고리 */}
            <div className="mb-6">
                {post.category && (
                    <div className="mb-3">
                        <span
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold"
                            style={{
                                backgroundColor: `${getCategoryColor(post.category.color ?? '')}20`,
                                color: getCategoryColor(post.category.color ?? '')
                            }}
                        >
                            {post.category.name}
                        </span>
                    </div>
                )}

                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 leading-tight">
                            {post.title}
                        </h1>
                        {post.subtitle && (
                            <p className="text-lg text-slate-600 leading-relaxed">
                                {post.subtitle}
                            </p>
                        )}
                    </div>

                    {/* 액션 메뉴 */}
                    {canEdit && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10">
                                    {onEdit && (
                                        <button
                                            onClick={() => {
                                                onEdit();
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors duration-200"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            수정
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => {
                                                onDelete();
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            삭제
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 작성자 정보 */}
            {post.author && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        {post.author.profile_image ? (
                            <Image
                                src={post.author.profile_image ?? ''}
                                alt={post.author.nickname ?? ''}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            <span className="text-white text-lg font-bold">
                                {(post.author.nickname?.charAt(0).toUpperCase()) ?? ''}
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-900">
                                {post.author.nickname ?? ''}
                            </span>
                            <span className="text-xs text-slate-500 truncate">{post.author.name ?? ''}</span>
                            {(((post.author as unknown as { role?: string } | undefined)?.role ?? '') === 'admin') && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                    관리자
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">
                            {formatDate(post.created_at)}
                        </p>
                    </div>
                </div>
            )}

            {/* 태그 */}
            {(((post as unknown as { tags?: string[] }).tags ?? []).length > 0) && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {(((post as unknown as { tags?: string[] }).tags ?? [])).map((tag: string, index: number) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors duration-200"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 통계 및 액션 버튼 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-200">
                {/* 통계 */}
                <div className="flex items-center gap-6 text-slate-600">
                    <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium">{post.views} 조회</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        <span className="font-medium">{post.likes_count} 좋아요</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{post.comments_count} 댓글</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5" />
                        <span className="font-medium">{post.bookmarks_count} 북마크</span>
                    </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors duration-200"
                    >
                        <Share2 className="w-4 h-4" />
                        공유
                    </button>
                </div>
            </div>
        </div>
    );
}
