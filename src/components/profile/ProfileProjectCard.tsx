'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, Eye, Pin, Star } from 'lucide-react';
import { Post } from '@/types/post';

interface ProfileProjectCardProps {
    project: Post;
    className?: string;
}

export default function ProfileProjectCard({ project, className = '' }: ProfileProjectCardProps) {
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'recruiting':
                return 'bg-red-100 text-red-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'recruiting':
                return '모집중';
            case 'active':
                return '진행중';
            case 'completed':
                return '완료';
            case 'cancelled':
                return '취소됨';
            default:
                return '알 수 없음';
        }
    };

    return (
        <Link href={`/projects/${project.id}`}>
            <article className={`group h-[320px] flex flex-col bg-transparent rounded-2xl border-0 shadow-none overflow-hidden hover:-translate-y-1 transition-all duration-300 ${className}`}>
                {/* 썸네일 */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                    {project.thumbnail && !imageError ? (
                        <Image
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center rounded-2xl">
                            <span className="text-blue-400 text-4xl font-bold">
                                {project.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    {/* 배지들 */}
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                        {/* 난이도 태그 */}
                        {project.project_data && project.project_data.difficulty && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${project.project_data.difficulty === 'beginner'
                                ? 'bg-green-100 text-green-800'
                                : project.project_data.difficulty === 'intermediate'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {project.project_data.difficulty === 'beginner' ? '초급' :
                                    project.project_data.difficulty === 'intermediate' ? '중급' : '고급'}
                            </span>
                        )}

                        {/* 프로젝트 타입 */}
                        {project.project_type && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm bg-gray-100 text-gray-900">
                                {project.project_type.name}
                            </span>
                        )}

                        {((project as unknown as { is_pinned?: boolean }).is_pinned === true) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-md">
                                <Pin className="w-3 h-3 mr-1" />
                                고정
                            </span>
                        )}
                        {((project as unknown as { is_featured?: boolean }).is_featured === true) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white shadow-md">
                                <Star className="w-3 h-3 mr-1" />
                                추천
                            </span>
                        )}
                    </div>

                    {/* 프로젝트 상태 */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {(((project as unknown as { project_status?: string }).project_status) || project.project_data?.project_status) && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(((((project as unknown as { project_status?: string }).project_status) || project.project_data?.project_status) as string))}`}>
                                {getStatusLabel(((((project as unknown as { project_status?: string }).project_status) || project.project_data?.project_status) as string))}
                            </span>
                        )}
                    </div>
                </div>

                {/* 내용 */}
                <div className="p-4 bg-transparent">
                    {/* 작성일자 */}
                    <div className="text-xs text-slate-500 mb-3">
                        <span className="truncate">{formatDate(project.created_at)}</span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {project.title}
                    </h3>

                    {/* 부제목 */}
                    {project.subtitle && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {project.subtitle}
                        </p>
                    )}

                    {/* 태그들 */}
                    {project.project_data && project.project_data.needed_skills && project.project_data.needed_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {project.project_data.needed_skills.slice(0, 3).map((tag: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                            {project.project_data.needed_skills.length > 3 && (
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                    +{project.project_data.needed_skills.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* 구분선 */}
                    <div className="border-t border-slate-200 mb-3"></div>

                    {/* 메타 정보 - 우측 정렬 */}
                    <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 flex-shrink-0" />
                            <span>{project.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 flex-shrink-0" />
                            <span>{project.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{project.comments_count}</span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

