'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Users, Shield, Settings, AlertTriangle, CheckCircle, XCircle,
    FileText, BookOpen, Activity, BarChart3, Database,
    MessageSquare, Heart, Bookmark, TrendingUp, Eye
} from 'lucide-react';

interface User {
    id: string;
    student_id: string;
    nickname: string;
    name: string;
    email: string;
    role: 'member' | 'admin' | 'super_admin';
    status: 'active' | 'suspended' | 'banned';
    email_verified: boolean;
    created_at: string;
    last_login?: string;
}

interface SystemStats {
    totalUsers: number;
    totalAdmins: number;
    activeUsers: number;
    suspendedUsers: number;
    totalProjects: number;
    totalResources: number;
    totalActivities: number;
    totalComments: number;
    totalLikes: number;
    totalBookmarks: number;
    totalViews: number;
}

interface PostStats {
    projects: {
        total: number;
        published: number;
        drafts: number;
        recent: number;
    };
    resources: {
        total: number;
        published: number;
        drafts: number;
        recent: number;
    };
    activities: {
        total: number;
        published: number;
        drafts: number;
        recent: number;
    };
}

export default function AdminDashboard() {
    const { user, profile, isAdmin } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState<'member' | 'admin' | 'super_admin'>('member');

    // 새로운 상태들
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [postStats, setPostStats] = useState<PostStats | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts' | 'settings'>('overview');

    // 관리자 권한 확인
    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        if (!isAdmin()) {
            router.push('/');
            return;
        }

        fetchAllData();
    }, [user, isAdmin, router]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchUsers(),
                fetchSystemStats(),
                fetchPostStats()
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : '데이터 로딩 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            // 클라이언트에서 Supabase 세션 가져오기
            const { supabase } = await import('@/lib/supabase/client');
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('인증이 필요합니다.');
            }

            const response = await fetch('/api/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '사용자 목록을 불러올 수 없습니다.');
            }

            setUsers(data.users || []);
        } catch (err) {
            console.error('사용자 데이터 로딩 오류:', err);
        }
    };

    const fetchSystemStats = async () => {
        try {
            const response = await fetch('/api/admin/stats', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();

            if (response.ok) {
                setSystemStats(data.stats);
            }
        } catch (err) {
            console.error('시스템 통계 로딩 오류:', err);
        }
    };

    const fetchPostStats = async () => {
        try {
            const response = await fetch('/api/admin/posts/stats', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();

            if (response.ok) {
                setPostStats(data.stats);
            }
        } catch (err) {
            console.error('게시물 통계 로딩 오류:', err);
        }
    };

    const handleRoleChange = async () => {
        if (!selectedUser) return;

        try {
            const response = await fetch('/api/admin/users/role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    newRole: newRole
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '역할 변경에 실패했습니다.');
            }

            // 사용자 목록 새로고침
            await fetchUsers();
            setShowRoleModal(false);
            setSelectedUser(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : '역할 변경 중 오류가 발생했습니다.');
        }
    };

    const handleSuspendUser = async (userId: string, action: 'suspend' | 'unsuspend' | 'ban') => {
        try {
            const response = await fetch('/api/admin/users/suspend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    action,
                    reason: action === 'suspend' ? '관리자에 의한 정지' :
                        action === 'ban' ? '관리자에 의한 영구 정지' : null
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '사용자 상태 변경에 실패했습니다.');
            }

            // 사용자 목록 새로고침
            await fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : '사용자 상태 변경 중 오류가 발생했습니다.');
        }
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            member: 'bg-gray-100 text-gray-800',
            admin: 'bg-blue-100 text-blue-800',
            super_admin: 'bg-purple-100 text-purple-800'
        };
        const labels = {
            member: '일반 회원',
            admin: '관리자',
            super_admin: '최고 관리자'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
                {labels[role as keyof typeof labels]}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            suspended: 'bg-yellow-100 text-yellow-800',
            banned: 'bg-red-100 text-red-800'
        };
        const labels = {
            active: '활성',
            suspended: '정지',
            banned: '영구정지'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">아치셈틀 공홈관리</h1>
                    <p className="text-gray-600">시스템 관리 및 모니터링</p>
                </div>

                {/* 모바일 탭 네비게이션 */}
                <div className="mb-8 md:hidden">
                    <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 py-2 px-3 text-center font-medium text-xs rounded-md transition-colors ${activeTab === 'overview'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4 mx-auto mb-1" />
                            개요
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 py-2 px-3 text-center font-medium text-xs rounded-md transition-colors ${activeTab === 'users'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Users className="w-4 h-4 mx-auto mb-1" />
                            사용자
                        </button>
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex-1 py-2 px-3 text-center font-medium text-xs rounded-md transition-colors ${activeTab === 'posts'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FileText className="w-4 h-4 mx-auto mb-1" />
                            게시판
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 py-2 px-3 text-center font-medium text-xs rounded-md transition-colors ${activeTab === 'settings'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Settings className="w-4 h-4 mx-auto mb-1" />
                            설정
                        </button>
                    </nav>
                </div>

                {/* 데스크톱 사이드바 레이아웃 */}
                <div className="hidden md:flex gap-8">
                    {/* 좌측 사이드바 */}
                    <div className="w-64 flex-shrink-0">
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center px-4 py-3 text-left font-medium text-sm rounded-lg transition-colors ${activeTab === 'overview'
                                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <BarChart3 className="w-5 h-5 mr-3" />
                                개요
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`w-full flex items-center px-4 py-3 text-left font-medium text-sm rounded-lg transition-colors ${activeTab === 'users'
                                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <Users className="w-5 h-5 mr-3" />
                                사용자 관리
                            </button>
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`w-full flex items-center px-4 py-3 text-left font-medium text-sm rounded-lg transition-colors ${activeTab === 'posts'
                                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <FileText className="w-5 h-5 mr-3" />
                                게시판 관리
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center px-4 py-3 text-left font-medium text-sm rounded-lg transition-colors ${activeTab === 'settings'
                                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <Settings className="w-5 h-5 mr-3" />
                                시스템 설정
                            </button>
                        </nav>
                    </div>

                    {/* 우측 콘텐츠 영역 */}
                    <div className="flex-1 min-w-0">

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex">
                                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                                    <p className="text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* 탭 콘텐츠 */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* 시스템 통계 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <Users className="h-8 w-8 text-blue-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 사용자</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.totalUsers || users.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <Shield className="h-8 w-8 text-green-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">관리자</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.totalAdmins || users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.activeUsers || users.filter(u => u.status === 'active').length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <AlertTriangle className="h-8 w-8 text-red-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">정지된 사용자</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.suspendedUsers || users.filter(u => u.status === 'suspended' || u.status === 'banned').length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 게시물 통계 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <FileText className="h-8 w-8 text-purple-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.totalProjects || postStats?.projects.total || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <BookOpen className="h-8 w-8 text-indigo-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 자료</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.totalResources || postStats?.resources.total || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <Activity className="h-8 w-8 text-orange-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 활동</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.totalActivities || postStats?.activities.total || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <Eye className="h-8 w-8 text-cyan-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 조회수</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.totalViews || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 상호작용 통계 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <Heart className="h-8 w-8 text-red-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 좋아요</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.totalLikes || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <MessageSquare className="h-8 w-8 text-blue-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 댓글</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.totalComments || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <Bookmark className="h-8 w-8 text-green-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 북마크</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStats?.totalBookmarks || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-8">
                                {/* 사용자 목록 */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-lg font-medium text-gray-900">사용자 목록</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        사용자
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        역할
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        상태
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        이메일 인증
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        가입일
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        액션
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {user.name} ({user.nickname})
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {user.email}
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    학번: {user.student_id}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getRoleBadge(user.role)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(user.status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {user.email_verified ? (
                                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-500" />
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(user.created_at).toLocaleDateString('ko-KR')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setNewRole(user.role);
                                                                        setShowRoleModal(true);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    {user.role === 'member' ? '관리자 승격' : '역할 변경'}
                                                                </button>
                                                                {user.status === 'active' ? (
                                                                    <button
                                                                        onClick={() => handleSuspendUser(user.id, 'suspend')}
                                                                        className="text-yellow-600 hover:text-yellow-900"
                                                                    >
                                                                        정지
                                                                    </button>
                                                                ) : user.status === 'suspended' ? (
                                                                    <button
                                                                        onClick={() => handleSuspendUser(user.id, 'unsuspend')}
                                                                        className="text-green-600 hover:text-green-900"
                                                                    >
                                                                        해제
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-400">영구정지</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'posts' && (
                            <div className="space-y-8">
                                {/* 게시판 관리 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">프로젝트 게시판</h3>
                                            <FileText className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">총 게시물:</span>
                                                <span className="text-sm font-medium">{postStats?.projects.total || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">공개:</span>
                                                <span className="text-sm font-medium text-green-600">{postStats?.projects.published || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">임시저장:</span>
                                                <span className="text-sm font-medium text-orange-600">{postStats?.projects.drafts || 0}</span>
                                            </div>
                                        </div>
                                        <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                                            프로젝트 관리
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">자료실 게시판</h3>
                                            <BookOpen className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">총 게시물:</span>
                                                <span className="text-sm font-medium">{postStats?.resources.total || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">공개:</span>
                                                <span className="text-sm font-medium text-green-600">{postStats?.resources.published || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">임시저장:</span>
                                                <span className="text-sm font-medium text-orange-600">{postStats?.resources.drafts || 0}</span>
                                            </div>
                                        </div>
                                        <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                                            자료실 관리
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">활동 게시판</h3>
                                            <Activity className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">총 게시물:</span>
                                                <span className="text-sm font-medium">{postStats?.activities.total || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">공개:</span>
                                                <span className="text-sm font-medium text-green-600">{postStats?.activities.published || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">임시저장:</span>
                                                <span className="text-sm font-medium text-orange-600">{postStats?.activities.drafts || 0}</span>
                                            </div>
                                        </div>
                                        <button className="mt-4 w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
                                            활동 관리
                                        </button>
                                    </div>
                                </div>

                                {/* 카테고리 관리 */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-lg font-medium text-gray-900">카테고리 관리</h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="text-center">
                                                <FileText className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                                                <h3 className="font-medium text-gray-900">프로젝트 카테고리</h3>
                                                <p className="text-sm text-gray-600 mt-1">프로젝트 분류 관리</p>
                                                <button className="mt-3 bg-purple-100 text-purple-700 py-2 px-4 rounded-md hover:bg-purple-200 transition-colors">
                                                    관리하기
                                                </button>
                                            </div>
                                            <div className="text-center">
                                                <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
                                                <h3 className="font-medium text-gray-900">자료실 카테고리</h3>
                                                <p className="text-sm text-gray-600 mt-1">자료 분류 관리</p>
                                                <button className="mt-3 bg-indigo-100 text-indigo-700 py-2 px-4 rounded-md hover:bg-indigo-200 transition-colors">
                                                    관리하기
                                                </button>
                                            </div>
                                            <div className="text-center">
                                                <Activity className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                                                <h3 className="font-medium text-gray-900">활동 카테고리</h3>
                                                <p className="text-sm text-gray-600 mt-1">활동 분류 관리</p>
                                                <button className="mt-3 bg-orange-100 text-orange-700 py-2 px-4 rounded-md hover:bg-orange-200 transition-colors">
                                                    관리하기
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-8">
                                {/* 시스템 설정 */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-lg font-medium text-gray-900">시스템 설정</h2>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">사이트 유지보수 모드</h3>
                                                <p className="text-sm text-gray-600">사이트를 유지보수 모드로 전환합니다.</p>
                                            </div>
                                            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                                                설정
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">이메일 알림 설정</h3>
                                                <p className="text-sm text-gray-600">시스템 이메일 알림을 관리합니다.</p>
                                            </div>
                                            <button className="bg-blue-100 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-200 transition-colors">
                                                설정
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">데이터베이스 백업</h3>
                                                <p className="text-sm text-gray-600">데이터베이스를 백업합니다.</p>
                                            </div>
                                            <button className="bg-green-100 text-green-700 py-2 px-4 rounded-md hover:bg-green-200 transition-colors">
                                                백업
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 로그 관리 */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-lg font-medium text-gray-900">시스템 로그</h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-center py-12">
                                            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">로그 관리</h3>
                                            <p className="text-gray-600 mb-4">시스템 로그를 확인하고 관리할 수 있습니다.</p>
                                            <button className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                                                로그 보기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* 역할 변경 모달 */}
                {showRoleModal && selectedUser && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {selectedUser.role === 'member' ? '관리자 승격' : '사용자 역할 변경'}
                                </h3>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        <strong>{selectedUser.name}</strong> ({selectedUser.email})
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        현재 역할: {getRoleBadge(selectedUser.role)}
                                    </p>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        새로운 역할
                                    </label>
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value as 'member' | 'admin' | 'super_admin')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="member">일반 회원</option>
                                        <option value="admin">관리자</option>
                                        <option value="super_admin">최고 관리자</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowRoleModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleRoleChange}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                    >
                                        변경
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
