'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Users, Shield, Settings, AlertTriangle, CheckCircle, XCircle,
    FileText, BookOpen, Activity, BarChart3, Database,
    MessageSquare, Heart, Bookmark, TrendingUp, Eye, Mail, Phone, Clock, Edit3, Trash2,
    Link, Plus, ExternalLink, Github, Instagram, Youtube, Facebook, Twitter, Linkedin,
    Twitch, Globe, Calendar, MapPin, ChevronDown, ChevronUp, FolderOpen
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
    totalProjects: number;
    totalResources: number;
    totalActivities: number;
    totalLikes: number;
    totalBookmarks: number;
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

interface Project {
    id: number;
    title: string;
    author_id: string;
    author: {
        nickname: string;
        profile_image?: string;
    };
    status: 'published' | 'draft' | 'private';
    project_status: 'recruiting' | 'active' | 'completed' | 'cancelled';
    is_pinned: boolean;
    is_featured: boolean;
    views: number;
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
}

export default function AdminPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'contact' | 'activities' | 'projects' | 'resources'>('overview');

    // 사용자 관리 상태
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState<'member' | 'admin' | 'super_admin'>('member');

    // 시스템 통계 상태
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [postStats, setPostStats] = useState<PostStats | null>(null);

    // 프로젝트 관리 상태
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectFilter, setProjectFilter] = useState<'all' | 'published' | 'draft' | 'private'>('all');
    const [projectSearch, setProjectSearch] = useState('');
    const [projectPage, setProjectPage] = useState(1);
    const [projectPagination, setProjectPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

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
        setLoading(false);
    }, [user, isAdmin, router]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchUsers(),
                fetchSystemStats(),
                fetchPostStats(),
                fetchProjects()
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : '데이터 로딩 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            console.log('관리자 페이지 - 사용자 목록 조회 시작');
            const response = await fetch('/api/admin/users');
            console.log('관리자 페이지 - 사용자 목록 API 응답:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('관리자 페이지 - 사용자 목록 API 오류:', errorData);
                throw new Error(`사용자 목록을 가져오는데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
            }

            const data = await response.json();
            console.log('관리자 페이지 - 사용자 목록 데이터:', data);
            setUsers(data.users || []);
        } catch (error) {
            console.error('사용자 가져오기 오류:', error);
            // 오류가 발생해도 빈 배열로 설정
            setUsers([]);
        }
    };

    const fetchSystemStats = async () => {
        try {
            console.log('관리자 페이지 - 시스템 통계 조회 시작');
            const response = await fetch('/api/admin/stats');
            console.log('관리자 페이지 - 시스템 통계 API 응답:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('관리자 페이지 - 시스템 통계 API 오류:', errorData);
                throw new Error(`시스템 통계를 가져오는데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
            }

            const data = await response.json();
            console.log('관리자 페이지 - 시스템 통계 데이터:', data);

            // 데이터 유효성 검사
            if (!data || typeof data !== 'object') {
                console.error('관리자 페이지 - 잘못된 데이터 형식:', data);
                throw new Error('서버에서 잘못된 데이터를 반환했습니다.');
            }

            setSystemStats(data);
        } catch (error) {
            console.error('시스템 통계 가져오기 오류:', error);
            // 오류가 발생해도 기본값으로 설정
            setSystemStats({
                totalUsers: 0,
                totalAdmins: 0,
                totalProjects: 0,
                totalResources: 0,
                totalActivities: 0,
                totalLikes: 0,
                totalBookmarks: 0
            });
        }
    };

    const fetchPostStats = async () => {
        try {
            console.log('관리자 페이지 - 게시물 통계 조회 시작');
            const response = await fetch('/api/admin/post-stats');
            console.log('관리자 페이지 - 게시물 통계 API 응답:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('관리자 페이지 - 게시물 통계 API 오류:', errorData);
                throw new Error(`게시물 통계를 가져오는데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
            }

            const data = await response.json();
            console.log('관리자 페이지 - 게시물 통계 데이터:', data);
            setPostStats(data);
        } catch (error) {
            console.error('게시물 통계 가져오기 오류:', error);
        }
    };

    const fetchProjects = async (page: number = projectPage, search: string = projectSearch, status: string = projectFilter) => {
        try {
            setProjectsLoading(true);
            console.log('관리자 페이지 - 프로젝트 조회 시작:', { page, search, status });

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(status !== 'all' && { status })
            });

            const response = await fetch(`/api/admin/projects?${params}`);
            console.log('관리자 페이지 - 프로젝트 API 응답:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('관리자 페이지 - 프로젝트 API 오류:', errorData);
                throw new Error(`프로젝트를 가져오는데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
            }

            const data = await response.json();
            console.log('관리자 페이지 - 프로젝트 데이터:', data);
            setProjects(data.projects || []);
            setProjectPagination(data.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            });
        } catch (error) {
            console.error('프로젝트 가져오기 오류:', error);
            setError(`프로젝트를 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setProjectsLoading(false);
        }
    };

    const handleProjectSearch = (search: string) => {
        setProjectSearch(search);
        setProjectPage(1);
        fetchProjects(1, search, projectFilter);
    };

    const handleProjectFilterChange = (filter: 'all' | 'published' | 'draft' | 'private') => {
        setProjectFilter(filter);
        setProjectPage(1);
        fetchProjects(1, projectSearch, filter);
    };

    const handleProjectPageChange = (page: number) => {
        setProjectPage(page);
        fetchProjects(page, projectSearch, projectFilter);
    };

    const handleTogglePin = async (projectId: number, isPinned: boolean) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_pinned: isPinned })
            });

            if (!response.ok) {
                throw new Error('프로젝트 고정 상태 변경에 실패했습니다.');
            }

            const result = await response.json();

            // 프로젝트 목록 업데이트
            setProjects(prev =>
                prev.map(project =>
                    project.id === projectId
                        ? { ...project, is_pinned: isPinned }
                        : project
                )
            );

            alert(result.message);
        } catch (error) {
            console.error('프로젝트 고정 오류:', error);
            alert('프로젝트 고정 상태 변경에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-28">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
                {/* 헤더 */}
                <div className="mb-10">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                                    아치셈틀 공홈 관리
                                </h1>
                                <p className="text-gray-600 text-lg">시스템 관리 및 모니터링 대시보드</p>
                            </div>
                            <div className="hidden md:flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 모바일 탭 네비게이션 */}
                <div className="mb-8 md:hidden">
                    {/* 작은 화면용 (2행) */}
                    <div className="sm:hidden">
                        <nav className="bg-white p-2 rounded-2xl shadow-lg border border-gray-200">
                            {/* 첫 번째 행 */}
                            <div className="flex space-x-1 mb-1">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-lg transition-all duration-300 ${activeTab === 'overview'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <BarChart3 className="w-3 h-3 mx-auto mb-1" />
                                    개요
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-lg transition-all duration-300 ${activeTab === 'users'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <Users className="w-3 h-3 mx-auto mb-1" />
                                    사용자
                                </button>
                                <button
                                    onClick={() => setActiveTab('contact')}
                                    className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-lg transition-all duration-300 ${activeTab === 'contact'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <Mail className="w-3 h-3 mx-auto mb-1" />
                                    문의
                                </button>
                            </div>
                            {/* 두 번째 행 */}
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setActiveTab('activities')}
                                    className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-lg transition-all duration-300 ${activeTab === 'activities'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <Calendar className="w-3 h-3 mx-auto mb-1" />
                                    활동
                                </button>
                                <button
                                    onClick={() => setActiveTab('projects')}
                                    className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-lg transition-all duration-300 ${activeTab === 'projects'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <FolderOpen className="w-3 h-3 mx-auto mb-1" />
                                    프로젝트
                                </button>
                                <button
                                    onClick={() => setActiveTab('resources')}
                                    className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-lg transition-all duration-300 ${activeTab === 'resources'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <FileText className="w-3 h-3 mx-auto mb-1" />
                                    자료실
                                </button>
                            </div>
                        </nav>
                    </div>

                    {/* 중간 화면용 (1행) */}
                    <div className="hidden sm:block">
                        <nav className="flex space-x-1 bg-white p-1 rounded-2xl shadow-lg border border-gray-200">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-xl transition-all duration-300 ${activeTab === 'overview'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <BarChart3 className="w-3 h-3 mx-auto mb-1" />
                                개요
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-xl transition-all duration-300 ${activeTab === 'users'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <Users className="w-3 h-3 mx-auto mb-1" />
                                사용자
                            </button>
                            <button
                                onClick={() => setActiveTab('contact')}
                                className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-xl transition-all duration-300 ${activeTab === 'contact'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <Mail className="w-3 h-3 mx-auto mb-1" />
                                문의
                            </button>
                            <button
                                onClick={() => setActiveTab('activities')}
                                className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-xl transition-all duration-300 ${activeTab === 'activities'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <Calendar className="w-3 h-3 mx-auto mb-1" />
                                활동
                            </button>
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-xl transition-all duration-300 ${activeTab === 'projects'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <FolderOpen className="w-3 h-3 mx-auto mb-1" />
                                프로젝트
                            </button>
                            <button
                                onClick={() => setActiveTab('resources')}
                                className={`flex-1 py-2 px-2 text-center font-medium text-xs rounded-xl transition-all duration-300 ${activeTab === 'resources'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <FileText className="w-3 h-3 mx-auto mb-1" />
                                자료실
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* 데스크톱 사이드바 */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 px-2">관리 메뉴</h3>
                            <nav className="space-y-3">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center px-4 py-4 text-left font-medium text-sm rounded-xl transition-all duration-300 ${activeTab === 'overview'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${activeTab === 'overview' ? 'bg-white/20' : 'bg-blue-100'}`}>
                                        <BarChart3 className={`w-5 h-5 ${activeTab === 'overview' ? 'text-white' : 'text-blue-600'}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">개요</div>
                                        <div className="text-xs opacity-75">시스템 현황</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`w-full flex items-center px-4 py-4 text-left font-medium text-sm rounded-xl transition-all duration-300 ${activeTab === 'users'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${activeTab === 'users' ? 'bg-white/20' : 'bg-green-100'}`}>
                                        <Users className={`w-5 h-5 ${activeTab === 'users' ? 'text-white' : 'text-green-600'}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">사용자 관리</div>
                                        <div className="text-xs opacity-75">회원 관리</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('contact')}
                                    className={`w-full flex items-center px-4 py-4 text-left font-medium text-sm rounded-xl transition-all duration-300 ${activeTab === 'contact'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${activeTab === 'contact' ? 'bg-white/20' : 'bg-orange-100'}`}>
                                        <Mail className={`w-5 h-5 ${activeTab === 'contact' ? 'text-white' : 'text-orange-600'}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">문의 관리</div>
                                        <div className="text-xs opacity-75">고객 지원</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('activities')}
                                    className={`w-full flex items-center px-4 py-4 text-left font-medium text-sm rounded-xl transition-all duration-300 ${activeTab === 'activities'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${activeTab === 'activities' ? 'bg-white/20' : 'bg-purple-100'}`}>
                                        <Calendar className={`w-5 h-5 ${activeTab === 'activities' ? 'text-white' : 'text-purple-600'}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">활동게시판 관리</div>
                                        <div className="text-xs opacity-75">이벤트 관리</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('projects')}
                                    className={`w-full flex items-center px-4 py-4 text-left font-medium text-sm rounded-xl transition-all duration-300 ${activeTab === 'projects'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${activeTab === 'projects' ? 'bg-white/20' : 'bg-indigo-100'}`}>
                                        <FolderOpen className={`w-5 h-5 ${activeTab === 'projects' ? 'text-white' : 'text-indigo-600'}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">프로젝트 게시판 관리</div>
                                        <div className="text-xs opacity-75">프로젝트 관리</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('resources')}
                                    className={`w-full flex items-center px-4 py-4 text-left font-medium text-sm rounded-xl transition-all duration-300 ${activeTab === 'resources'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${activeTab === 'resources' ? 'bg-white/20' : 'bg-teal-100'}`}>
                                        <FileText className={`w-5 h-5 ${activeTab === 'resources' ? 'text-white' : 'text-teal-600'}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">자료실 게시판 관리</div>
                                        <div className="text-xs opacity-75">자료 관리</div>
                                    </div>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="flex-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    {/* 환영 메시지 */}
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">관리자 대시보드</h2>
                                                <p className="text-blue-100">시스템 현황을 한눈에 확인하세요</p>
                                            </div>
                                            <div className="hidden md:block">
                                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                                    <BarChart3 className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 시스템 통계 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">총 사용자</p>
                                                    <p className="text-3xl font-bold text-gray-900">{systemStats?.totalUsers || 0}</p>
                                                    <p className="text-xs text-gray-500 mt-1">등록된 사용자</p>
                                                </div>
                                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                    <Users className="h-6 w-6 text-blue-600" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">관리자</p>
                                                    <p className="text-3xl font-bold text-gray-900">{systemStats?.totalAdmins || 0}</p>
                                                    <p className="text-xs text-gray-500 mt-1">시스템 관리자</p>
                                                </div>
                                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                    <Shield className="h-6 w-6 text-green-600" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">총 게시물</p>
                                                    <p className="text-3xl font-bold text-gray-900">{(systemStats?.totalProjects || 0) + (systemStats?.totalResources || 0) + (systemStats?.totalActivities || 0)}</p>
                                                    <p className="text-xs text-gray-500 mt-1">전체 콘텐츠</p>
                                                </div>
                                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                    <FileText className="h-6 w-6 text-purple-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 게시물 통계 */}
                                    {postStats && (
                                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold text-gray-900">게시물 통계</h2>
                                                        <p className="text-sm text-gray-600">카테고리별 상세 현황</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <div className="text-center group">
                                                        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                                                            <FolderOpen className="h-8 w-8 text-blue-600" />
                                                        </div>
                                                        <div className="text-3xl font-bold text-blue-600 mb-2">{postStats.projects.total || 0}</div>
                                                        <div className="text-lg font-semibold text-gray-900 mb-2">프로젝트</div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">발행됨</span>
                                                                <span className="font-medium text-green-600">{postStats.projects.published || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">임시저장</span>
                                                                <span className="font-medium text-orange-600">{postStats.projects.drafts || 0}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-center group">
                                                        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                                                            <FileText className="h-8 w-8 text-green-600" />
                                                        </div>
                                                        <div className="text-3xl font-bold text-green-600 mb-2">{postStats.resources.total || 0}</div>
                                                        <div className="text-lg font-semibold text-gray-900 mb-2">자료실</div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">발행됨</span>
                                                                <span className="font-medium text-green-600">{postStats.resources.published || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">임시저장</span>
                                                                <span className="font-medium text-orange-600">{postStats.resources.drafts || 0}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-center group">
                                                        <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                                                            <Calendar className="h-8 w-8 text-purple-600" />
                                                        </div>
                                                        <div className="text-3xl font-bold text-purple-600 mb-2">{postStats.activities.total || 0}</div>
                                                        <div className="text-lg font-semibold text-gray-900 mb-2">활동</div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">발행됨</span>
                                                                <span className="font-medium text-green-600">{postStats.activities.published || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">임시저장</span>
                                                                <span className="font-medium text-orange-600">{postStats.activities.drafts || 0}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="space-y-8">
                                    <div className="bg-white shadow rounded-lg">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h2 className="text-lg font-medium text-gray-900">사용자 관리</h2>
                                        </div>
                                        <div className="p-6">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {users.map((user) => (
                                                            <tr key={user.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="flex-shrink-0 h-10 w-10">
                                                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                    {user.nickname.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <div className="text-sm font-medium text-gray-900">{user.nickname}</div>
                                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                                                                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                        {user.role === 'super_admin' ? '슈퍼 관리자' :
                                                                            user.role === 'admin' ? '관리자' : '일반 사용자'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                                        user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {user.status === 'active' ? '활성' :
                                                                            user.status === 'suspended' ? '정지' : '차단'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {new Date(user.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedUser(user);
                                                                            setNewRole(user.role);
                                                                            setShowRoleModal(true);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                    >
                                                                        역할 변경
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'activities' && (
                                <div className="space-y-8">
                                    <div className="bg-white shadow rounded-lg">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h2 className="text-lg font-medium text-gray-900">활동게시판 관리</h2>
                                        </div>
                                        <div className="p-6">
                                            <div className="text-center py-8 text-gray-500">
                                                활동게시판 관리 기능이 곧 추가될 예정입니다.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'resources' && (
                                <div className="space-y-8">
                                    <div className="bg-white shadow rounded-lg">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h2 className="text-lg font-medium text-gray-900">자료실 게시판 관리</h2>
                                        </div>
                                        <div className="p-6">
                                            <div className="text-center py-8 text-gray-500">
                                                자료실 게시판 관리 기능이 곧 추가될 예정입니다.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="space-y-8">
                                    <div className="bg-white shadow rounded-lg">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h2 className="text-lg font-medium text-gray-900">문의 관리</h2>
                                        </div>
                                        <div className="p-6">
                                            <div className="text-center py-8 text-gray-500">
                                                문의 관리 기능이 곧 추가될 예정입니다.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'projects' && (
                                <div className="space-y-8">
                                    <div className="bg-white shadow rounded-lg">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h2 className="text-lg font-medium text-gray-900">프로젝트 관리</h2>
                                            <p className="text-sm text-gray-600 mt-1">프로젝트를 고정하거나 상태를 관리할 수 있습니다.</p>
                                        </div>
                                        <div className="p-6">
                                            {/* 필터 및 검색 */}
                                            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleProjectFilterChange('all')}
                                                        className={`px-3 py-1 text-sm rounded-md ${projectFilter === 'all'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        전체
                                                    </button>
                                                    <button
                                                        onClick={() => handleProjectFilterChange('published')}
                                                        className={`px-3 py-1 text-sm rounded-md ${projectFilter === 'published'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        발행됨
                                                    </button>
                                                    <button
                                                        onClick={() => handleProjectFilterChange('draft')}
                                                        className={`px-3 py-1 text-sm rounded-md ${projectFilter === 'draft'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        임시저장
                                                    </button>
                                                    <button
                                                        onClick={() => handleProjectFilterChange('private')}
                                                        className={`px-3 py-1 text-sm rounded-md ${projectFilter === 'private'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        비공개
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder="프로젝트 검색..."
                                                        value={projectSearch}
                                                        onChange={(e) => setProjectSearch(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleProjectSearch(projectSearch)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        onClick={() => handleProjectSearch(projectSearch)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        검색
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 프로젝트 목록 */}
                                            {projectsLoading ? (
                                                <div className="text-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                    <p className="mt-2 text-gray-600">프로젝트를 불러오는 중...</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {projects.map((project) => (
                                                        <div key={project.id} className={`border rounded-lg p-4 ${project.is_pinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        {project.is_pinned && (
                                                                            <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">고정</span>
                                                                        )}
                                                                        <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'published' ? 'bg-green-200 text-green-800' :
                                                                            project.status === 'draft' ? 'bg-gray-200 text-gray-800' :
                                                                                'bg-red-200 text-red-800'
                                                                            }`}>
                                                                            {project.status === 'published' ? '발행됨' : project.status === 'draft' ? '임시저장' : '비공개'}
                                                                        </span>
                                                                        <span className={`px-2 py-1 text-xs rounded-full ${project.project_status === 'recruiting' ? 'bg-blue-200 text-blue-800' :
                                                                            project.project_status === 'active' ? 'bg-green-200 text-green-800' :
                                                                                project.project_status === 'completed' ? 'bg-gray-200 text-gray-800' :
                                                                                    'bg-red-200 text-red-800'
                                                                            }`}>
                                                                            {project.project_status === 'recruiting' ? '모집중' :
                                                                                project.project_status === 'active' ? '진행중' :
                                                                                    project.project_status === 'completed' ? '완료' : '취소'}
                                                                        </span>
                                                                    </div>
                                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">{project.title}</h3>
                                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                                        <span>작성자: {project.author.nickname}</span>
                                                                        <span>조회: {project.views || 0}</span>
                                                                        <span>좋아요: {project.likes_count || 0}</span>
                                                                        <span>댓글: {project.comments_count || 0}</span>
                                                                        <span>작성일: {new Date(project.created_at).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center space-x-2 ml-4">
                                                                    <button
                                                                        onClick={() => handleTogglePin(project.id, !project.is_pinned)}
                                                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${project.is_pinned
                                                                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                            }`}
                                                                    >
                                                                        {project.is_pinned ? '고정 해제' : '고정하기'}
                                                                    </button>
                                                                    <a
                                                                        href={`/projects/${project.id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                                                    >
                                                                        보기
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {projects.length === 0 && (
                                                        <div className="text-center py-8 text-gray-500">
                                                            {projectSearch ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 페이지네이션 */}
                                            {projectPagination.totalPages > 1 && (
                                                <div className="mt-6 flex items-center justify-between">
                                                    <div className="text-sm text-gray-700">
                                                        총 {projectPagination.total || 0}개의 프로젝트 중 {((projectPagination.page - 1) * projectPagination.limit) + 1}-{Math.min(projectPagination.page * projectPagination.limit, projectPagination.total || 0)}개 표시
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleProjectPageChange(projectPagination.page - 1)}
                                                            disabled={!projectPagination.hasPrev}
                                                            className={`px-3 py-1 text-sm rounded-md ${projectPagination.hasPrev
                                                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            이전
                                                        </button>

                                                        {/* 페이지 번호들 */}
                                                        {Array.from({ length: Math.min(5, projectPagination.totalPages) }, (_, i) => {
                                                            const startPage = Math.max(1, projectPagination.page - 2);
                                                            const pageNum = startPage + i;
                                                            if (pageNum > projectPagination.totalPages) return null;

                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => handleProjectPageChange(pageNum)}
                                                                    className={`px-3 py-1 text-sm rounded-md ${pageNum === projectPagination.page
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        })}

                                                        <button
                                                            onClick={() => handleProjectPageChange(projectPagination.page + 1)}
                                                            disabled={!projectPagination.hasNext}
                                                            className={`px-3 py-1 text-sm rounded-md ${projectPagination.hasNext
                                                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            다음
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}