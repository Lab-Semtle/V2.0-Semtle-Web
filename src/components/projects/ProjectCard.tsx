'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProjectPost } from '@/types/project';
import { useViewCount } from '@/hooks/useViewCount';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Calendar, Users, MapPin, Code, Star, Pin, CheckCircle, XCircle, AlertCircle, Bookmark, Zap } from 'lucide-react';

interface ProjectCardProps {
    project: ProjectPost;
    className?: string;
}

export default function ProjectCard({ project, className = '' }: ProjectCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const { user } = useAuth();
    const { views, incrementView } = useViewCount({
        postType: 'project',
        postId: project.id,
        initialViews: project.views || 0
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    // 북마크 상태 확인
    useEffect(() => {
        const checkBookmarkStatus = async () => {
            if (!user) return;

            try {
                const response = await fetch(`/api/posts/${project.id}/bookmark`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsBookmarked(data.isBookmarked);
                }
            } catch (error) {
                // 에러 무시
            }
        };

        checkBookmarkStatus();
    }, [user, project.id]);

    // 좋아요 상태 확인
    useEffect(() => {
        const checkLikeStatus = async () => {
            if (!user) return;

            try {
                const response = await fetch(`/api/projects/${project.id}/like`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsLiked(data.liked);
                }
            } catch (error) {
                // 에러 무시
            }
        };

        checkLikeStatus();
    }, [user, project.id]);

    // 북마크 토글
    const handleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('북마크 클릭 - 사용자:', user?.id, '프로젝트:', project.id);

        // Supabase 세션 직접 확인
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('직접 세션 확인:', { session: !!session, error, user: session?.user?.id });

        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (isBookmarking) return;

        setIsBookmarking(true);
        try {
            console.log('북마크 요청 전송 중...');
            console.log('현재 사용자:', user?.id);
            console.log('쿠키 확인:', document.cookie);

            // Supabase 쿠키 확인
            const supabaseCookies = document.cookie.split(';').filter(cookie =>
                cookie.includes('sb-') || cookie.includes('supabase')
            );
            console.log('Supabase 쿠키들:', supabaseCookies);

            const response = await fetch(`/api/posts/${project.id}/bookmark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            console.log('북마크 응답:', response.status, response.statusText);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '북마크 처리에 실패했습니다.');
            }

            setIsBookmarked(data.isBookmarked);
        } catch (error) {
            alert('북마크 처리 중 오류가 발생했습니다.');
        } finally {
            setIsBookmarking(false);
        }
    };

    // 좋아요 토글
    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (isLiking) return;

        setIsLiking(true);

        try {
            const response = await fetch(`/api/projects/${project.id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.liked);
            } else {
                console.error('좋아요 응답:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('좋아요 오류:', error);
        } finally {
            setIsLiking(false);
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

        // 데이터베이스에서 가져온 project_status_info 사용 (타입 안전성을 위해 any로 처리)
        if ((project as any).project_status_info) {
            const dbStatus = (project as any).project_status_info.name;

            // 모집중인데 마감일이 지난 경우 모집 마감으로 처리
            if (dbStatus === 'recruiting' && project.project_data?.deadline) {
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
            const customColor = getCustomStatusColor(dbStatus);
            return {
                label: (project as any).project_status_info.display_name,
                color: customColor,
                icon: getIconByName((project as any).project_status_info.icon)
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
        const iconMap: { [key: string]: any } = {
            'Users': Users,
            'CheckCircle': CheckCircle,
            'XCircle': XCircle,
            'AlertCircle': AlertCircle
        };
        return iconMap[iconName] || AlertCircle;
    };

    const StatusInfo = getStatusInfo(project);
    const StatusIcon = StatusInfo.icon;

    const isRecruiting = project.project_data?.project_status === 'recruiting' &&
        new Date(project.project_data.deadline) > new Date();

    return (
        <Link href={`/projects/${project.id}`} onClick={incrementView}>
            <article className={`group h-full flex flex-col rounded-xl transition-all duration-300 ${
                project.is_pinned 
                    ? 'bg-gradient-to-br from-amber-50/50 to-orange-50/50' 
                    : 'bg-white hover:bg-gray-50/50'
            }`}>
                {/* 메인 콘텐츠 영역 - 썸네일과 내용 */}
                <div className="flex flex-col md:flex-row-reverse flex-1">
                    {/* 썸네일 - 우측 */}
                    <div className="relative w-full md:w-80 h-44 md:h-auto bg-gray-50/50 rounded-xl overflow-hidden flex-shrink-0">
                        {project.thumbnail && !imageError ? (
                            <Image
                                src={project.thumbnail}
                                alt={project.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out rounded-xl"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                            </div>
                        )}

                        {/* 상단 배지들 */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <div className="flex flex-row gap-2">
                                {/* 난이도 태그 */}
                                {project.project_data && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${project.project_data.difficulty === 'beginner'
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
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-900">
                                    {(project as any).project_type?.name || '프로젝트'}
                                </span>
                            </div>

                            {/* 마감기간 배지 */}
                            {project.project_data && project.project_data.deadline && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-xs font-bold shadow-lg">
                                    <span>모집마감: {formatDate(project.project_data.deadline)}</span>
                                </div>
                            )}
                        </div>


                        {/* 상단 액션 버튼들 */}
                        <div className="absolute top-3 right-3 flex gap-2">
                            {/* 북마크 버튼 */}
                            <button
                                onClick={handleBookmark}
                                disabled={isBookmarking || !user}
                                className={`p-2 rounded-full shadow-sm transition-all duration-200 backdrop-blur-sm ${!user
                                    ? 'bg-white/80 text-gray-400 cursor-not-allowed'
                                    : isBookmarked
                                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-yellow-500'
                                    }`}
                            >
                                {isBookmarking ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                ) : (
                                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                )}
                            </button>
                        </div>

                        {/* 하단 배지들 - 필요기술만 */}
                        {project.project_data && project.project_data.needed_skills && project.project_data.needed_skills.length > 0 && (
                            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                                {/* 필요기술 */}
                                {project.project_data.needed_skills.slice(0, 3).map((skill, index) => (
                                    <span key={index} className="px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md text-xs font-bold">
                                        {skill}
                                    </span>
                                ))}
                                {project.project_data.needed_skills.length > 3 && (
                                    <span className="px-2 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-md text-xs font-bold">
                                        +{project.project_data.needed_skills.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 내용 - 우측 */}
                    <div className="flex-1 px-4 pt-3 pb-6 flex flex-col">
                                {/* 프로젝트 상태 - 제목 위쪽 */}
                                        <div className="flex items-center gap-2 mb-2">
                                            {project.is_pinned && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                                                    <Pin className="w-3 h-3" />
                                                    고정된 프로젝트
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${StatusInfo.color}`}>
                                                {StatusInfo.label}
                                            </span>
                                        </div>

                        {/* 제목 */}
                        <h3 className="text-2xl text-slate-900 mb-2 line-clamp-2" style={{ fontWeight: 950 }}>
                            {project.title}
                        </h3>

                        {/* 요약문(소제목) */}
                        {project.subtitle && (
                            <p className="text-lg text-slate-600 mb-3 line-clamp-2">
                                {project.subtitle}
                            </p>
                        )}

                        {/* 핵심 정보 - 팀원 모집 현황만 */}
                        {project.project_data && (
                            <div className="space-y-3 mb-4">
                                {/* 모집 현황 */}
                                <div className="py-2 px-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-slate-700">모집 현황</span>
                                        <span className="text-sm font-bold text-blue-900">
                                            {project.project_data.current_members}/{project.project_data.team_size}명
                                        </span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min((project.project_data.current_members / project.project_data.team_size) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 작성자 정보와 하단 메타 정보 */}
                        <div className="mt-auto">
                            {/* 하단 메타 정보 - Medium 스타일 */}
                            <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
                                <div className="flex items-center gap-4">
                                    {/* 작성일자 */}
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span>{formatDate(project.created_at)}</span>
                                    </div>

                                    {/* 좋아요 */}
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                        </svg>
                                        <span>{project.likes_count}</span>
                                    </div>

                                    {/* 댓글 */}
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>{project.comments_count}</span>
                                    </div>

                                    {/* 조회수 */}
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>{views}</span>
                                    </div>
                                </div>

                                {/* 작성자 정보 */}
                                {project.author && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            {project.author.profile_image ? (
                                                <Image
                                                    src={project.author.profile_image}
                                                    alt={project.author.nickname}
                                                    width={20}
                                                    height={20}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <span className="text-white text-xs font-bold">
                                                    {project.author.nickname.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-slate-700">
                                            {project.author.nickname}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* 구분선 - 카드 전체 너비 */}
                <div className="border-t border-slate-100 mt-4"></div>
            </article>
        </Link>
    );
}