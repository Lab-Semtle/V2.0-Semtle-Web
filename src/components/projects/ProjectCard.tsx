'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProjectPost } from '@/types/project';
import { Users, Pin, CheckCircle, XCircle, AlertCircle, Heart, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCardProps {
    project: ProjectPost;
    className?: string;
    isSelectable?: boolean;
    isSelected?: boolean;
    onSelect?: (projectId: number) => void;
}

export default function ProjectCard({
    project,
    className = '',
    isSelectable = false,
    isSelected = false,
    onSelect
}: ProjectCardProps) {
    const { user } = useAuth();
    const [imageError, setImageError] = useState(false);

    // 소유자 여부 확인
    const isOwner = user?.id === project.author_id;
    const showCheckbox = isOwner && isSelectable && onSelect;

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSelect) {
            onSelect(project.id);
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    const getCustomStatusColor = (status: string) => {
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

    const getStatusInfo = (project: ProjectPost) => {
        if (!project.project_data) {
            return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        }

        // 데이터베이스에서 가져온 project_status_info 사용
        if ((project as unknown as Record<string, unknown>).project_status_info) {
            const dbStatus = (project as unknown as Record<string, unknown>).project_status_info as { name: string; display_name: string; icon: string };

            // 모집중인데 마감일이 지난 경우 모집 마감으로 처리
            if (dbStatus.name === 'recruiting' && project.project_data?.deadline) {
                const now = new Date();
                const deadlineDate = new Date(project.project_data.deadline);
                if (now > deadlineDate) {
                    return {
                        label: '모집 마감',
                        color: 'bg-orange-100 text-orange-800',
                        icon: XCircle
                    };
                }
            }

            // 데이터베이스 색상 대신 우리가 정의한 색상 사용
            const customColor = getCustomStatusColor(dbStatus.name);
            return {
                label: dbStatus.display_name,
                color: customColor,
                icon: getIconByName(dbStatus.icon)
            };
        }

        // fallback: 기존 로직 (마감일 체크 포함)
        const { project_status, deadline } = project.project_data;
        const now = new Date();
        const deadlineDate = new Date(deadline);

        switch (project_status) {
            case 'recruiting':
                if (now > deadlineDate) {
                    return { label: '모집 마감', color: 'bg-orange-100 text-orange-800', icon: XCircle };
                }
                return { label: '모집중', color: 'bg-red-100 text-red-800', icon: Users };
            case 'active':
                return { label: '진행중', color: 'bg-green-100 text-green-800', icon: CheckCircle };
            case 'completed':
                return { label: '완료', color: 'bg-purple-100 text-purple-800', icon: CheckCircle };
            case 'cancelled':
                return { label: '취소됨', color: 'bg-gray-100 text-gray-800', icon: XCircle };
            default:
                return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        }
    };

    const getIconByName = (iconName: string) => {
        const iconMap: { [key: string]: React.ComponentType } = {
            'Users': Users,
            'CheckCircle': CheckCircle,
            'XCircle': XCircle,
            'AlertCircle': AlertCircle
        };
        return iconMap[iconName] || AlertCircle;
    };

    const StatusInfo = getStatusInfo(project);

    const CardContent = (
        <article className={`group w-full max-w-full flex flex-col md:flex-row rounded-xl md:rounded-2xl transition-all duration-300 overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''} ${(((project as unknown as { is_pinned?: boolean }).is_pinned === true)
            ? 'bg-gradient-to-br from-amber-50/50 to-orange-50/50'
            : 'bg-transparent hover:bg-white/40')}
                } ${className}`}>
            {/* 메인 콘텐츠 영역 - 썸네일과 내용 */}
            <div className="flex flex-col md:flex-row min-w-0 w-full">
                {/* 썸네일 - 좌측 */}
                <div className="relative w-full md:w-56 lg:w-72 xl:w-80 h-48 sm:h-52 md:h-56 lg:h-60 bg-gray-50/50 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0">
                    {project.thumbnail && !imageError ? (
                        <Image
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out rounded-xl md:rounded-2xl"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl">
                        </div>
                    )}

                    {/* 이미지 위 최소 정보: 상태 배지 + 마감일자 배지 */}
                    {/* 상단 좌측: 상태 배지 + 마감일자 배지 */}
                    <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 flex items-center md:flex-col md:items-start gap-1.5 sm:gap-2.5 md:gap-1.5 flex-nowrap max-w-[calc(100%-4rem)] sm:max-w-none">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-md backdrop-blur-md whitespace-nowrap flex-shrink-0 ${StatusInfo.color}`}>
                            {StatusInfo.label}
                        </span>
                        {/* 마감일자 배지 - 모집중이고 마감일이 지나지 않았을 때만 표시 */}
                        {(() => {
                            if (!project.project_data || !project.project_data.deadline) return null;

                            // project_status_info가 있으면 그것을 사용, 없으면 project_status 사용
                            const statusName = (project as unknown as Record<string, unknown>).project_status_info
                                ? ((project as unknown as Record<string, unknown>).project_status_info as { name: string }).name
                                : (project.project_data as { project_status?: string }).project_status;

                            if (statusName === 'recruiting') {
                                const now = new Date();
                                const deadlineDate = new Date(project.project_data.deadline);
                                if (now < deadlineDate) {
                                    return (
                                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md backdrop-blur-md whitespace-nowrap flex-shrink-0">
                                            <span className="whitespace-nowrap">마감: {formatDate(project.project_data.deadline)}</span>
                                        </span>
                                    );
                                }
                            }
                            return null;
                        })()}
                    </div>

                    {/* 체크박스 (소유자일 때만 표시) */}
                    {showCheckbox && (
                        <div
                            className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-20 cursor-pointer"
                            onClick={handleCheckboxClick}
                        >
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-md ${isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white/95 border-slate-300'
                                }`}>
                                {isSelected && (
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* 하단: 모집 현황 오버레이 */}
                    {project.project_data && (
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5 sm:p-3 bg-gradient-to-t from-black/70 via-black/50 to-transparent backdrop-blur-sm rounded-b-xl md:rounded-b-2xl">
                            <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                                <span className="text-xs sm:text-sm font-semibold text-white">모집 현황</span>
                                <span className="text-xs sm:text-sm font-bold text-white">
                                    {project.project_data.current_members}/{project.project_data.team_size}명
                                </span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2 sm:h-2.5 overflow-hidden shadow-inner">
                                <div
                                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full transition-all duration-500 shadow-sm"
                                    style={{
                                        width: `${Math.min((project.project_data.current_members / project.project_data.team_size) * 100, 100)}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 내용 - 우측 */}
                <div className="flex-1 px-4 sm:px-5 md:px-6 pt-1 sm:pt-1.5 pb-1 sm:pb-1.5 flex flex-col min-w-0 md:h-56 lg:h-60">
                    {/* 중간 콘텐츠 영역 - flex-1로 남은 공간 차지 */}
                    <div className="flex-1 flex flex-col">
                        {/* 제목 */}
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-900 mb-2 sm:mb-2.5 line-clamp-2 break-words font-bold leading-tight">
                            {project.title}
                        </h3>

                        {/* 요약문(소제목) */}
                        {project.subtitle && (
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 mb-3.5 sm:mb-4 line-clamp-2 break-words leading-relaxed">
                                {project.subtitle}
                            </p>
                        )}
                    </div>

                    {/* 속성 영역: 고정 배지, 난이도, 연관분야, 필요기술 - 구분선 바로 위에 고정 */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5">
                        {/* 고정 배지 */}
                        {((project as unknown as { is_pinned?: boolean }).is_pinned === true) && (
                            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                                <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="whitespace-nowrap">고정</span>
                            </span>
                        )}
                        {/* 난이도 태그 */}
                        {project.project_data && project.project_data.difficulty && (
                            <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold ${project.project_data.difficulty === 'beginner'
                                ? 'bg-green-100 text-green-800'
                                : project.project_data.difficulty === 'intermediate'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : project.project_data.difficulty === 'advanced'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                {project.project_data.difficulty === 'beginner'
                                    ? '초급'
                                    : project.project_data.difficulty === 'intermediate'
                                        ? '중급'
                                        : project.project_data.difficulty === 'advanced'
                                            ? '고급'
                                            : project.project_data.difficulty}
                            </span>
                        )}
                        {/* 프로젝트 타입 (연관분야) */}
                        <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-700">
                            {((project as unknown as Record<string, unknown>).project_type as { name: string } || { name: '프로젝트' }).name}
                        </span>
                        {/* 필요기술 태그들 */}
                        {project.project_data && project.project_data.needed_skills && project.project_data.needed_skills.length > 0 && (
                            <>
                                {project.project_data.needed_skills.slice(0, 4).map((skill, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md text-[10px] sm:text-xs font-bold shadow-sm">
                                        {skill}
                                    </span>
                                ))}
                                {project.project_data.needed_skills.length > 4 && (
                                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-md text-[10px] sm:text-xs font-bold shadow-sm">
                                        +{project.project_data.needed_skills.length - 4}
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* 작성자 정보와 하단 메타 정보 - 고정된 하단 위치 */}
                    <div className="pt-1.5 sm:pt-2 border-t border-slate-200/60">
                        {/* 하단 메타 정보 - 전체 너비 활용 */}
                        <div className="flex flex-row items-center justify-between gap-2.5 sm:gap-4">
                            {/* 메타 통계 - 왼쪽 */}
                            <div className="flex items-center gap-2.5 text-[10px] sm:text-xs text-slate-500">
                                {/* 작성일자 */}
                                <div>
                                    <span className="whitespace-nowrap">{formatDate(project.created_at)}</span>
                                </div>

                                {/* 좋아요 */}
                                <div className="flex items-center gap-1">
                                    <Heart className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                    <span className="font-medium">{project.likes_count || 0}</span>
                                </div>

                                {/* 댓글 */}
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                    <span className="font-medium">{project.comments_count || 0}</span>
                                </div>
                            </div>

                            {/* 작성자 정보 - 우측 */}
                            {project.author && (
                                <div className="flex items-center gap-2 sm:gap-2.5">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {project.author.profile_image ? (
                                            <Image
                                                src={project.author.profile_image ?? ''}
                                                alt={project.author.nickname ?? ''}
                                                width={24}
                                                height={24}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <span className="text-slate-600 text-xs sm:text-sm font-bold">
                                                {(project.author.nickname?.charAt(0).toUpperCase()) ?? ''}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                                        {project.author.nickname ?? ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );

    // 선택 모드일 때도 카드 클릭은 상세 페이지로 이동
    if (isSelectable) {
        return (
            <Link href={`/projects/${project.id}`} className="block">
                {CardContent}
            </Link>
        );
    }

    return (
        <Link href={`/projects/${project.id}`} className="block">
            {CardContent}
        </Link>
    );
}