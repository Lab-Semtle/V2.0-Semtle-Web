'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfilePostCard from '@/components/profile/ProfilePostCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Bookmark, User, Heart, Plus } from 'lucide-react';

interface Profile {
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
}

interface Post {
    id: number;
    title: string;
    subtitle?: string;
    thumbnail?: string;
    post_type: 'project' | 'resource' | 'activity';
    status: 'published' | 'draft';
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
    project_type?: { name: string };
    resource_type?: { name: string };
    activity_type?: { name: string };
}

export default function UserProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    // params를 unwrap
    const resolvedParams = use(params);

    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [otherPosts, setOtherPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingLikes, setLoadingLikes] = useState(true);
    const [loadingBookmarks, setLoadingBookmarks] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 로딩 중이거나 profile이 없으면 isOwnProfile을 false로 설정
    const isOwnProfile = !loading && profile?.nickname === resolvedParams.nickname;

    // 디버깅 로그
    console.log('🔍 Profile Page Debug:', {
        userNickname: profile?.nickname,
        profileNickname: resolvedParams.nickname,
        isOwnProfile: isOwnProfile,
        user: user,
        profile: profile,
        loading: loading
    });

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
                console.error('프로필 데이터 로드 오류:', error);
                setError('프로필을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [resolvedParams.nickname]);

    // 게시물 로드 (내 프로필인 경우와 다른 사람 프로필인 경우 구분)
    useEffect(() => {
        const fetchPosts = async () => {
            if (!profileData) return;

            try {
                if (isOwnProfile) {
                    // 내 프로필인 경우: 임시저장 포함
                    const response = await fetch(`/api/profile/${profileData.id}/posts?type=all&include_drafts=true`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('🔍 내 프로필 게시물 데이터:', data.posts);
                        setMyPosts(data.posts);
                    }
                } else {
                    // 다른 사람 프로필인 경우: 공개 게시물만
                    const response = await fetch(`/api/profile/${profileData.id}/posts?type=all&include_drafts=false`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('🔍 다른 사람 프로필 게시물 데이터:', data.posts);
                        setOtherPosts(data.posts);
                    }
                }
            } catch (error) {
                console.error('게시물 로드 오류:', error);
            } finally {
                setLoadingPosts(false);
            }
        };

        if (profileData) {
            fetchPosts();
        }
    }, [profileData, isOwnProfile]);

    // 좋아요한 게시물 로드 (내 프로필인 경우만)
    useEffect(() => {
        const fetchLikedPosts = async () => {
            if (!isOwnProfile) return;

            try {
                const response = await fetch('/api/profile/likes?type=all');
                if (response.ok) {
                    const data = await response.json();
                    setLikedPosts(data.posts);
                }
            } catch (error) {
                console.error('좋아요한 게시물 로드 오류:', error);
            } finally {
                setLoadingLikes(false);
            }
        };

        if (isOwnProfile) {
            fetchLikedPosts();
        }
    }, [isOwnProfile]);

    // 북마크한 게시물 로드 (내 프로필인 경우만)
    useEffect(() => {
        const fetchBookmarkedPosts = async () => {
            if (!isOwnProfile) return;

            try {
                const response = await fetch('/api/profile/bookmarks?type=all');
                if (response.ok) {
                    const data = await response.json();
                    setBookmarkedPosts(data.posts);
                }
            } catch (error) {
                console.error('북마크한 게시물 로드 오류:', error);
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
                const response = await fetch(`/api/${postType}s/${postId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setMyPosts(prev => prev.filter(post => !(post.id === postId && post.post_type === postType)));
                    alert('게시물이 삭제되었습니다.');
                } else {
                    alert('삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('게시물 삭제 오류:', error);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
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
            console.error('게시물 공개 오류:', error);
            alert('공개 중 오류가 발생했습니다.');
        }
    };

    if (loading || loadingProfile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="text-center py-12">
                        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">사용자를 찾을 수 없습니다</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={() => router.back()}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            ← 이전 페이지로 돌아가기
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!profileData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 프로필 헤더 */}
                <ProfileHeader
                    profile={profileData}
                    isOwnProfile={isOwnProfile}
                    onEditProfile={handleEditProfile}
                />

                {/* 게시물 탭 */}
                <Tabs defaultValue={isOwnProfile ? "my-projects" : "projects"} className="space-y-6">
                    {isOwnProfile ? (
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="my-projects">내 프로젝트</TabsTrigger>
                            <TabsTrigger value="my-resources">내 자료</TabsTrigger>
                            <TabsTrigger value="liked">좋아요</TabsTrigger>
                            <TabsTrigger value="bookmarked">북마크</TabsTrigger>
                        </TabsList>
                    ) : (
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="projects">프로젝트</TabsTrigger>
                            <TabsTrigger value="resources">자료실</TabsTrigger>
                        </TabsList>
                    )}

                    {/* 내 프로젝트 (내 프로필인 경우만) */}
                    {isOwnProfile && (
                        <TabsContent value="my-projects" className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">내가 작성한 프로젝트</h2>
                                    {myPosts.filter(post => post.post_type === 'project').length > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            총 {myPosts.filter(post => post.post_type === 'project').length}개
                                            {myPosts.filter(post => post.post_type === 'project' && post.status === 'draft').length > 0 && (
                                                <span className="ml-2 text-orange-600">
                                                    (임시저장 {myPosts.filter(post => post.post_type === 'project' && post.status === 'draft').length}개)
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => router.push('/projects/write')}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    프로젝트 작성
                                </Button>
                            </div>

                            {loadingPosts ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Card key={i} className="animate-pulse">
                                            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                                            <CardContent className="p-4">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : myPosts.filter(post => post.post_type === 'project').length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myPosts
                                        .filter(post => post.post_type === 'project')
                                        .map((post) => (
                                            <ProfilePostCard
                                                key={`${post.post_type}_${post.id}`}
                                                post={post}
                                                isOwnPost={true}
                                                onEdit={handleEditPost}
                                                onDelete={handleDeletePost}
                                                onPublish={handlePublishPost}
                                            />
                                        ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">아직 작성한 프로젝트가 없습니다</h3>
                                        <p className="text-gray-500 mb-4">첫 번째 프로젝트를 작성해보세요!</p>
                                        <Button onClick={() => router.push('/projects/write')}>
                                            프로젝트 작성
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    )}

                    {/* 내 자료 (내 프로필인 경우만) */}
                    {isOwnProfile && (
                        <TabsContent value="my-resources" className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">내가 작성한 자료</h2>
                                    {myPosts.filter(post => post.post_type === 'resource').length > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            총 {myPosts.filter(post => post.post_type === 'resource').length}개
                                            {myPosts.filter(post => post.post_type === 'resource' && post.status === 'draft').length > 0 && (
                                                <span className="ml-2 text-orange-600">
                                                    (임시저장 {myPosts.filter(post => post.post_type === 'resource' && post.status === 'draft').length}개)
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => router.push('/resources/write')}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    자료 작성
                                </Button>
                            </div>

                            {loadingPosts ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Card key={i} className="animate-pulse">
                                            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                                            <CardContent className="p-4">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : myPosts.filter(post => post.post_type === 'resource').length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myPosts
                                        .filter(post => post.post_type === 'resource')
                                        .map((post) => (
                                            <ProfilePostCard
                                                key={`${post.post_type}_${post.id}`}
                                                post={post}
                                                isOwnPost={true}
                                                onEdit={handleEditPost}
                                                onDelete={handleDeletePost}
                                                onPublish={handlePublishPost}
                                            />
                                        ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">아직 작성한 자료가 없습니다</h3>
                                        <p className="text-gray-500 mb-4">첫 번째 자료를 작성해보세요!</p>
                                        <Button onClick={() => router.push('/resources/write')}>
                                            자료 작성
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    )}

                    {/* 좋아요한 게시물 (내 프로필인 경우만) */}
                    {isOwnProfile && (
                        <TabsContent value="liked" className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">좋아요한 게시물</h2>

                            {loadingLikes ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Card key={i} className="animate-pulse">
                                            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                                            <CardContent className="p-4">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : likedPosts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {likedPosts.map((post) => (
                                        <ProfilePostCard key={`${post.post_type}_${post.id}`} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">좋아요한 게시물이 없습니다</h3>
                                        <p className="text-gray-500">마음에 드는 게시물에 좋아요를 눌러보세요!</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    )}

                    {/* 북마크한 게시물 (내 프로필인 경우만) */}
                    {isOwnProfile && (
                        <TabsContent value="bookmarked" className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">북마크한 게시물</h2>

                            {loadingBookmarks ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Card key={i} className="animate-pulse">
                                            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                                            <CardContent className="p-4">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : bookmarkedPosts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bookmarkedPosts.map((post) => (
                                        <ProfilePostCard key={`${post.post_type}_${post.id}`} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">북마크한 게시물이 없습니다</h3>
                                        <p className="text-gray-500">마음에 드는 게시물을 북마크해보세요!</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    )}

                    {/* 프로젝트 (다른 사용자 프로필) */}
                    <TabsContent value="projects" className="space-y-6">
                        {loadingPosts ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i} className="animate-pulse">
                                        <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                                        <CardContent className="p-4">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : otherPosts.filter(post => post.post_type === 'project').length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {otherPosts
                                    .filter(post => post.post_type === 'project')
                                    .map((post) => (
                                        <ProfilePostCard key={`${post.post_type}_${post.id}`} post={post} />
                                    ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트가 없습니다</h3>
                                    <p className="text-gray-500">이 사용자는 아직 프로젝트를 작성하지 않았습니다.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* 자료실 (다른 사용자 프로필) */}
                    <TabsContent value="resources" className="space-y-6">
                        {loadingPosts ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i} className="animate-pulse">
                                        <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                                        <CardContent className="p-4">
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
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">자료가 없습니다</h3>
                                    <p className="text-gray-500">이 사용자는 아직 자료를 작성하지 않았습니다.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
