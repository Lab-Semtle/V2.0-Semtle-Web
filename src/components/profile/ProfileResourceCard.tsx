'use client';

import Link from 'next/link';
import { Eye, Heart, MessageCircle, Calendar } from 'lucide-react';
import { ResourcePost } from '@/types/resource';

interface ProfileResourceCardProps {
    resource: ResourcePost;
    className?: string;
}

export default function ProfileResourceCard({ resource, className = '' }: ProfileResourceCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // 자료 카테고리별 색상 가져오기
    const getResourceCategoryColor = () => {
        if (resource.category?.color) {
            return resource.category.color;
        }
        return '#3B82F6';
    };

    // 카테고리별 배경색
    const getCategoryBackgroundColor = () => {
        if (resource.category?.color) {
            return `${resource.category.color}08`;
        }
        return '#E5E7EB08';
    };

    return (
        <Link href={`/resources/${resource.id}`}>
            <article
                className={`group h-[320px] flex flex-col transition-all duration-300 cursor-pointer overflow-hidden relative ${className}`}
                style={{
                    backgroundColor: getCategoryBackgroundColor(),
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    if (resource.category?.color) {
                        e.currentTarget.style.backgroundColor = `${resource.category.color}15`;
                        e.currentTarget.style.borderTop = `4px solid ${resource.category.color}`;
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = getCategoryBackgroundColor();
                    e.currentTarget.style.borderTop = '2px solid transparent';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <div className="flex flex-col">
                    {/* 상단 색상띠 */}
                    <div
                        className="h-2 w-full"
                        style={{
                            background: `linear-gradient(90deg, ${getResourceCategoryColor()} 0%, ${getResourceCategoryColor()}D0 100%)`
                        }}
                    />

                    {/* 카드 내용 */}
                    <div className="py-4 px-5 flex flex-col relative">
                        {/* 우측 상단 배지 그룹 */}
                        <div className="absolute top-6 right-5 flex items-center gap-2">
                            {/* 카테고리 */}
                            {resource.category && (
                                <span
                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm"
                                    style={{
                                        backgroundColor: `${resource.category.color}`,
                                        color: 'white'
                                    }}
                                >
                                    {resource.category.name}
                                </span>
                            )}
                        </div>

                        {/* 제목 */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 pr-24 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
                            {resource.title}
                        </h3>

                        {/* 부제목 */}
                        {resource.subtitle && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {resource.subtitle}
                            </p>
                        )}

                        {/* 메타 정보 */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{resource.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5" />
                                <span>{resource.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{resource.comments_count}</span>
                            </div>
                        </div>

                        {/* 작성일 */}
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(resource.created_at)}</span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

