'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Shield,
    Bell,
    Globe,
    Eye,
    EyeOff,
    Save,
    ArrowLeft,
    Settings,
    Mail,
    Lock,
    Users,
    Activity,
    Heart,
    Bookmark
} from 'lucide-react';

export default function SettingsPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        bio: '',
        profile_image: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        notifications: {
            email: true,
            push: false,
            marketing: false,
            likes: true,
            comments: true,
            follows: true
        },
        privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showActivity: true,
            showFollowers: true,
            showFollowing: true
        }
    });

    // 프로필 데이터 로드
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                name: profile.name || '',
                nickname: profile.nickname || '',
                bio: profile.bio || '',
                profile_image: profile.profile_image || '',
                email: profile.email || ''
            }));
        }
    }, [profile]);

    const handleInputChange = (field: string, value: string | boolean) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/profile/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    nickname: formData.nickname,
                    bio: formData.bio,
                    profile_image: formData.profile_image
                })
            });

            if (response.ok) {
                alert('프로필이 업데이트되었습니다.');
                setIsEditing(false);
            } else {
                alert('프로필 업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.error('프로필 업데이트 오류:', error);
            alert('오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            뒤로가기
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
                    <p className="text-gray-600">
                        계정 정보와 개인 설정을 관리하세요.
                    </p>
                </div>

                {/* 설정 탭 */}
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile">프로필</TabsTrigger>
                        <TabsTrigger value="security">보안</TabsTrigger>
                        <TabsTrigger value="notifications">알림</TabsTrigger>
                        <TabsTrigger value="privacy">개인정보</TabsTrigger>
                    </TabsList>

                    {/* 프로필 설정 */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    프로필 정보
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium">기본 정보</h3>
                                        <p className="text-sm text-gray-600">프로필에 표시되는 기본 정보를 수정하세요</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        {isEditing ? '취소' : '편집'}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">이름</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nickname">닉네임</Label>
                                        <Input
                                            id="nickname"
                                            value={formData.nickname}
                                            onChange={(e) => handleInputChange('nickname', e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="bio">소개</Label>
                                        <textarea
                                            id="bio"
                                            value={formData.bio}
                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                            disabled={!isEditing}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                            placeholder="자기소개를 작성하세요"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="email">이메일</Label>
                                        <Input
                                            id="email"
                                            value={formData.email}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                        <p className="text-sm text-gray-500">이메일은 변경할 수 없습니다</p>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end">
                                        <Button onClick={handleSave}>
                                            <Save className="w-4 h-4 mr-2" />
                                            저장
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 보안 설정 */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    비밀번호 변경
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">현재 비밀번호</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.currentPassword}
                                                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">새 비밀번호</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button>
                                        <Lock className="w-4 h-4 mr-2" />
                                        비밀번호 변경
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 알림 설정 */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    알림 설정
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-blue-600" />
                                                <p className="font-medium">이메일 알림</p>
                                            </div>
                                            <p className="text-sm text-gray-600">중요한 업데이트를 이메일로 받습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.notifications.email}
                                            onCheckedChange={(checked) => handleInputChange('notifications.email', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-green-600" />
                                                <p className="font-medium">푸시 알림</p>
                                            </div>
                                            <p className="text-sm text-gray-600">브라우저 푸시 알림을 받습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.notifications.push}
                                            onCheckedChange={(checked) => handleInputChange('notifications.push', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Heart className="w-4 h-4 text-red-600" />
                                                <p className="font-medium">좋아요 알림</p>
                                            </div>
                                            <p className="text-sm text-gray-600">내 게시물에 좋아요를 받을 때 알림</p>
                                        </div>
                                        <Switch
                                            checked={formData.notifications.likes}
                                            onCheckedChange={(checked) => handleInputChange('notifications.likes', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-purple-600" />
                                                <p className="font-medium">댓글 알림</p>
                                            </div>
                                            <p className="text-sm text-gray-600">내 게시물에 댓글이 달릴 때 알림</p>
                                        </div>
                                        <Switch
                                            checked={formData.notifications.comments}
                                            onCheckedChange={(checked) => handleInputChange('notifications.comments', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-orange-600" />
                                                <p className="font-medium">팔로우 알림</p>
                                            </div>
                                            <p className="text-sm text-gray-600">새로운 팔로워가 생길 때 알림</p>
                                        </div>
                                        <Switch
                                            checked={formData.notifications.follows}
                                            onCheckedChange={(checked) => handleInputChange('notifications.follows', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Bookmark className="w-4 h-4 text-indigo-600" />
                                                <p className="font-medium">마케팅 알림</p>
                                            </div>
                                            <p className="text-sm text-gray-600">프로모션 및 이벤트 정보를 받습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.notifications.marketing}
                                            onCheckedChange={(checked) => handleInputChange('notifications.marketing', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 개인정보 보호 */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    개인정보 보호
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="profileVisibility">프로필 공개 범위</Label>
                                        <select
                                            id="profileVisibility"
                                            value={formData.privacy.profileVisibility}
                                            onChange={(e) => handleInputChange('privacy.profileVisibility', e.target.value)}
                                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="public">공개</option>
                                            <option value="friends">친구만</option>
                                            <option value="private">비공개</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">이메일 주소 공개</p>
                                            <p className="text-sm text-gray-600">다른 사용자가 내 이메일을 볼 수 있습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.privacy.showEmail}
                                            onCheckedChange={(checked) => handleInputChange('privacy.showEmail', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">활동 내역 공개</p>
                                            <p className="text-sm text-gray-600">내 활동 내역을 다른 사용자가 볼 수 있습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.privacy.showActivity}
                                            onCheckedChange={(checked) => handleInputChange('privacy.showActivity', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">팔로워 목록 공개</p>
                                            <p className="text-sm text-gray-600">내 팔로워 목록을 다른 사용자가 볼 수 있습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.privacy.showFollowers}
                                            onCheckedChange={(checked) => handleInputChange('privacy.showFollowers', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">팔로잉 목록 공개</p>
                                            <p className="text-sm text-gray-600">내 팔로잉 목록을 다른 사용자가 볼 수 있습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.privacy.showFollowing}
                                            onCheckedChange={(checked) => handleInputChange('privacy.showFollowing', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}