'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProfileProjectCard from '@/components/profile/ProfileProjectCard';
import ResourceCard from '@/components/resources/ResourceCard';
import ContributionGraph from '@/components/profile/ContributionGraph';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ResourcePost } from '@/types/resource';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, Github, ExternalLink, Linkedin, Hash, GraduationCap, Mail, Bookmark } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import BookmarkProjectCard from '@/components/profile/BookmarkProjectCard';
import BookmarkResourceCard from '@/components/profile/BookmarkResourceCard';
import { Post } from '@/types/post';

interface Profile {
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
    privacy?: {
        profileVisibility: string;
        email_public: boolean;
        student_id_public: boolean;
        major_grade_public: boolean;
    };
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
}

export default function UserProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    // params를 unwrap
    const resolvedParams = use(params);

    // Helper functions
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

    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [myResources, setMyResources] = useState<Post[]>([]);
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, unknown>[]>([]);
    const [otherPosts, setOtherPosts] = useState<Post[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingResources, setLoadingResources] = useState(true);
    const [loadingBookmarks, setLoadingBookmarks] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowingLoading, setIsFollowingLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 무한 스크롤을 위한 상태
    const [projectPage, setProjectPage] = useState(1);
    const [hasMoreProjects, setHasMoreProjects] = useState(true);
    const [loadingMoreProjects, setLoadingMoreProjects] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('');

    // 로딩 중이거나 profile이 없으면 isOwnProfile을 false로 설정
    const isOwnProfile = !loading && profile?.nickname === resolvedParams.nickname;

    // URL 해시를 읽어서 탭 설정
    useEffect(() => {
        const updateTabFromHash = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                setActiveTab(hash);
            } else {
                // 기본 탭 설정
                setActiveTab(isOwnProfile ? 'my-projects' : 'projects');
            }
        };

        // 초기 로드 시 탭 설정
        updateTabFromHash();

        // hashchange 이벤트 리스너 추가 (리다이렉트 등으로 해시가 변경될 때 감지)
        window.addEventListener('hashchange', updateTabFromHash);

        return () => {
            window.removeEventListener('hashchange', updateTabFromHash);
        };
    }, [isOwnProfile]);

    // 탭 변경 시 URL 해시 업데이트
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // URL 해시 업데이트 (히스토리 추가하지 않음)
        window.history.replaceState({}, '', `#${value}`);
    };

    // 프로필 공개 여부 확인 (본인 프로필이거나 프로필이 공개된 경우)
    const isProfilePublic = isOwnProfile || profileData?.privacy?.profileVisibility === 'public';

    // 팔로우 상태 확인
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!isOwnProfile && profileData && user) {
                try {
                    const response = await fetch(`/api/follow?userId=${profileData.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setIsFollowing(data.isFollowing);
                    }
                } catch {
                    // 팔로우 상태 확인 오류 시 무시
                }
            }
        };

        checkFollowStatus();
    }, [profileData, isOwnProfile, user]);

    // 팔로우 토글
    const handleFollow = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (user.id === profileData?.id) {
            alert('자신을 팔로우할 수 없습니다.');
            return;
        }

        if (isFollowingLoading) return;

        setIsFollowingLoading(true);

        try {
            const response = await fetch('/api/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ userId: profileData?.id })
            });

            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);

                // 팔로워 수 업데이트
                if (profileData) {
                    setProfileData(prev => prev ? {
                        ...prev,
                        stats: {
                            ...prev.stats,
                            followers_count: data.isFollowing
                                ? prev.stats.followers_count + 1
                                : prev.stats.followers_count - 1
                        }
                    } : null);
                }
            } else {
            }
        } catch {

        } finally {
            setIsFollowingLoading(false);
        }
    };


    // 프로필 데이터 로드
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`/api/profile/by-nickname/${resolvedParams.nickname}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data.profile);
                } else if (response.status === 404) {
                    setError('사용자를 찾을 수 없습니다.');
                } else {
                    setError('프로필을 불러오는 중 오류가 발생했습니다.');
                }
            } catch {
                setError('프로필을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [resolvedParams.nickname]);

    // 프로젝트 무한 스크롤 함수
    const fetchMoreProjects = async () => {
        if (!profileData || !hasMoreProjects || loadingMoreProjects) return;

        setLoadingMoreProjects(true);
        try {
            const response = await fetch(`/api/profile/${profileData.id}/posts?type=project&page=${projectPage + 1}&limit=9&include_drafts=${isOwnProfile}`);
            if (response.ok) {
                const data = await response.json();
                if (data.posts.length === 0) {
                    setHasMoreProjects(false);
                } else {
                    // 중복 방지를 위해 기존 ID와 비교
                    const currentPosts = isOwnProfile ? myPosts : otherPosts;
                    const existingIds = new Set(currentPosts.map((post: Post) => post.id));
                    const newPosts = data.posts.filter((post: Post) => !existingIds.has(post.id));

                    if (newPosts.length > 0) {
                        if (isOwnProfile) {
                            setMyPosts(prev => [...prev, ...newPosts]);
                        } else {
                            setOtherPosts(prev => [...prev, ...newPosts]);
                        }
                        setProjectPage(prev => prev + 1);
                    } else {
                        setHasMoreProjects(false);
                    }
                }
            }
        } catch {
        } finally {
            setLoadingMoreProjects(false);
        }
    };

    // 스크롤 이벤트 핸들러 제거
    // useEffect(() => {
    //     const handleScroll = () => {
    //         if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
    //             fetchMoreProjects();
    //         }
    //     };

    //     if (isOwnProfile) {
    //         window.addEventListener('scroll', handleScroll);
    //         return () => window.removeEventListener('scroll', handleScroll);
    //     }
    // }, [profileData, hasMoreProjects, loadingMoreProjects, projectPage, isOwnProfile]);

    // 게시물 로드 (내 프로필인 경우와 다른 사람 프로필인 경우 구분)
    useEffect(() => {
        const fetchPosts = async () => {
            if (!profileData) return;

            try {
                if (isOwnProfile) {
                    // 내 프로필인 경우: 모든 타입의 게시물 로드 (임시저장 포함)
                    const [projectsResponse, resourcesResponse] = await Promise.all([
                        fetch(`/api/profile/${profileData.id}/posts?type=project&page=1&limit=100&include_drafts=true`),
                        fetch(`/api/profile/${profileData.id}/posts?type=resource&page=1&limit=100&include_drafts=true`)
                    ]);

                    if (projectsResponse.ok) {
                        const data = await projectsResponse.json();
                        const projects = (data.posts || []).map((p: unknown) => ({ ...(p as Post), post_type: 'project' }));
                        setMyPosts(projects);
                        setProjectPage(1);
                        setHasMoreProjects(projects.length === 9);
                    }

                    if (resourcesResponse.ok) {
                        const data = await resourcesResponse.json();
                        const resources = (data.posts || []).map((p: unknown) => ({ ...(p as Post), post_type: 'resource' }));
                        setMyResources(resources);
                    }
                } else {
                    // 다른 사람 프로필인 경우: 공개 게시물만 (페이지네이션 적용)
                    const [projectsResponse, resourcesResponse] = await Promise.all([
                        fetch(`/api/profile/${profileData.id}/posts?type=project&page=1&limit=100&include_drafts=false`),
                        fetch(`/api/profile/${profileData.id}/posts?type=resource&page=1&limit=100&include_drafts=false`)
                    ]);

                    // 게시물 데이터 설정 (post_type 추가)
                    const allPosts: Post[] = [];

                    if (projectsResponse.ok) {
                        const projectsData = await projectsResponse.json();
                        const projects = (projectsData.posts || []).map((p: unknown) => ({ ...(p as Post), post_type: 'project' }));
                        allPosts.push(...projects);
                        setProjectPage(1);
                        setHasMoreProjects(projects.length === 9);
                    }

                    if (resourcesResponse.ok) {
                        const resourcesData = await resourcesResponse.json();
                        const resources = (resourcesData.posts || []).map((p: unknown) => ({ ...(p as Post), post_type: 'resource' }));
                        allPosts.push(...resources);
                    }

                    // 다른 사용자의 모든 게시물을 otherPosts에 저장
                    setOtherPosts(allPosts);
                }
            } catch {
                console.error('게시물 로딩 오류');
            } finally {
                setLoadingPosts(false);
                setLoadingResources(false);
            }
        };

        if (profileData) {
            fetchPosts();
        }
    }, [profileData, isOwnProfile]);

    // 북마크 데이터 로드 (내 프로필인 경우만)
    useEffect(() => {
        const fetchBookmarks = async () => {
            if (!isOwnProfile || !user) return;

            try {
                setLoadingBookmarks(true);
                const response = await fetch('/api/profile/bookmarks?type=all');

                if (response.ok) {
                    const data = await response.json();
                    setBookmarkedPosts(data.posts || []);
                }
            } catch {
                setBookmarkedPosts([]);
            } finally {
                setLoadingBookmarks(false);
            }
        };

        if (user && isOwnProfile) {
            fetchBookmarks();
        }
    }, [user, isOwnProfile]);



    const handleEditProfile = () => {
        router.push('/settings');
    };

    if (loading || loadingProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <User className="w-10 h-10 text-gray-400" />
                            </div>
                            <h1 className="text-3xl font-light text-gray-900 mb-4">사용자를 찾을 수 없습니다</h1>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">{error}</p>
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                ← 이전 페이지로 돌아가기
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
                {/* GitHub 스타일 레이아웃 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 좌측 프로필 사이드바 */}
                    <div className="lg:col-span-3 order-2 lg:order-1">
                        <div className="space-y-4">
                            {/* 프로필 이미지 */}
                            <Avatar className="w-64 h-64 shadow-lg">
                                <AvatarImage src={profileData.profile_image} alt={profileData.nickname} />
                                <AvatarFallback className="text-4xl bg-gray-300 text-gray-700 font-semibold border-0">
                                    {(profileData.nickname || profileData.name).charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* 권한 뱃지 */}
                            <div className="mb-2">
                                {getRoleBadge(profileData.role)}
                            </div>

                            {/* 닉네임과 이름 */}
                            <div>
                                <h1 className="text-2xl">
                                    <span className="font-bold text-gray-900">{profileData.nickname}</span>
                                    {profileData.name !== profileData.nickname && (
                                        <>
                                            <span className="text-gray-400 font-normal mx-2">·</span>
                                            <span className="text-gray-600 font-normal">{profileData.name}</span>
                                        </>
                                    )}
                                </h1>
                            </div>

                            {/* 소개글 */}
                            {profileData.bio && (
                                <p className="text-gray-700">{profileData.bio}</p>
                            )}

                            {/* 팔로우 버튼 */}
                            <div className="flex items-center gap-3">
                                {isOwnProfile ? (
                                    <Button
                                        onClick={handleEditProfile}
                                        className="w-full bg-blue-500 text-white font-semibold hover:bg-blue-600 shadow-md hover:shadow-lg transition-all"
                                    >
                                        프로필 편집
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleFollow}
                                        disabled={isFollowingLoading}
                                        className={`w-full ${isFollowing
                                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
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

                            {/* 팔로우/팔로워 수 */}
                            <div className="flex gap-4 text-sm">
                                <button className="hover:underline">
                                    <span className="font-semibold">{profileData.stats.followers_count}</span>
                                    <span className="text-gray-600 ml-1">팔로워</span>
                                </button>
                                <button className="hover:underline">
                                    <span className="font-semibold">{profileData.stats.following_count}</span>
                                    <span className="text-gray-600 ml-1">팔로잉</span>
                                </button>
                                <button className="hover:underline">
                                    <span className="font-semibold">{profileData.stats.posts.total}</span>
                                    <span className="text-gray-600 ml-1">게시물</span>
                                </button>
                            </div>

                            {/* 학번 */}
                            {profileData.student_id && profileData.student_id_public && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{profileData.student_id}</span>
                                </div>
                            )}

                            {/* 전공/학년 */}
                            {profileData.major_grade_public && (profileData.major || profileData.grade) && (
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                                    {profileData.major && (
                                        <>
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{profileData.major}</span>
                                        </>
                                    )}
                                    {profileData.grade && (
                                        <>
                                            {!profileData.major && <GraduationCap className="w-4 h-4 text-gray-400" />}
                                            <span className="font-medium">{profileData.grade}학년</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 이메일 */}
                            {profileData.email && profileData.email_public && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{profileData.email}</span>
                                </div>
                            )}

                            {/* 소셜 링크 */}
                            {(profileData.github_url || profileData.portfolio_url || profileData.linkedin_url) && (
                                <div className="flex gap-2 mt-2">
                                    {profileData.github_url && (
                                        <a href={profileData.github_url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg shadow-sm hover:shadow transition-all">
                                            <Github className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profileData.portfolio_url && (
                                        <a href={profileData.portfolio_url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg shadow-sm hover:shadow transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profileData.linkedin_url && (
                                        <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg shadow-sm hover:shadow transition-all">
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 우측 게시물 영역 */}
                    <div className="lg:col-span-9 order-1 lg:order-2 space-y-6">
                        {/* GitHub 잔디 그래프 */}
                        {((isOwnProfile && [...myPosts, ...myResources].length > 0) || (!isOwnProfile && otherPosts.filter(post => post.post_type !== 'activity').length > 0)) && (
                            <ContributionGraph
                                posts={[...myPosts, ...myResources, ...otherPosts.filter(post => post.post_type !== 'activity')].filter(post => post.created_at)}
                                userCreatedAt={profileData?.created_at}
                            />
                        )}

                        {/* 게시물 탭 */}
                        {isProfilePublic ? (
                            <Tabs value={activeTab || (isOwnProfile ? "my-projects" : "projects")} onValueChange={handleTabChange} className="space-y-6">
                                <TabsList className="inline-flex h-auto items-center justify-start gap-1 p-1 bg-transparent w-auto mb-8">
                                    <TabsTrigger
                                        value={isOwnProfile ? "my-projects" : "projects"}
                                        className="px-4 py-2 text-sm font-semibold text-gray-500 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        프로젝트
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value={isOwnProfile ? "my-resources" : "resources"}
                                        className="px-4 py-2 text-sm font-semibold text-gray-500 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        자료실
                                    </TabsTrigger>
                                    {isOwnProfile && (
                                        <TabsTrigger
                                            value="bookmarks"
                                            className="px-4 py-2 text-sm font-semibold text-gray-500 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                                        >
                                            북마크
                                        </TabsTrigger>
                                    )}
                                </TabsList>

                                {/* 내 프로젝트 (내 프로필인 경우만) */}
                                {isOwnProfile && (
                                    <TabsContent value="my-projects" className="space-y-6">
                                        {loadingPosts ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <Card key={i} className="animate-pulse bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                                        <div className="aspect-square bg-gray-200"></div>
                                                        <CardContent className="p-6">
                                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : myPosts.filter(post => post.post_type === 'project').length > 0 ? (
                                            <div>
                                                {/* 모든 프로젝트를 작성 순서대로 표시 */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {myPosts
                                                        .filter(post => post.post_type === 'project')
                                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                        .map((post) => (
                                                            <ProfileProjectCard
                                                                key={`${post.post_type}_${post.id}`}
                                                                project={post as unknown as Post}
                                                            />
                                                        ))}
                                                </div>

                                                {/* 더 많은 프로젝트 로딩 */}
                                                {hasMoreProjects && (
                                                    <div className="flex justify-center py-8">
                                                        <Button
                                                            variant="outline"
                                                            onClick={fetchMoreProjects}
                                                            disabled={loadingMoreProjects}
                                                            className="px-8 py-2"
                                                        >
                                                            {loadingMoreProjects ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                                                                    로딩 중...
                                                                </div>
                                                            ) : (
                                                                '더 많은 프로젝트 보기'
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyMedia variant="icon">
                                                        <FileText className="size-6" />
                                                    </EmptyMedia>
                                                    <EmptyTitle>작성한 프로젝트가 없습니다</EmptyTitle>
                                                    <EmptyDescription>이 사용자는 아직 프로젝트를 작성하지 않았습니다.</EmptyDescription>
                                                </EmptyHeader>
                                            </Empty>
                                        )}
                                    </TabsContent>
                                )}

                                {/* 내 자료실 (내 프로필인 경우만) */}
                                {isOwnProfile && (
                                    <TabsContent value="my-resources" className="space-y-6">
                                        {loadingResources ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <Card key={i} className="animate-pulse bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                                        <div className="aspect-square bg-gray-200"></div>
                                                        <CardContent className="p-6">
                                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : myResources.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {myResources
                                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                    .map((resource) => (
                                                        <ResourceCard
                                                            key={`${resource.post_type}_${resource.id}`}
                                                            resource={resource as unknown as ResourcePost}
                                                        />
                                                    ))}
                                            </div>
                                        ) : (
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyMedia variant="icon">
                                                        <FileText className="size-6" />
                                                    </EmptyMedia>
                                                    <EmptyTitle>업로드한 자료가 없습니다</EmptyTitle>
                                                    <EmptyDescription>아직 업로드한 자료가 없습니다.</EmptyDescription>
                                                </EmptyHeader>
                                            </Empty>
                                        )}
                                    </TabsContent>
                                )}

                                {/* 프로젝트 (다른 사용자 프로필) */}
                                <TabsContent value="projects" className="space-y-6">
                                    {loadingPosts ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <Card key={i} className="animate-pulse bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                                    <div className="aspect-square bg-gray-200"></div>
                                                    <CardContent className="p-6">
                                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : otherPosts.filter(post => post.post_type === 'project').length > 0 ? (
                                        <div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {otherPosts
                                                    .filter(post => post.post_type === 'project')
                                                    .map((post) => (
                                                        <ProfileProjectCard key={`${post.post_type}_${post.id}`} project={post as unknown as Post} />
                                                    ))}
                                            </div>

                                            {/* 더 많은 프로젝트 로딩 */}
                                            {hasMoreProjects && (
                                                <div className="flex justify-center py-8">
                                                    <Button
                                                        variant="outline"
                                                        onClick={fetchMoreProjects}
                                                        disabled={loadingMoreProjects}
                                                        className="px-8 py-2"
                                                    >
                                                        {loadingMoreProjects ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                                                                로딩 중...
                                                            </div>
                                                        ) : (
                                                            '더 많은 프로젝트 보기'
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <FileText className="size-6" />
                                                </EmptyMedia>
                                                <EmptyTitle>프로젝트가 없습니다</EmptyTitle>
                                                <EmptyDescription>이 사용자는 아직 프로젝트를 작성하지 않았습니다.</EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    )}
                                </TabsContent>

                                {/* 자료실 (다른 사용자 프로필) */}
                                <TabsContent value="resources" className="space-y-6">
                                    {loadingPosts ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <Card key={i} className="animate-pulse bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                                    <div className="aspect-square bg-gray-200"></div>
                                                    <CardContent className="p-6">
                                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : otherPosts.filter(post => post.post_type === 'resource').length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {otherPosts
                                                .filter(post => post.post_type === 'resource')
                                                .map((resource) => (
                                                    <ResourceCard key={`${resource.post_type}_${resource.id}`} resource={resource as unknown as ResourcePost} />
                                                ))}
                                        </div>
                                    ) : (
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <FileText className="size-6" />
                                                </EmptyMedia>
                                                <EmptyTitle>자료가 없습니다</EmptyTitle>
                                                <EmptyDescription>아직 업로드한 자료가 없습니다.</EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    )}
                                </TabsContent>

                                {/* 북마크 (내 프로필인 경우만) */}
                                {isOwnProfile && (
                                    <TabsContent value="bookmarks" className="space-y-6">
                                        {loadingBookmarks ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <Card key={i} className="animate-pulse bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                                        <div className="aspect-square bg-gray-200"></div>
                                                        <CardContent className="p-6">
                                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : bookmarkedPosts.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {bookmarkedPosts
                                                    .filter(post => post.post_type === 'project' || post.post_type === 'resource')
                                                    .map((post) => {
                                                        if (post.post_type === 'project') {
                                                            return <BookmarkProjectCard key={`${post.post_type}_${post.id}`} project={post as unknown as Post} />;
                                                        } else if (post.post_type === 'resource') {
                                                            return <BookmarkResourceCard key={`${post.post_type}_${post.id}`} resource={post as unknown as ResourcePost} />;
                                                        }
                                                        return null;
                                                    })}
                                            </div>
                                        ) : (
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyMedia variant="icon">
                                                        <Bookmark className="size-6" />
                                                    </EmptyMedia>
                                                    <EmptyTitle>북마크한 게시물이 없습니다</EmptyTitle>
                                                    <EmptyDescription>아직 북마크한 게시물이 없습니다.</EmptyDescription>
                                                </EmptyHeader>
                                            </Empty>
                                        )}
                                    </TabsContent>
                                )}
                            </Tabs>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <User className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-light text-gray-900 mb-4">게시물 비공개한 유저입니다</h3>
                                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                                    이 사용자는 프로필을 비공개로 설정하여 게시물을 볼 수 없습니다.
                                </p>
                            </div>
                        )}
                    </div>
                </div >
            </div >
        </div >
    );
}