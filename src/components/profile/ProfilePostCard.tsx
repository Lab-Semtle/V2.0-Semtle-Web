'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useViewCount } from '@/hooks/useViewCount';
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
    Clock,
    Users,
    AlertCircle,
    CheckCircle,
    XCircle,
    Lock,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useEffect, useRef } from 'react';

interface ProfilePostCardProps {
    post: {
        id: number;
        title: string;
        subtitle?: string;
        thumbnail?: string;
        post_type: 'project' | 'resource' | 'activity';
        status?: 'published' | 'draft' | 'private';
        author_id: string;
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
        project_type?: { name: string; color?: string };
        resource_type?: { name: string; color?: string };
        activity_type?: { name: string; color?: string };
        // 자료실 관련 필드들
        file_url?: string;
        file_size?: number;
        downloads_count?: number;
        // 활동 관련 필드들
        start_date?: string;
        end_date?: string;
        location?: string;
        max_participants?: number;
        current_participants?: number;
        // 프로젝트 관련 필드들
        project_data?: {
            needed_skills?: string[];
            team_size?: number;
            current_members?: number;
            difficulty?: string;
            location?: string;
            deadline?: string;
            project_status?: string;
            progress_percentage?: number;
        };
        project_status_info?: {
            name: string;
            display_name: string;
            color: string;
            icon: string;
        };
        // 추가된 필드들
        approved_members?: number;
        applicant_count?: number;
    };
    isOwnPost?: boolean;
    onEdit?: (postId: number, postType: string) => void;
    onDelete?: (postId: number, postType: string) => void;
    onPublish?: (postId: number, postType: string) => void;
    onStatusChange?: (postId: number, postType: string, newStatus: string) => void;
}

export default function ProfilePostCard({ post, isOwnPost = false, onEdit, onDelete, onStatusChange }: ProfilePostCardProps) {
    const { user } = useAuth();
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(post.status || 'draft');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { views, incrementView } = useViewCount({
        postType: post.post_type as 'project' | 'activity' | 'resource',
        postId: post.id,
        initialViews: post.views || 0
    });

    // 외부 클릭으로 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };

        if (isStatusDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isStatusDropdownOpen]);

    const handleProjectStatusChange = async (newStatus: string) => {
        if (!user || post.post_type !== 'project') return;

        setIsChangingStatus(true);
        try {
            const response = await fetch(`/api/projects/${post.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_status: newStatus
                }),
            });

            if (response.ok) {
                // 부모 컴포넌트에 상태 변경 알림
                if (onStatusChange) {
                    onStatusChange(post.id, post.post_type, newStatus);
                }
                setIsStatusDropdownOpen(false);
            } else {
                const errorData = await response.json();
                alert(`프로젝트 상태 변경 실패: ${errorData.error}`);
            }
        } catch {
            alert('프로젝트 상태 변경 중 오류가 발생했습니다.');
        } finally {
            setIsChangingStatus(false);
        }
    };

    const handleStatusChange = async (postId: number, postType: string, newStatus: string) => {
        // 로컬 상태 즉시 업데이트
        setCurrentStatus(newStatus as 'published' | 'draft' | 'private');

        // 부모 컴포넌트에 상태 변경 알림
        if (onStatusChange) {
            onStatusChange(postId, postType, newStatus);
        }

        try {
            const response = await fetch(`/api/posts/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postType,
                    postId,
                    status: newStatus,
                    userId: user?.id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`상태 변경 실패: ${errorData.error}`);
                // 실패 시 로컬 상태 되돌리기
                setCurrentStatus(post.status || 'draft');
                if (onStatusChange) {
                    onStatusChange(postId, postType, post.status || 'draft');
                }
            }
        } catch {
            alert('상태 변경 중 오류가 발생했습니다.');
            // 실패 시 로컬 상태 되돌리기
            setCurrentStatus(post.status || 'draft');
            if (onStatusChange) {
                onStatusChange(postId, postType, post.status || 'draft');
            }
        }
    };
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

    // 게시판 카드와 동일한 헬퍼 함수들
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

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return '초급';
            case 'intermediate':
                return '중급';
            case 'advanced':
                return '고급';
            default:
                return difficulty;
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
                return location;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusInfo = (projectData: Record<string, unknown>, projectStatusInfo?: Record<string, unknown>) => {
        if (!projectData) {
            return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        }

        // 데이터베이스에서 가져온 project_status_info 사용
        if (projectStatusInfo) {
            return {
                label: projectStatusInfo.display_name,
                color: projectStatusInfo.color,
                icon: getIconByName(projectStatusInfo.icon as string)
            };
        }

        // fallback: 기존 로직 (마감일 체크 포함)
        const { project_status, deadline } = projectData;
        const now = new Date();
        const deadlineDate = new Date(deadline as string);

        switch (project_status) {
            case 'recruiting':
                if (now > deadlineDate) {
                    return { label: '모집 마감', color: 'bg-gray-100 text-gray-800', icon: XCircle };
                }
                return { label: '모집중', color: 'bg-blue-100 text-blue-800', icon: Users };
            case 'active':
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

    const getIconByName = (iconName: string) => {
        const iconMap: { [key: string]: React.ComponentType } = {
            'Users': Users,
            'CheckCircle': CheckCircle,
            'XCircle': XCircle,
            'AlertCircle': AlertCircle
        };
        return iconMap[iconName] || AlertCircle;
    };

    // 게시물 타입별 기본 색상 가져오기
    const getPostTypeColor = () => {
        // 프로젝트 타입 색상
        if (post.post_type === 'project' && post.project_type?.color) {
            return post.project_type.color;
        }

        // 자료실 타입 색상
        if (post.post_type === 'resource' && post.resource_type?.color) {
            return post.resource_type.color;
        }

        // 활동 타입 색상
        if (post.post_type === 'activity' && post.activity_type?.color) {
            return post.activity_type.color;
        }

        // 기본 색상 (fallback)
        return post.post_type === 'resource' ? '#10B981' :
            post.post_type === 'activity' ? '#8B5CF6' :
                '#3B82F6';
    };

    const postTypeInfo = getPostTypeInfo();
    const typeName = post.project_type?.name || post.resource_type?.name || post.activity_type?.name || '';

    return (
        <Link href={`${postTypeInfo.boardPath}/${post.id}`} onClick={incrementView}>
            <Card className={`group hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 shadow-none rounded-2xl overflow-hidden ${currentStatus === 'draft' ? 'bg-orange-50/30' : currentStatus === 'private' ? 'bg-red-50/50' : 'bg-transparent'
                }`}>
                <CardContent className="p-0">
                    {/* 썸네일 */}
                    <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                        {post.thumbnail ? (
                            <Image
                                src={post.thumbnail}
                                alt={post.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-200 rounded-t-2xl"
                            />
                        ) : (
                            <div
                                className="w-full h-full rounded-t-2xl relative overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${getPostTypeColor()}15 0%, ${getPostTypeColor()}25 50%, ${getPostTypeColor()}35 100%)`
                                }}
                            >
                                {/* 그라데이션 오버레이 효과 */}
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        background: `radial-gradient(circle at 30% 20%, ${getPostTypeColor()}40 0%, transparent 50%), 
                                                    radial-gradient(circle at 70% 80%, ${getPostTypeColor()}30 0%, transparent 50%)`
                                    }}
                                ></div>

                                {/* 미묘한 패턴 효과 */}
                                <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${getPostTypeColor()}20 10px, ${getPostTypeColor()}20 20px)`
                                    }}
                                ></div>

                                <div className="relative z-10 flex items-center justify-center h-full">
                                    <div className="text-slate-400 text-2xl">
                                        {postTypeInfo.icon}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 오버레이 */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                            <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>

                        {/* 상태 오버레이 */}
                        {currentStatus === 'draft' && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                임시저장
                            </div>
                        )}
                        {currentStatus === 'private' && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                비공개
                            </div>
                        )}

                        {/* 프로젝트 상태 (프로젝트 타입일 때만) */}
                        {post.post_type === 'project' && post.project_data && (
                            <div className="absolute top-2 left-2">
                                {(() => {
                                    const statusInfo = getStatusInfo(post.project_data, post.project_status_info);
                                    const StatusIcon = statusInfo.icon;
                                    return (
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
                                            {statusInfo.label as string}
                                        </span>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* 콘텐츠 */}
                    <div className="p-3">
                        <div className="flex items-center gap-2 mb-3">
                            <Badge className={`${postTypeInfo.typeColor} text-xs font-medium px-2 py-1 rounded-full border-0`}>
                                {postTypeInfo.icon}
                                <span className="ml-1">{typeName || postTypeInfo.typeName}</span>
                            </Badge>
                            {post.category && (
                                <Badge variant="outline" className="text-xs font-medium px-2 py-1 rounded-full border-slate-200 text-slate-600 bg-slate-50">
                                    {post.category.name}
                                </Badge>
                            )}
                        </div>

                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1 text-sm group-hover:text-blue-600 transition-colors duration-200">
                            {post.title}
                        </h3>

                        {post.subtitle && (
                            <p className="text-xs text-slate-600 mb-3 line-clamp-1">
                                {post.subtitle}
                            </p>
                        )}

                        {/* 프로젝트 정보 (프로젝트 타입일 때만) - 간소화 */}
                        {post.post_type === 'project' && post.project_data && (
                            <div className="space-y-2 mb-3">
                                {/* 모집 현황 */}
                                <div className="py-2 px-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-700">모집 현황</span>
                                            <span className="text-sm font-bold text-blue-900">
                                                {post.approved_members || 0}/{post.project_data.team_size}명
                                            </span>
                                        </div>
                                        {(post.applicant_count || 0) > 0 && (
                                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                                대기 {post.applicant_count}명
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min(((post.approved_members || 0) / (post.project_data?.team_size || 1)) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* 마감일 */}
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(post.project_data.deadline || '')}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(post.project_data.difficulty || '')}`}>
                                        {getDifficultyLabel(post.project_data.difficulty || '')}
                                    </span>
                                </div>
                            </div>
                        )}


                        {/* 활동 정보 (활동 타입일 때만) */}
                        {post.post_type === 'activity' && (
                            <div className="space-y-2 mb-3">
                                <div className="py-2 px-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center justify-between text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>참여 {post.current_participants || 0}/{post.max_participants || 0}명</span>
                                        </div>
                                        {post.location && (
                                            <span className="text-xs text-slate-500">
                                                {getLocationLabel(post.location)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {post.start_date && (
                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(post.start_date)}</span>
                                        {post.end_date && post.end_date !== post.start_date && (
                                            <span>~ {formatDate(post.end_date)}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 상태 표시 */}
                        {currentStatus === 'draft' && (
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                                    <Clock className="w-3 h-3" />
                                    <span>임시저장</span>
                                </div>
                            </div>
                        )}

                        {/* 액션 버튼들 (내 게시물인 경우) */}
                        {isOwnPost && (
                            <div className="space-y-2 mb-3">
                                {/* 프로젝트 상태 변경 (프로젝트 타입일 때만) */}
                                {post.post_type === 'project' && post.project_data && (
                                    <div className="relative" ref={dropdownRef}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                                            }}
                                            disabled={isChangingStatus}
                                            className="w-full text-xs h-8 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all duration-200"
                                        >
                                            {isChangingStatus ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="animate-spin rounded-full h-3 w-3 border border-slate-300 border-t-slate-600"></div>
                                                    <span>변경 중...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between w-full">
                                                    <span>프로젝트 상태 변경</span>
                                                    <ChevronDown className="w-3 h-3" />
                                                </div>
                                            )}
                                        </Button>

                                        {isStatusDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                                                <div className="p-1">
                                                    {[
                                                        { value: 'recruiting', label: '모집 중', color: 'text-blue-600' },
                                                        { value: 'in_progress', label: '진행 중', color: 'text-green-600' },
                                                        { value: 'completed', label: '완료', color: 'text-gray-600' },
                                                        { value: 'cancelled', label: '취소', color: 'text-red-600' }
                                                    ].map((status) => (
                                                        <button
                                                            key={status.value}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleProjectStatusChange(status.value);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-md transition-colors ${status.color} ${post.project_data?.project_status === status.value ? 'bg-slate-100 font-semibold' : ''
                                                                }`}
                                                        >
                                                            {status.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 기존 액션 버튼들 */}
                                <div className="flex gap-2">
                                    {onEdit && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onEdit(post.id, post.post_type);
                                            }}
                                            className="flex-1 text-xs h-8 rounded-lg border-0 shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
                                        >
                                            <Edit className="w-3 h-3 mr-1" />
                                            수정
                                        </Button>
                                    )}
                                    {currentStatus === 'draft' && (
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleStatusChange(post.id, post.post_type, 'published');
                                            }}
                                            className="flex-1 text-xs h-8 rounded-lg border-0 shadow-none bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                                        >
                                            <Globe className="w-3 h-3 mr-1" />
                                            공개
                                        </Button>
                                    )}
                                    {currentStatus === 'published' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleStatusChange(post.id, post.post_type, 'private');
                                            }}
                                            className="flex-1 text-xs h-8 rounded-lg border-0 shadow-none bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200"
                                        >
                                            <Lock className="w-3 h-3 mr-1" />
                                            비공개
                                        </Button>
                                    )}
                                    {currentStatus === 'private' && (
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleStatusChange(post.id, post.post_type, 'published');
                                            }}
                                            className="flex-1 text-xs h-8 rounded-lg border-0 shadow-none bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
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
                                            className="h-8 px-3 rounded-lg border-0 shadow-none bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 통계 */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 hover:text-slate-700 transition-colors duration-200">
                                    <Eye className="w-3 h-3" />
                                    <span className="font-medium">{views}</span>
                                </div>
                                <div className="flex items-center gap-1 hover:text-red-500 transition-colors duration-200">
                                    <Heart className="w-3 h-3" />
                                    <span className="font-medium">{post.likes_count}</span>
                                </div>
                                <div className="flex items-center gap-1 hover:text-blue-500 transition-colors duration-200">
                                    <MessageCircle className="w-3 h-3" />
                                    <span className="font-medium">{post.comments_count}</span>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                                {new Date(post.published_at || post.created_at).toLocaleDateString('ko-KR')}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
