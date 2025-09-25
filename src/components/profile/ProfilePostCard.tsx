'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Eye,
    Heart,
    MessageCircle,
    Bookmark,
    FileText,
    Calendar,
    ExternalLink,
    Edit,
    Trash2,
    Globe,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProfilePostCardProps {
    post: {
        id: number;
        title: string;
        subtitle?: string;
        thumbnail?: string;
        post_type: 'project' | 'resource' | 'activity';
        status?: 'published' | 'draft';
        views: number;
        likes_count: number;
        comments_count: number;
        bookmarks_count: number;
        created_at: string;
        published_at?: string;
        category?: {
            name: string;
            color?: string;
        };
        project_type?: { name: string };
        resource_type?: { name: string };
        activity_type?: { name: string };
    };
    isOwnPost?: boolean;
    onEdit?: (postId: number, postType: string) => void;
    onDelete?: (postId: number, postType: string) => void;
    onPublish?: (postId: number, postType: string) => void;
}

export default function ProfilePostCard({ post, isOwnPost = false, onEdit, onDelete, onPublish }: ProfilePostCardProps) {
    const getPostTypeInfo = () => {
        switch (post.post_type) {
            case 'project':
                return {
                    icon: <FileText className="w-4 h-4" />,
                    typeName: '프로젝트',
                    typeColor: 'bg-blue-100 text-blue-800',
                    boardPath: '/projects'
                };
            case 'resource':
                return {
                    icon: <Bookmark className="w-4 h-4" />,
                    typeName: '자료실',
                    typeColor: 'bg-green-100 text-green-800',
                    boardPath: '/resources'
                };
            case 'activity':
                return {
                    icon: <Calendar className="w-4 h-4" />,
                    typeName: '활동',
                    typeColor: 'bg-purple-100 text-purple-800',
                    boardPath: '/activities'
                };
            default:
                return {
                    icon: <FileText className="w-4 h-4" />,
                    typeName: '게시물',
                    typeColor: 'bg-gray-100 text-gray-800',
                    boardPath: '/'
                };
        }
    };

    const postTypeInfo = getPostTypeInfo();
    const typeName = post.project_type?.name || post.resource_type?.name || post.activity_type?.name || '';

    return (
        <Link href={`${postTypeInfo.boardPath}/${post.id}`}>
            <Card className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${post.status === 'draft' ? 'border-orange-200 bg-orange-50/30' : ''
                }`}>
                <CardContent className="p-0">
                    {/* 썸네일 */}
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        {post.thumbnail ? (
                            <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <div className="text-gray-400">
                                    {postTypeInfo.icon}
                                </div>
                            </div>
                        )}

                        {/* 오버레이 */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                            <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>

                        {/* 임시저장 오버레이 */}
                        {post.status === 'draft' && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                임시저장
                            </div>
                        )}
                    </div>

                    {/* 콘텐츠 */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${postTypeInfo.typeColor} text-xs`}>
                                {postTypeInfo.icon}
                                <span className="ml-1">{postTypeInfo.typeName}</span>
                            </Badge>
                            {post.category && (
                                <Badge variant="outline" className="text-xs">
                                    {post.category.name}
                                </Badge>
                            )}
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {post.title}
                        </h3>

                        {post.subtitle && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {post.subtitle}
                            </p>
                        )}

                        {typeName && (
                            <p className="text-xs text-gray-500 mb-3">
                                {typeName}
                            </p>
                        )}

                        {/* 상태 표시 */}
                        {post.status === 'draft' && (
                            <div className="flex items-center gap-1 mb-3">
                                <Clock className="w-3 h-3 text-orange-500" />
                                <span className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full">임시저장</span>
                            </div>
                        )}

                        {/* 액션 버튼들 (내 게시물인 경우) */}
                        {isOwnPost && (
                            <div className="flex gap-2 mb-3">
                                {onEdit && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onEdit(post.id, post.post_type);
                                        }}
                                        className="flex-1"
                                    >
                                        <Edit className="w-3 h-3 mr-1" />
                                        수정
                                    </Button>
                                )}
                                {post.status === 'draft' && onPublish && (
                                    <Button
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onPublish(post.id, post.post_type);
                                        }}
                                        className="flex-1"
                                    >
                                        <Globe className="w-3 h-3 mr-1" />
                                        공개
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onDelete(post.id, post.post_type);
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* 통계 */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{post.views}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" />
                                    <span>{post.likes_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    <span>{post.comments_count}</span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">
                                {new Date(post.published_at || post.created_at).toLocaleDateString('ko-KR')}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
