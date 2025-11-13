'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/post';
import { Calendar, Eye, Heart, MessageCircle, Bookmark, Pin, Star } from 'lucide-react';

interface PostCardProps {
    post: Post;
    showAuthor?: boolean;
    showCategory?: boolean;
    className?: string;
}

export default function PostCard({
    post,
    showAuthor = true,
    showCategory = true,
    className = ''
}: PostCardProps) {
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryColor = (color: string) => {
        return color || '#3B82F6';
    };

    return (
        <Link href={`/${(post as unknown as { board_type?: string }).board_type ?? 'unknown'}/${post.id}`}>
            <article className={`group bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
                {/* 썸네일 */}
                <div className="relative aspect-video w-full overflow-hidden">
                    {post.thumbnail && !imageError ? (
                        <Image
                            src={post.thumbnail}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <span className="text-slate-400 text-4xl font-bold">
                                {post.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    {/* 대표/고정 뱃지 */}
                    <div className="absolute top-3 left-3 flex gap-2">
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

                    {/* 게시판명(썸네일 오른쪽 상단) */}
                    <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-500">
                            {((post as unknown as { board_type?: string }).board_type ?? '게시판')}
                        </span>
                    </div>

                    {/* 태그 - 하단 */}
                    {(((post as unknown as { tags?: string[] }).tags ?? []).length > 0) && (
                        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
                            {(((post as unknown as { tags?: string[] }).tags ?? []).slice(0, 3)).map((tag: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-black/70 text-white rounded-lg text-xs font-medium shadow-sm">
                                    {tag}
                                </span>
                            ))}
                            {(((post as unknown as { tags?: string[] }).tags ?? []).length > 3) && (
                                <span className="px-2 py-1 bg-black/70 text-white rounded-lg text-xs font-medium shadow-sm">
                                    +{(((post as unknown as { tags?: string[] }).tags ?? []).length - 3)}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* 내용 */}
                <div className="p-6">
                    {/* 카테고리 */}
                    {showCategory && post.category && (
                        <div className="mb-3">
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: `${getCategoryColor(post.category.color ?? '')}20`,
                                    color: getCategoryColor(post.category.color ?? '')
                                }}
                            >
                                {post.category.name}
                            </span>
                        </div>
                    )}

                    {/* 제목 */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {post.title}
                    </h3>

                    {/* 부제목 */}
                    {post.subtitle && (
                        <p className="text-slate-600 mb-4 line-clamp-2">
                            {post.subtitle}
                        </p>
                    )}

                    {/* 작성자 정보 */}
                    {showAuthor && post.author && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                {post.author.profile_image ? (
                                    <Image
                                        src={post.author.profile_image ?? ''}
                                        alt={post.author.nickname ?? ''}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-bold">
                                        {(post.author.nickname?.charAt(0).toUpperCase()) ?? ''}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {post.author.nickname ?? ''}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {post.author.name ?? ''}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(post.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.views}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span>{post.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.comments_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Bookmark className="w-4 h-4" />
                                <span>{post.bookmarks_count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

