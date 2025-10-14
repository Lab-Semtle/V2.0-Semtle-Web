'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfilePostCard from '@/components/profile/ProfilePostCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Bookmark, User, Plus } from 'lucide-react';

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

interface Post {
    id: number;
    title: string;
    subtitle?: string;
    thumbnail?: string;
    post_type: 'project' | 'resource' | 'activity';
    status: 'published' | 'draft' | 'private';
    views: number;
    likes_count: number;
    comments_count: number;
    bookmarks_count: number;
    created_at: string;
    published_at?: string;
    author_id: string;
    category?: {
        name: string;
        color?: string;
    };
    project_type?: { name: string };
    resource_type?: { name: string };
    activity_type?: { name: string };
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
}

export default function UserProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    // params를 unwrap
    const resolvedParams = use(params);

    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [myResources, setMyResources] = useState<Post[]>([]);
    const [myActivities, setMyActivities] = useState<Post[]>([]);
    const [otherPosts, setOtherPosts] = useState<Post[]>([]);
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingResources, setLoadingResources] = useState(true);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [loadingBookmarks, setLoadingBookmarks] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowingLoading, setIsFollowingLoading] = useState(false);

    // 무한 스크롤을 위한 상태
    const [projectPage, setProjectPage] = useState(1);
    const [hasMoreProjects, setHasMoreProjects] = useState(true);
    const [loadingMoreProjects, setLoadingMoreProjects] = useState(false);

    // 로딩 중이거나 profile이 없으면 isOwnProfile을 false로 설정
    const isOwnProfile = !loading && profile?.nickname === resolvedParams.nickname;

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
                } catch (error) {
                    console.error('팔로우 상태 확인 오류:', error);
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
                console.error('팔로우 응답:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('팔로우 오류:', error);
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
            } catch (error) {
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
        } catch (error) {
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
                    console.log('프로필 페이지 - 게시물 로딩 시작:', {
                        userId: profileData.id,
                        urls: [
                            `/api/profile/${profileData.id}/posts?type=project&page=1&limit=9&include_drafts=true`,
                            `/api/profile/${profileData.id}/posts?type=resource&page=1&limit=9&include_drafts=true`,
                            `/api/profile/${profileData.id}/posts?type=activity&page=1&limit=9&include_drafts=true`
                        ]
                    });

                    const [projectsResponse, resourcesResponse, activitiesResponse] = await Promise.all([
                        fetch(`/api/profile/${profileData.id}/posts?type=project&page=1&limit=9&include_drafts=true`),
                        fetch(`/api/profile/${profileData.id}/posts?type=resource&page=1&limit=9&include_drafts=true`),
                        fetch(`/api/profile/${profileData.id}/posts?type=activity&page=1&limit=9&include_drafts=true`)
                    ]);

                    if (projectsResponse.ok) {
                        const data = await projectsResponse.json();
                        setMyPosts(data.posts);
                        setProjectPage(1);
                        setHasMoreProjects(data.posts.length === 9);
                    }

                    if (resourcesResponse.ok) {
                        const data = await resourcesResponse.json();
                        console.log('프로필 페이지 - 자료실 로딩 결과:', {
                            status: resourcesResponse.status,
                            postsCount: data.posts?.length || 0,
                            posts: data.posts?.map((p: any) => ({ id: p.id, title: p.title, status: p.status })) || []
                        });
                        setMyResources(data.posts || []);
                    } else {
                        console.error('프로필 페이지 - 자료실 로딩 실패:', resourcesResponse.status, resourcesResponse.statusText);
                    }

                    if (activitiesResponse.ok) {
                        const data = await activitiesResponse.json();
                        setMyActivities(data.posts);
                    }
                } else {
                    // 다른 사람 프로필인 경우: 공개 게시물만 (페이지네이션 적용)
                    const response = await fetch(`/api/profile/${profileData.id}/posts?type=project&page=1&limit=9&include_drafts=false`);
                    if (response.ok) {
                        const data = await response.json();
                        setOtherPosts(data.posts);
                        setProjectPage(1);
                        setHasMoreProjects(data.posts.length === 9);
                    }
                }
            } catch (error) {
                console.error('게시물 로딩 오류:', error);
            } finally {
                setLoadingPosts(false);
                setLoadingResources(false);
                setLoadingActivities(false);
            }
        };

        if (profileData) {
            fetchPosts();
        }
    }, [profileData, isOwnProfile]);


    // 북마크한 게시물 로드 (내 프로필인 경우만)
    useEffect(() => {
        const fetchBookmarkedPosts = async () => {
            if (!isOwnProfile) return;

            console.log('프로필 페이지 - 북마크 로딩 시작');
            try {
                const response = await fetch('/api/profile/bookmarks?type=all', {
                    credentials: 'include'
                });
                console.log('프로필 페이지 - 북마크 API 응답 상태:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('프로필 페이지 - 북마크 데이터:', {
                        totalPosts: data.posts?.length || 0,
                        postsByType: {
                            projects: data.posts?.filter((p: any) => p.post_type === 'project').length || 0,
                            resources: data.posts?.filter((p: any) => p.post_type === 'resource').length || 0,
                            activities: data.posts?.filter((p: any) => p.post_type === 'activity').length || 0
                        },
                        posts: data.posts?.map((p: any) => ({ id: p.id, title: p.title, post_type: p.post_type })) || []
                    });
                    setBookmarkedPosts(data.posts || []);
                } else {
                    console.error('프로필 페이지 - 북마크 API 오류:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('프로필 페이지 - 북마크 로딩 오류:', error);
            } finally {
                setLoadingBookmarks(false);
            }
        };

        if (isOwnProfile) {
            fetchBookmarkedPosts();
        }
    }, [isOwnProfile]);

    const handleEditProfile = () => {
        router.push('/settings');
    };

    const handleEditPost = (postId: number, postType: string) => {
        router.push(`/${postType}s/edit/${postId}`);
    };

    const handleDeletePost = async (postId: number, postType: string) => {
        if (confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`/api/${postType}s/${postId}?userId=${user?.id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setMyPosts(prev => prev.filter(post => !(post.id === postId && post.post_type === postType)));
                    alert('게시물이 삭제되었습니다.');
                } else {
                    const errorData = await response.json();
                    alert(`삭제에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
                }
            } catch (error) {
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleStatusChange = (postId: number, postType: string, newStatus: string) => {
        // 게시물 상태 즉시 업데이트 (스크롤 위치 유지)
        setMyPosts(prev => prev.map(post =>
            post.id === postId ? { ...post, status: newStatus as 'published' | 'draft' | 'private' } : post
        ));
    };

    const handlePublishPost = async (postId: number, postType: string) => {
        try {
            const response = await fetch(`/api/${postType}s/${postId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'published' })
            });

            if (response.ok) {
                setMyPosts(prev => prev.map(post =>
                    post.id === postId && post.post_type === postType
                        ? { ...post, status: 'published' as const, published_at: new Date().toISOString() }
                        : post
                ));
                alert('게시물이 공개되었습니다.');
            } else {
                alert('공개에 실패했습니다.');
            }
        } catch (error) {
            alert('공개 중 오류가 발생했습니다.');
        }
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
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
                {/* 프로필 헤더 */}
                <ProfileHeader
                    profile={profileData}
                    isOwnProfile={isOwnProfile}
                    onEditProfile={handleEditProfile}
                    isFollowing={isFollowing}
                    onFollow={handleFollow}
                    isFollowingLoading={isFollowingLoading}
                />

                {/* 게시물 탭 */}
                {isProfilePublic ? (
                    <Tabs defaultValue={isOwnProfile ? "my-projects" : "projects"} className="space-y-8">
                        {isOwnProfile ? (
                            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto border-b border-gray-200">
                                <TabsTrigger value="my-projects" className="bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none relative">내 프로젝트</TabsTrigger>
                                <TabsTrigger value="my-resources" className="bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none relative">내 자료실</TabsTrigger>
                                <TabsTrigger value="bookmarked" className="bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none relative">북마크</TabsTrigger>
                            </TabsList>
                        ) : (
                            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto border-b border-gray-200">
                                <TabsTrigger value="projects" className="bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none relative">프로젝트</TabsTrigger>
                                <TabsTrigger value="resources" className="bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none relative">자료실</TabsTrigger>
                            </TabsList>
                        )}

                        {/* 내 프로젝트 (내 프로필인 경우만) */}
                        {isOwnProfile && (
                            <TabsContent value="my-projects" className="space-y-6">
                                <div className="flex justify-end">
                                    <Button variant="outline" onClick={() => router.push('/projects/write')} className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700">
                                        <Plus className="w-4 h-4 mr-1" />
                                        새 프로젝트 추가
                                    </Button>
                                </div>

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
                                                    <ProfilePostCard
                                                        key={`${post.post_type}_${post.id}`}
                                                        post={post}
                                                        isOwnPost={true}
                                                        onEdit={handleEditPost}
                                                        onDelete={handleDeletePost}
                                                        onPublish={handlePublishPost}
                                                        onStatusChange={handleStatusChange}
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
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <FileText className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">아직 작성한 프로젝트가 없습니다</h3>
                                        <p className="text-gray-500 mb-6">첫 번째 프로젝트를 작성해보세요!</p>
                                        <Button onClick={() => router.push('/projects/write')} className="bg-blue-600 hover:bg-blue-700 text-white">
                                            새 프로젝트 추가
                                        </Button>

                                    </div>
                                )}
                            </TabsContent>
                        )}

                        {/* 내 자료실 (내 프로필인 경우만) */}
                        {isOwnProfile && (
                            <TabsContent value="my-resources" className="space-y-6">
                                <div className="flex justify-end">
                                    <Button variant="outline" onClick={() => router.push('/resources/write')} className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700">
                                        <Plus className="w-4 h-4 mr-1" />
                                        새 자료 추가
                                    </Button>
                                </div>

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
                                        {console.log('프로필 페이지 - 자료실 게시물 렌더링:', {
                                            totalResources: myResources.length,
                                            resources: myResources.map(r => ({ id: r.id, title: r.title, status: r.status }))
                                        })}
                                        {myResources
                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                            .map((post) => (
                                                <ProfilePostCard
                                                    key={`${post.post_type}_${post.id}`}
                                                    post={post}
                                                    isOwnPost={true}
                                                    onEdit={handleEditPost}
                                                    onDelete={handleDeletePost}
                                                    onPublish={handlePublishPost}
                                                    onStatusChange={handleStatusChange}
                                                />
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Bookmark className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">아직 업로드한 자료가 없습니다</h3>
                                        <p className="text-gray-500 mb-6">첫 번째 자료를 업로드해보세요!</p>
                                        <Button onClick={() => router.push('/resources/write')} className="bg-blue-600 hover:bg-blue-700 text-white">
                                            자료 업로드
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        )}


                        {/* 북마크한 게시물 (내 프로필인 경우만) */}
                        {isOwnProfile && (
                            <TabsContent value="bookmarked" className="space-y-6">

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
                                        {console.log('프로필 페이지 - 북마크 게시물 렌더링:', {
                                            totalPosts: bookmarkedPosts.length,
                                            postsByType: {
                                                projects: bookmarkedPosts.filter(p => p.post_type === 'project').length,
                                                resources: bookmarkedPosts.filter(p => p.post_type === 'resource').length,
                                                activities: bookmarkedPosts.filter(p => p.post_type === 'activity').length
                                            },
                                            posts: bookmarkedPosts.map(p => ({ id: p.id, title: p.title, post_type: p.post_type }))
                                        })}
                                        {bookmarkedPosts.map((post) => (
                                            <ProfilePostCard key={`${post.post_type}_${post.id}`} post={post} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Bookmark className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">북마크한 게시물이 없습니다</h3>
                                        <p className="text-gray-500">마음에 드는 게시물을 북마크해보세요!</p>
                                    </div>
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
                                                <ProfilePostCard key={`${post.post_type}_${post.id}`} post={post} />
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
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FileText className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">프로젝트가 없습니다</h3>
                                    <p className="text-gray-500">이 사용자는 아직 프로젝트를 작성하지 않았습니다.</p>
                                </div>
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
                                        .map((post) => (
                                            <ProfilePostCard key={`${post.post_type}_${post.id}`} post={post} />
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Bookmark className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">자료가 없습니다</h3>
                                    <p className="text-gray-500">이 사용자는 업로드한 자료가 없습니다.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    /* 프로필 비공개 메시지 */
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
        </div>
    );
}