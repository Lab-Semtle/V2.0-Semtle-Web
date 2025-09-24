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

    const getBoardTypeLabel = (boardType: string) => {
        switch (boardType) {
            case 'activities':
                return '학회 활동';
            case 'projects':
                return '프로젝트';
            case 'resources':
                return '자료실';
            default:
                return '게시판';
        }
    };

    const getBoardTypeColor = (boardType: string) => {
        switch (boardType) {
            case 'activities':
                return 'bg-blue-100 text-blue-800';
            case 'projects':
                return 'bg-green-100 text-green-800';
            case 'resources':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Link href={`/${post.board_type}/${post.id}`}>
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

                    {/* 고정/추천 배지 */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {post.is_pinned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-md">
                                <Pin className="w-3 h-3 mr-1" />
                                고정
                            </span>
                        )}
                        {post.is_featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white shadow-md">
                                <Star className="w-3 h-3 mr-1" />
                                추천
                            </span>
                        )}
                    </div>

                    {/* 게시판 타입 배지 */}
                    <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getBoardTypeColor(post.board_type)}`}>
                            {getBoardTypeLabel(post.board_type)}
                        </span>
                    </div>
                </div>

                {/* 내용 */}
                <div className="p-6">
                    {/* 카테고리 */}
                    {showCategory && post.category && (
                        <div className="mb-3">
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: `${getCategoryColor(post.category.color)}20`,
                                    color: getCategoryColor(post.category.color)
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

                    {/* 태그 */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {post.tags.length > 3 && (
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                    +{post.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* 작성자 정보 */}
                    {showAuthor && post.author && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                {post.author.profile_image ? (
                                    <Image
                                        src={post.author.profile_image}
                                        alt={post.author.nickname}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-bold">
                                        {post.author.nickname.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{post.author.nickname}</p>
                                <p className="text-xs text-slate-500">{post.author.name}</p>
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
