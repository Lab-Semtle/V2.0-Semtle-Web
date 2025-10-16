'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Mail,
    Hash,
    GraduationCap,
    Github,
    ExternalLink,
    Linkedin
} from 'lucide-react';

interface ProfileHeaderProps {
    profile: {
        id: string;
        nickname: string;
        name: string;
        bio?: string;
        profile_image?: string;
        role: string;
        created_at: string;
        email?: string;
        student_id?: string;
        birth_date?: string;
        github_url?: string;
        portfolio_url?: string;
        linkedin_url?: string;
        major?: string;
        grade?: string;
        email_public?: boolean;
        student_id_public?: boolean;
        major_grade_public?: boolean;
        stats: {
            posts: {
                projects: number;
                resources: number;
                activities: number;
                total: number;
            };
            followers_count: number;
            following_count: number;
        };
    };
    isOwnProfile: boolean;
    onEditProfile?: () => void;
    isFollowing?: boolean;
    onFollow?: () => void;
    isFollowingLoading?: boolean;
}

export default function ProfileHeader({ profile, isOwnProfile, onEditProfile, isFollowing, onFollow, isFollowingLoading }: ProfileHeaderProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin':
                return <Badge className="bg-red-100 text-red-800">대표 관리자</Badge>;
            case 'admin':
                return <Badge className="bg-blue-100 text-blue-800">관리자</Badge>;
            case 'member':
                return <Badge variant="outline">회원</Badge>;
            default:
                return <Badge variant="outline">회원</Badge>;
        }
    };

    return (
        <div className="mb-8">
            {/* 인스타그램 스타일 프로필 헤더 */}
            <div className="p-6">
                {/* 상단 프로필 정보 */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* 프로필 이미지 */}
                    <div className="flex-shrink-0 flex justify-center md:justify-start">
                        <div className="relative">
                            <Avatar className="w-28 h-28 md:w-36 md:h-36 shadow-lg">
                                <AvatarImage src={profile.profile_image} alt={profile.nickname} />
                                <AvatarFallback className="text-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-0">
                                    {getInitials(profile.nickname || profile.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* 프로필 정보 */}
                    <div className="flex-1 min-w-0">
                        {/* 이름과 역할, 액션 버튼 */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
                                    {profile.nickname || profile.name}
                                </h1>
                                {getRoleBadge(profile.role)}
                            </div>

                            {/* 액션 버튼 - 우측 상단 */}
                            <div className="flex justify-center sm:justify-end">
                                {isOwnProfile ? (
                                    <Button
                                        variant="outline"
                                        onClick={onEditProfile}
                                        className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        프로필 편집
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={onFollow}
                                        disabled={isFollowingLoading}
                                        className={`px-6 py-2.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${isFollowing
                                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                            }`}
                                    >
                                        {isFollowingLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                        ) : isFollowing ? (
                                            '팔로잉'
                                        ) : (
                                            '팔로우'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* 기본 정보와 통계를 한 줄에 배치 */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                            {/* 기본 정보 */}
                            <div className="space-y-2 flex-1">
                                {profile.name !== profile.nickname && (
                                    <div className="text-lg font-medium text-gray-900">{profile.name}</div>
                                )}
                                {profile.bio && (
                                    <div className="text-gray-700 leading-relaxed">{profile.bio}</div>
                                )}
                            </div>

                            {/* 통계 */}
                            <div className="flex gap-6 flex-shrink-0">
                                <div className="text-center">
                                    <div className="text-2xl font-semibold text-gray-900">{profile.stats.posts.total}</div>
                                    <div className="text-sm text-gray-600 font-medium">게시물</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-semibold text-gray-900">{profile.stats.followers_count}</div>
                                    <div className="text-sm text-gray-600 font-medium">팔로워</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-semibold text-gray-900">{profile.stats.following_count}</div>
                                    <div className="text-sm text-gray-600 font-medium">팔로잉</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 추가 정보 섹션 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4">
                        {/* 학번 */}
                        {profile.student_id && profile.student_id_public && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Hash className="w-4 h-4 text-gray-500" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">학번</div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {profile.student_id.length >= 4 ? profile.student_id.substring(2, 4) : profile.student_id}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 전공/학년 */}
                        {(profile.major || profile.grade) && profile.major_grade_public && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <GraduationCap className="w-4 h-4 text-gray-500" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">학과/전공</div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {profile.major || '전공 미입력'}
                                        {profile.grade && (
                                            <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                                {profile.grade}학년
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 이메일 (이메일 공개 설정인 경우만) */}
                        {profile.email && profile.email_public && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">이메일</div>
                                    <div className="text-sm font-medium text-gray-900">{profile.email}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 소셜 링크 */}
                    {(profile.github_url || profile.portfolio_url || profile.linkedin_url) && (
                        <div className="mt-4">
                            <div className="flex gap-3">
                                {profile.github_url && (
                                    <a
                                        href={profile.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm transition-colors"
                                    >
                                        <Github className="w-4 h-4" />
                                        GitHub
                                    </a>
                                )}
                                {profile.portfolio_url && (
                                    <a
                                        href={profile.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        포트폴리오
                                    </a>
                                )}
                                {profile.linkedin_url && (
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm transition-colors"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}