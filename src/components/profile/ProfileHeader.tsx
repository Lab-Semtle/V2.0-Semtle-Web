'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    User,
    Calendar,
    Eye,
    Heart,
    MessageCircle,
    Bookmark,
    Settings,
    Edit
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
}

export default function ProfileHeader({ profile, isOwnProfile, onEditProfile }: ProfileHeaderProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatJoinDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long'
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin':
                return <Badge className="bg-red-100 text-red-800">슈퍼 관리자</Badge>;
            case 'admin':
                return <Badge className="bg-blue-100 text-blue-800">관리자</Badge>;
            case 'member':
                return <Badge variant="outline">회원</Badge>;
            default:
                return <Badge variant="outline">회원</Badge>;
        }
    };

    return (
        <Card className="mb-6">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* 프로필 이미지 */}
                    <div className="flex-shrink-0">
                        <Avatar className="w-24 h-24 md:w-32 md:h-32">
                            <AvatarImage src={profile.profile_image} alt={profile.nickname} />
                            <AvatarFallback className="text-2xl">
                                {getInitials(profile.nickname || profile.name)}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* 프로필 정보 */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                                        {profile.nickname || profile.name}
                                    </h1>
                                    {getRoleBadge(profile.role)}
                                </div>

                                {profile.name !== profile.nickname && (
                                    <p className="text-gray-600 mb-2">{profile.name}</p>
                                )}

                                {profile.bio && (
                                    <p className="text-gray-700 mb-3">{profile.bio}</p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatJoinDate(profile.created_at)} 가입</span>
                                    </div>
                                </div>
                            </div>

                            {/* 액션 버튼들 */}
                            <div className="flex gap-2">
                                {isOwnProfile ? (
                                    <Button variant="outline" onClick={onEditProfile}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        프로필 편집
                                    </Button>
                                ) : (
                                    <Button variant="outline">
                                        <User className="w-4 h-4 mr-2" />
                                        팔로우
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* 통계 */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {profile.stats.posts.total}
                                </div>
                                <div className="text-sm text-gray-600">게시물</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {profile.stats.followers_count}
                                </div>
                                <div className="text-sm text-gray-600">팔로워</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {profile.stats.following_count}
                                </div>
                                <div className="text-sm text-gray-600">팔로잉</div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
