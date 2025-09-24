'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProjectPost } from '@/types/project';
import { Calendar, Users, Clock, MapPin, Code, Star, Pin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ProjectCardProps {
    project: ProjectPost;
    className?: string;
}

export default function ProjectCard({ project, className = '' }: ProjectCardProps) {
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getProjectTypeLabel = (type: string) => {
        switch (type) {
            case 'development':
                return '개발';
            case 'competition':
                return '공모전';
            case 'hackathon':
                return '해커톤';
            case 'research':
                return '연구';
            case 'side_project':
                return '사이드프로젝트';
            default:
                return '프로젝트';
        }
    };

    const getProjectTypeColor = (type: string) => {
        switch (type) {
            case 'development':
                return 'bg-blue-100 text-blue-800';
            case 'competition':
                return 'bg-purple-100 text-purple-800';
            case 'hackathon':
                return 'bg-orange-100 text-orange-800';
            case 'research':
                return 'bg-green-100 text-green-800';
            case 'side_project':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return '초급';
            case 'intermediate':
                return '중급';
            case 'advanced':
                return '고급';
            default:
                return '알 수 없음';
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-100 text-green-800';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800';
            case 'advanced':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getLocationLabel = (location: string) => {
        switch (location) {
            case 'online':
                return '온라인';
            case 'offline':
                return '오프라인';
            case 'hybrid':
                return '하이브리드';
            default:
                return '알 수 없음';
        }
    };

    const getStatusInfo = (project: ProjectPost) => {
        if (!project.project_data) {
            return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        }

        const { project_status, deadline } = project.project_data;
        const now = new Date();
        const deadlineDate = new Date(deadline);

        switch (project_status) {
            case 'recruiting':
                if (now > deadlineDate) {
                    return { label: '모집 마감', color: 'bg-gray-100 text-gray-800', icon: XCircle };
                }
                return { label: '모집중', color: 'bg-blue-100 text-blue-800', icon: Users };
            case 'in_progress':
                return { label: '진행중', color: 'bg-green-100 text-green-800', icon: CheckCircle };
            case 'completed':
                return { label: '완료', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
            case 'cancelled':
                return { label: '취소됨', color: 'bg-red-100 text-red-800', icon: XCircle };
            default:
                return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        }
    };

    const StatusInfo = getStatusInfo(project);
    const StatusIcon = StatusInfo.icon;

    const isRecruiting = project.project_data?.project_status === 'recruiting' &&
        new Date(project.project_data.deadline) > new Date();

    return (
        <Link href={`/projects/${project.id}`}>
            <article className={`group bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
                {/* 썸네일 */}
                <div className="relative aspect-video w-full overflow-hidden">
                    {project.thumbnail && !imageError ? (
                        <Image
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                            <span className="text-green-400 text-4xl font-bold">
                                {getProjectTypeLabel(project.project_data?.project_type || 'project').charAt(0)}
                            </span>
                        </div>
                    )}

                    {/* 배지들 */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {project.is_pinned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-md">
                                <Pin className="w-3 h-3 mr-1" />
                                고정
                            </span>
                        )}
                        {project.is_featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white shadow-md">
                                <Star className="w-3 h-3 mr-1" />
                                추천
                            </span>
                        )}
                    </div>

                    {/* 프로젝트 타입 및 상태 */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getProjectTypeColor(project.project_data?.project_type || 'project')}`}>
                            {getProjectTypeLabel(project.project_data?.project_type || 'project')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${StatusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {StatusInfo.label}
                        </span>
                    </div>
                </div>

                {/* 내용 */}
                <div className="p-6">
                    {/* 카테고리 */}
                    {project.category && (
                        <div className="mb-3">
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: `${project.category.color}20`,
                                    color: project.category.color
                                }}
                            >
                                {project.category.name}
                            </span>
                        </div>
                    )}

                    {/* 제목 */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-200">
                        {project.title}
                    </h3>

                    {/* 부제목 */}
                    {project.subtitle && (
                        <p className="text-slate-600 mb-4 line-clamp-2">
                            {project.subtitle}
                        </p>
                    )}

                    {/* 프로젝트 정보 */}
                    {project.project_data && (
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Users className="w-4 h-4" />
                                <span>
                                    {project.project_data.current_members} / {project.project_data.team_size}명
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(project.project_data.difficulty)}`}>
                                    {getDifficultyLabel(project.project_data.difficulty)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" />
                                <span>마감: {formatDate(project.project_data.deadline)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4" />
                                <span>{getLocationLabel(project.project_data.location)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="w-4 h-4" />
                                <span>{project.project_data.duration}</span>
                            </div>

                            {project.project_data.tech_stack && project.project_data.tech_stack.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Code className="w-4 h-4" />
                                    <span>{project.project_data.tech_stack.slice(0, 3).join(', ')}</span>
                                    {project.project_data.tech_stack.length > 3 && (
                                        <span className="text-slate-400">+{project.project_data.tech_stack.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 태그 */}
                    {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {project.tags.length > 3 && (
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                    +{project.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* 작성자 정보 */}
                    {project.author && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                {project.author.profile_image ? (
                                    <Image
                                        src={project.author.profile_image}
                                        alt={project.author.nickname}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-bold">
                                        {project.author.nickname.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{project.author.nickname}</p>
                                <p className="text-xs text-slate-500">{project.author.name}</p>
                            </div>
                        </div>
                    )}

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(project.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{project.views} 조회</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                <span>{project.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{project.comments_count}</span>
                            </div>
                        </div>
                    </div>

                    {/* 모집 상태 표시 */}
                    {isRecruiting && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">팀원 모집 중</span>
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </Link>
    );
}
