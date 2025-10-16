'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Shield,
    Globe,
    Save,
    ArrowLeft,
    Settings,
    Mail,
    Upload,
    X,
    Github,
    ExternalLink,
    Linkedin,
    GraduationCap
} from 'lucide-react';

export default function SettingsPage() {
    const { user, profile, loading, refreshProfile } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        bio: '',
        profile_image: '',
        email: '',
        student_id: '',
        birth_date: '',
        github_url: '',
        portfolio_url: '',
        linkedin_url: '',
        major: '',
        grade: '',
        privacy: {
            profileVisibility: 'public',
            email_public: true,
            student_id_public: true,
            major_grade_public: true
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
                email: profile.email || '',
                student_id: profile.student_id || '',
                birth_date: profile.birth_date || '',
                github_url: profile.github_url || '',
                portfolio_url: profile.portfolio_url || '',
                linkedin_url: profile.linkedin_url || '',
                major: profile.major || '',
                grade: profile.grade ? String(profile.grade) : ''
            }));
        }

        // 로컬 스토리지에서 개인정보 설정 로드
        const savedPrivacy = localStorage.getItem('privacySettings');

        if (savedPrivacy) {
            try {
                const privacy = JSON.parse(savedPrivacy);
                setFormData(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, ...privacy }
                }));
            } catch {
            }
        }
    }, [profile]);

    // URL 파라미터 확인 (비밀번호 재설정 링크에서 온 경우)

    const handleInputChange = (field: string, value: string | boolean) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => {
                const newData = {
                    ...prev,
                    [parent]: {
                        ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
                        [child]: value
                    }
                };

                // 개인정보 설정이 변경된 경우 로컬 스토리지에 저장
                if (parent === 'privacy') {
                    localStorage.setItem('privacySettings', JSON.stringify(newData.privacy));
                }

                return newData;
            });
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
                    profile_image: formData.profile_image,
                    birth_date: formData.birth_date,
                    github_url: formData.github_url,
                    portfolio_url: formData.portfolio_url,
                    linkedin_url: formData.linkedin_url,
                    major: formData.major,
                    grade: formData.grade || null,
                    userId: user?.id
                })
            });

            if (response.ok) {
                alert('프로필이 업데이트되었습니다.');
                setIsEditing(false);
                // 페이지 새로고침으로 최신 데이터 반영
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`프로필 업데이트 실패: ${errorData.error || '알 수 없는 오류'}`);
            }
        } catch {
            alert('오류가 발생했습니다.');
        }
    };

    const handleSendCode = async () => {
        if (!user?.email) {
            alert('이메일 정보를 찾을 수 없습니다.');
            return;
        }

        setIsSendingCode(true);
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'send_code',
                    email: user.email
                })
            });

            if (response.ok) {
                alert('비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요.');
            } else {
                const errorData = await response.json();

                // 이메일 한도 초과 오류인 경우 특별 처리
                if (response.status === 429 && errorData.code === 'EMAIL_RATE_LIMIT') {
                    const alternativeMessage = errorData.alternative
                        ? `\n\n대안 방법:\n${errorData.alternative.instruction}\n\n또는 관리자에게 문의해주세요.`
                        : '\n\n잠시 후 다시 시도해주세요.\n(보통 1시간 후에 다시 시도 가능합니다)';

                    alert(`이메일 발송 한도가 초과되었습니다.${alternativeMessage}`);
                } else {
                    alert(errorData.error || '인증 코드 발송에 실패했습니다.');
                }
            }
        } catch {
            alert('오류가 발생했습니다.');
        } finally {
            setIsSendingCode(false);
        }
    };


    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 파일 크기 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB를 초과할 수 없습니다.');
            return;
        }

        // 파일 타입 검증
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('지원되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 허용)');
            return;
        }

        setIsUploadingImage(true);
        setImageError(false);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user?.id || '');

            const response = await fetch('/api/profile/upload-image', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setFormData(prev => ({
                    ...prev,
                    profile_image: result.imageUrl
                }));
                alert('프로필 이미지가 업로드되었습니다.');
                // AuthContext의 프로필 정보 새로고침
                await refreshProfile();
            } else {
                const errorData = await response.json();
                alert(`이미지 업로드 실패: ${errorData.error || '알 수 없는 오류'}\n${errorData.details ? `상세: ${errorData.details}` : ''}`);
            }
        } catch {
            alert('오류가 발생했습니다.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleImageRemove = async () => {
        if (!confirm('프로필 이미지를 제거하시겠습니까?')) return;

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
                    profile_image: '',
                    birth_date: formData.birth_date,
                    github_url: formData.github_url,
                    portfolio_url: formData.portfolio_url,
                    linkedin_url: formData.linkedin_url,
                    major: formData.major,
                    grade: formData.grade || null,
                    userId: user?.id
                })
            });

            if (response.ok) {
                setFormData(prev => ({
                    ...prev,
                    profile_image: ''
                }));
                alert('프로필 이미지가 제거되었습니다.');
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`이미지 제거 실패: ${errorData.error || '알 수 없는 오류'}`);
            }
        } catch {
            alert('오류가 발생했습니다.');
        }
    };

    const handleSavePrivacySettings = async () => {
        if (!user) return;

        try {
            const response = await fetch('/api/profile/update-privacy', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    privacy: formData.privacy
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '개인정보 설정 저장에 실패했습니다.');
            }

            alert('개인정보 설정이 저장되었습니다.');
        } catch {
            alert('개인정보 설정 저장에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-transparent group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                            뒤로가기
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl flex items-center justify-center">
                            <Settings className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 drop-shadow-sm">설정</h1>
                            <p className="text-gray-600 mt-1">
                                계정 정보와 개인 설정을 관리하세요.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 설정 탭 */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto border-b border-gray-200">
                        <TabsTrigger value="profile" className="bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none relative">프로필</TabsTrigger>
                        <TabsTrigger value="security" className="bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none relative">보안</TabsTrigger>
                        <TabsTrigger value="privacy" className="bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none relative">개인정보</TabsTrigger>
                    </TabsList>

                    {/* 프로필 설정 */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card className="bg-transparent shadow-none border-0">
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium">기본 정보</h3>
                                        <p className="text-sm text-gray-600">프로필에 표시되는 기본 정보를 수정하세요</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-blue-600 hover:border-blue-700"
                                    >
                                        {isEditing ? '취소' : '편집'}
                                    </Button>
                                </div>
                                <div className="border-b border-gray-200"></div>

                                {/* 프로필 이미지 섹션 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            {formData.profile_image && !imageError ? (
                                                <Image
                                                    src={formData.profile_image}
                                                    alt="프로필 이미지"
                                                    width={96}
                                                    height={96}
                                                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                                    onLoad={() => setImageError(false)}
                                                    onError={() => setImageError(true)}
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-white text-2xl font-semibold">
                                                    {(formData.nickname || formData.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {isUploadingImage && (
                                                <div className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="file"
                                                    id="profile-image"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    disabled={isUploadingImage}
                                                />
                                                <label
                                                    htmlFor="profile-image"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${isUploadingImage
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    {isUploadingImage ? '업로드 중...' : '이미지 업로드'}
                                                </label>
                                                {formData.profile_image && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleImageRemove}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 h-auto"
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        제거
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                JPEG, PNG, GIF, WebP 형식만 지원됩니다. (최대 5MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">이름</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            disabled={!isEditing}
                                            className={!isEditing ? "bg-gray-100" : ""}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nickname">닉네임</Label>
                                        <Input
                                            id="nickname"
                                            value={formData.nickname}
                                            onChange={(e) => handleInputChange('nickname', e.target.value)}
                                            disabled={!isEditing}
                                            className={!isEditing ? "bg-gray-100" : ""}
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
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isEditing ? "bg-gray-100" : ""}`}
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

                                    <div className="space-y-2">
                                        <Label htmlFor="student_id">학번</Label>
                                        <Input
                                            id="student_id"
                                            value={formData.student_id}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                        <p className="text-sm text-gray-500">학번은 변경할 수 없습니다</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="birth_date">생년월일</Label>
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={formData.birth_date}
                                            onChange={(e) => handleInputChange('birth_date', e.target.value)}
                                            disabled={!isEditing}
                                            className={!isEditing ? "bg-gray-100" : ""}
                                        />
                                        {!isEditing && (
                                            <p className="text-sm text-gray-500">편집 버튼을 눌러 생년월일을 수정할 수 있습니다</p>
                                        )}
                                    </div>
                                </div>

                                {/* 소셜 링크 섹션 */}
                                <div className="space-y-4 mt-12">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">소셜 링크</h3>
                                        <div className="border-b border-gray-200 mt-2"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="github_url" className="flex items-center gap-2">
                                                <Github className="w-4 h-4" />
                                                GitHub
                                            </Label>
                                            <Input
                                                id="github_url"
                                                type="url"
                                                value={formData.github_url}
                                                onChange={(e) => handleInputChange('github_url', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="https://github.com/username"
                                                className={!isEditing ? "bg-gray-100" : ""}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="portfolio_url" className="flex items-center gap-2">
                                                <ExternalLink className="w-4 h-4" />
                                                포트폴리오
                                            </Label>
                                            <Input
                                                id="portfolio_url"
                                                type="url"
                                                value={formData.portfolio_url}
                                                onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="https://your-portfolio.com"
                                                className={!isEditing ? "bg-gray-100" : ""}
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                                                <Linkedin className="w-4 h-4" />
                                                LinkedIn
                                            </Label>
                                            <Input
                                                id="linkedin_url"
                                                type="url"
                                                value={formData.linkedin_url}
                                                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="https://linkedin.com/in/username"
                                                className={!isEditing ? "bg-gray-100" : ""}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 학과/전공 정보 섹션 */}
                                <div className="space-y-4 mt-12">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5" />
                                            학과/전공 정보
                                        </h3>
                                        <div className="border-b border-gray-200 mt-2"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="major">전공</Label>
                                            <Input
                                                id="major"
                                                value={formData.major || ''}
                                                onChange={(e) => handleInputChange('major', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder={formData.major ? "컴퓨터공학과" : "없음"}
                                                className={!isEditing ? "bg-gray-100" : ""}
                                            />
                                            {!isEditing && !formData.major && (
                                                <p className="text-sm text-gray-500">전공 정보가 없습니다</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="grade">학년</Label>
                                            <select
                                                id="grade"
                                                value={formData.grade || ''}
                                                onChange={(e) => handleInputChange('grade', e.target.value)}
                                                disabled={!isEditing}
                                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isEditing ? "bg-gray-100" : ""
                                                    }`}
                                            >
                                                <option value="">{formData.grade ? "학년 선택" : "없음"}</option>
                                                <option value="1">1학년</option>
                                                <option value="2">2학년</option>
                                                <option value="3">3학년</option>
                                                <option value="4">4학년</option>
                                            </select>
                                            {!isEditing && !formData.grade && (
                                                <p className="text-sm text-gray-500">학년 정보가 없습니다</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                        <Card className="bg-transparent shadow-none border-0">
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        비밀번호 변경
                                    </h3>
                                    <div className="border-b border-gray-200 mt-2"></div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                            <h4 className="font-medium text-blue-900">이메일을 통한 비밀번호 재설정</h4>
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            비밀번호를 변경하고 싶으시다면 이메일로 재설정 링크를 발송해드립니다.
                                            이메일의 링크를 클릭하면 새 비밀번호를 설정할 수 있습니다.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">이메일 주소</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                        <p className="text-sm text-gray-500">등록된 이메일 주소로 재설정 링크가 발송됩니다</p>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <Button
                                            onClick={handleSendCode}
                                            disabled={isSendingCode}
                                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            {isSendingCode ? '발송 중...' : '비밀번호 재설정 링크 발송'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    {/* 개인정보 보호 */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card className="bg-transparent shadow-none border-0">
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        개인정보 보호
                                    </h3>
                                    <div className="border-b border-gray-200 mt-2"></div>
                                </div>
                                <div className="space-y-6">
                                    {/* 프로필 공개 여부 */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="font-medium text-gray-900">프로필 공개 여부</p>
                                            <p className="text-sm text-gray-600">다른 사용자가 내 게시물을 볼 수 있습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.privacy.profileVisibility === 'public'}
                                            onCheckedChange={(checked) => handleInputChange('privacy.profileVisibility', checked ? 'public' : 'private')}
                                        />
                                    </div>

                                    {/* 이메일 공개 여부 */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="font-medium text-gray-900">이메일 공개 여부</p>
                                            <p className="text-sm text-gray-600">다른 사용자가 내 이메일을 볼 수 있습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.privacy.email_public}
                                            onCheckedChange={(checked) => handleInputChange('privacy.email_public', checked)}
                                        />
                                    </div>

                                    {/* 학번 공개 여부 */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="font-medium text-gray-900">학번 공개 여부</p>
                                            <p className="text-sm text-gray-600">다른 사용자가 내 학번을 볼 수 있습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.privacy.student_id_public}
                                            onCheckedChange={(checked) => handleInputChange('privacy.student_id_public', checked)}
                                        />
                                    </div>

                                    {/* 전공 및 학년 공개 여부 */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="font-medium text-gray-900">전공 및 학년 공개 여부</p>
                                            <p className="text-sm text-gray-600">다른 사용자가 내 전공과 학년을 볼 수 있습니다</p>
                                        </div>
                                        <Switch
                                            checked={formData.privacy.major_grade_public}
                                            onCheckedChange={(checked) => handleInputChange('privacy.major_grade_public', checked)}
                                        />
                                    </div>
                                </div>

                                {/* 저장 버튼 */}
                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    <Button
                                        onClick={handleSavePrivacySettings}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        개인정보 설정 저장
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}