'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Users, Shield, FileText, Activity, BarChart3, Mail, Calendar, FolderOpen, X
} from 'lucide-react';
import ContactManagement from '@/components/admin/ContactManagement';

interface User {
    id: string;
    student_id: string;
    nickname: string;
    name: string;
    email: string;
    profile_image?: string;
    birth_date?: string;
    major?: string;
    grade?: string;
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

interface Resource {
    id: number;
    title: string;
    author_id: string;
    author: {
        nickname: string;
        profile_image?: string;
    };
    status: 'published' | 'draft' | 'private';
    is_pinned: boolean;
    is_featured: boolean;
    is_verified: boolean;
    views: number;
    likes_count: number;
    comments_count: number;
    downloads_count: number;
    subject?: string;
    professor?: string;
    year?: number;
    semester?: string;
    created_at: string;
    updated_at: string;
}

interface Activity {
    id: number;
    title: string;
    subtitle?: string;
    author_id: string;
    author: {
        nickname: string;
        profile_image?: string;
    };
    status: 'published' | 'draft' | 'private';
    is_pinned: boolean;
    is_featured: boolean;
    views: number;
    likes_count: number;
    comments_count: number;
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    current_participants: number;
    created_at: string;
    updated_at: string;
}

interface Participant {
    id: string;
    user_id: string;
    status: string;
    joined_at: string;
    notes?: string;
    user_profiles?: {
        id: string;
        nickname: string;
        name: string;
        profile_image?: string;
        student_id?: string;
        major?: string;
        grade?: string;
    };
}

export default function AdminPage() {
    const { user, profile, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'contact' | 'activities' | 'projects' | 'resources'>('overview');

    // 사용자 관리 상태
    const [users, setUsers] = useState<User[]>([]);
    const [representativeAdmin, setRepresentativeAdmin] = useState<{
        id: string;
        nickname: string;
        email: string;
    } | null>(null);
    const [isUpdatingRepresentative, setIsUpdatingRepresentative] = useState(false);

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

    // 자료실 관리 상태
    const [resources, setResources] = useState<Resource[]>([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);
    const [resourceFilter, setResourceFilter] = useState<'all' | 'published' | 'draft' | 'private'>('all');
    const [resourceSearch, setResourceSearch] = useState('');
    const [resourcePage, setResourcePage] = useState(1);
    const [resourcePagination, setResourcePagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

    // 활동 관리 상태
    const [activities, setActivities] = useState<Activity[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [activityFilter, setActivityFilter] = useState<'all' | 'published' | 'draft' | 'private'>('all');
    const [activitySearch, setActivitySearch] = useState('');
    const [activityPage, setActivityPage] = useState(1);
    const [activityPagination, setActivityPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

    // 참가자 관리 상태
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [participantsLoading, setParticipantsLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/users');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`사용자 목록을 가져오는데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
            }

            const data = await response.json();
            setUsers(data.users || []);
        } catch {
            // 오류가 발생해도 빈 배열로 설정
            setUsers([]);
        }
    }, []);

    const fetchRepresentativeAdmin = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/representative');

            if (response.ok) {
                const data = await response.json();
                setRepresentativeAdmin(data.representative);
            }
        } catch {
            // 오류가 발생해도 null로 설정
            setRepresentativeAdmin(null);
        }
    }, []);

    const fetchSystemStats = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/stats');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`시스템 통계를 가져오는데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
            }

            const data = await response.json();

            // 데이터 유효성 검사
            if (!data || typeof data !== 'object') {
                throw new Error('서버에서 잘못된 데이터를 반환했습니다.');
            }

            setSystemStats(data);
        } catch {
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
    }, []);

    const fetchPostStats = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/post-stats');

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(`게시물 통계를 가져오는데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
            }

            const data = await response.json();
            setPostStats(data);
        } catch {
            // 게시물 통계 가져오기 오류 시 무시
        }
    }, []);

    const fetchProjects = useCallback(async (page: number = projectPage, search: string = projectSearch, status: string = projectFilter) => {
        try {
            setProjectsLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(status !== 'all' && { status })
            });

            const response = await fetch(`/api/admin/projects?${params}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`프로젝트를 가져오는데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
            }

            const data = await response.json();
            setProjects(data.projects || []);
            setProjectPagination(data.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            });
        } catch {
            // 프로젝트 가져오기 오류 시 무시
        } finally {
            setProjectsLoading(false);
        }
    }, [projectPage, projectSearch, projectFilter]);

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchUsers(),
                fetchRepresentativeAdmin(),
                fetchSystemStats(),
                fetchPostStats(),
                fetchProjects()
            ]);
        } catch {
            // 데이터 로딩 오류 시 무시
        } finally {
            setLoading(false);
        }
    }, [fetchUsers, fetchRepresentativeAdmin, fetchSystemStats, fetchPostStats, fetchProjects]);

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
    }, [user, isAdmin, router, fetchAllData]);

    const fetchActivities = useCallback(async (page: number = activityPage, search: string = activitySearch, status: string = activityFilter) => {
        try {
            setActivitiesLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(status !== 'all' && { status })
            });

            const response = await fetch(`/api/admin/activities?${params}`);

            if (!response.ok) {
                throw new Error('활동을 가져오는데 실패했습니다.');
            }

            const data = await response.json();
            setActivities(data.activities || []);
            setActivityPagination(data.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            });
        } catch {
            // 활동 가져오기 오류 시 무시
        } finally {
            setActivitiesLoading(false);
        }
    }, [activityPage, activitySearch, activityFilter]);

    // 활동 탭 활성화 시 데이터 로드
    useEffect(() => {
        if (activeTab === 'activities' && activities.length === 0) {
            fetchActivities();
        }
    }, [activeTab, activities.length, fetchActivities]);

    const fetchResources = useCallback(async (page: number = resourcePage, search: string = resourceSearch, status: string = resourceFilter) => {
        try {
            setResourcesLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(status !== 'all' && { status })
            });

            const response = await fetch(`/api/admin/resources?${params}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`자료실을 가져오는데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
            }

            const data = await response.json();
            setResources(data.resources || []);
            setResourcePagination(data.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            });
        } catch {
            // 자료실 가져오기 오류 시 무시
        } finally {
            setResourcesLoading(false);
        }
    }, [resourcePage, resourceSearch, resourceFilter]);

    // 자료실 탭 활성화 시 데이터 로드
    useEffect(() => {
        if (activeTab === 'resources' && resources.length === 0) {
            fetchResources();
        }
    }, [activeTab, resources.length, fetchResources]);

    // 프로젝트 탭 활성화 시 데이터 로드
    useEffect(() => {
        if (activeTab === 'projects' && projects.length === 0) {
            fetchProjects();
        }
    }, [activeTab, projects.length, fetchProjects]);


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
        } catch {
            alert('프로젝트 고정 상태 변경에 실패했습니다.');
        }
    };

    const handleStatusChange = async (projectId: number, status: 'published' | 'private') => {
        try {
            if (!confirm(`프로젝트를 ${status === 'private' ? '비공개' : '공개'} 상태로 변경하시겠습니까?`)) {
                return;
            }

            const response = await fetch(`/api/projects/${projectId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '프로젝트 상태 변경에 실패했습니다.');
            }

            // 프로젝트 목록 업데이트
            setProjects(prev =>
                prev.map(project =>
                    project.id === projectId
                        ? { ...project, status }
                        : project
                )
            );

            alert(result.message);
        } catch {
            alert('프로젝트 상태 변경에 실패했습니다.');
        }
    };

    const handleUserRoleChange = async (userId: string, role: 'member' | 'admin') => {
        try {
            if (!confirm(`사용자 권한을 ${role === 'admin' ? '관리자' : '일반 사용자'}로 변경하시겠습니까?`)) {
                return;
            }

            const response = await fetch(`/api/users/${userId}/role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '사용자 권한 변경에 실패했습니다.');
            }

            // 사용자 목록 업데이트
            setUsers(prev =>
                prev.map(user =>
                    user.id === userId
                        ? { ...user, role }
                        : user
                )
            );

            alert(result.message);
        } catch {
            alert('사용자 권한 변경에 실패했습니다.');
        }
    };

    const handleSuperAdminToggle = async (userId: string, action: 'grant' | 'revoke') => {
        try {
            const actionText = action === 'grant' ? '대표 관리자 권한을 부여' : '대표 관리자 권한을 해제';
            if (!confirm(`정말로 ${actionText}하시겠습니까?`)) {
                return;
            }

            const response = await fetch(`/api/users/${userId}/super-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '대표 관리자 권한 변경에 실패했습니다.');
            }

            // 사용자 목록 업데이트
            setUsers(prev =>
                prev.map(user =>
                    user.id === userId
                        ? { ...user, role: result.newRole }
                        : user
                )
            );

            alert(result.message);
        } catch {
            alert('대표 관리자 권한 변경에 실패했습니다.');
        }
    };

    const handleRepresentativeAdminSet = async (userId: string) => {
        try {
            console.log('=== handleRepresentativeAdminSet 시작 ===');
            console.log('선택된 userId:', userId);

            // 관리자 권한 체크
            if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
                alert('관리자 권한이 필요합니다.');
                return;
            }

            let message = '';
            if (userId === '') {
                message = '현재 표시 관리자를 해제하시겠습니까?';
            } else {
                message = '이 사용자를 표시 관리자로 설정하시겠습니까?';
            }

            if (!confirm(message)) {
                console.log('사용자가 취소함');
                return;
            }

            setIsUpdatingRepresentative(true);
            console.log('API 호출 시작 - userId:', userId);

            const response = await fetch('/api/admin/representative', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId || null })
            });

            console.log('API 응답 상태:', response.status);
            const result = await response.json();
            console.log('API 응답 데이터:', result);

            if (!response.ok) {
                throw new Error(result.error || '표시 관리자 설정에 실패했습니다.');
            }

            // 성공 시 서버 응답의 사용자 정보로 상태 업데이트
            if (userId === '') {
                console.log('표시 관리자 해제');
                setRepresentativeAdmin(null);
            } else if (result.representative) {
                console.log('표시 관리자 설정:', result.representative);
                setRepresentativeAdmin(result.representative);
            }

            console.log('=== handleRepresentativeAdminSet 성공 완료 ===');
            alert(result.message);
        } catch (error) {
            console.log('handleRepresentativeAdminSet 오류:', error);
            alert('표시 관리자 설정에 실패했습니다.');
        } finally {
            setIsUpdatingRepresentative(false);
        }
    };


    const handleUserStatusChange = async (userId: string, status: 'active' | 'suspended' | 'banned', duration?: number) => {
        try {
            let message = '';

            if (status === 'active') {
                message = '사용자의 제재를 해제하고 정상 이용 상태로 변경하시겠습니까?';
            } else if (status === 'suspended') {
                message = `사용자를 ${duration}일간 정지하시겠습니까?`;
            } else {
                message = '사용자를 영구적으로 차단하시겠습니까?\n차단된 사용자는 관리자가 해제하기 전까지 로그인이 불가능합니다.';
            }

            if (!confirm(message)) {
                return;
            }

            let requestBody: any = { status };

            if (status === 'suspended' && duration) {
                const suspendUntil = new Date();
                suspendUntil.setDate(suspendUntil.getDate() + duration);
                requestBody.suspendUntil = suspendUntil.toISOString();
            }

            const response = await fetch(`/api/users/${userId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '사용자 상태 변경에 실패했습니다.');
            }

            // 사용자 목록 업데이트
            setUsers(prev =>
                prev.map(user =>
                    user.id === userId
                        ? { ...user, status }
                        : user
                )
            );

            alert(result.message);
        } catch {
            alert('사용자 상태 변경에 실패했습니다.');
        }
    };

    const handleDelete = async (projectId: number) => {
        try {
            if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                return;
            }

            const response = await fetch(`/api/projects/${projectId}/delete`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('프로젝트 삭제에 실패했습니다.');
            }

            const result = await response.json();

            // 프로젝트 목록에서 제거
            setProjects(prev => prev.filter(project => project.id !== projectId));

            alert(result.message);
        } catch {
            alert('프로젝트 삭제에 실패했습니다.');
        }
    };


    const handleResourceSearch = (search: string) => {
        setResourceSearch(search);
        setResourcePage(1);
        fetchResources(1, search, resourceFilter);
    };

    const handleResourceFilterChange = (filter: 'all' | 'published' | 'draft' | 'private') => {
        setResourceFilter(filter);
        setResourcePage(1);
        fetchResources(1, resourceSearch, filter);
    };

    const handleResourcePageChange = (page: number) => {
        setResourcePage(page);
        fetchResources(page, resourceSearch, resourceFilter);
    };

    const handleResourceTogglePin = async (resourceId: number, isPinned: boolean) => {
        try {
            const response = await fetch(`/api/resources/${resourceId}/pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isPinned })
            });

            if (!response.ok) {
                throw new Error('자료 고정 상태 변경에 실패했습니다.');
            }

            const result = await response.json();

            // 자료실 목록 업데이트
            setResources(prev =>
                prev.map(resource =>
                    resource.id === resourceId
                        ? { ...resource, is_pinned: isPinned }
                        : resource
                )
            );

            alert(result.message);
        } catch {
            alert('자료 고정 상태 변경에 실패했습니다.');
        }
    };

    const handleResourceStatusChange = async (resourceId: number, status: 'published' | 'private') => {
        try {
            if (!confirm(`자료를 ${status === 'private' ? '비공개' : '공개'} 상태로 변경하시겠습니까?`)) {
                return;
            }

            const response = await fetch(`/api/resources/${resourceId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '자료 상태 변경에 실패했습니다.');
            }

            // 자료실 목록 업데이트
            setResources(prev =>
                prev.map(resource =>
                    resource.id === resourceId
                        ? { ...resource, status }
                        : resource
                )
            );

            alert(result.message);
        } catch {
            alert('자료 상태 변경에 실패했습니다.');
        }
    };

    const handleResourceDelete = async (resourceId: number) => {
        try {
            if (!confirm('정말로 이 자료를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                return;
            }

            const response = await fetch(`/api/resources/${resourceId}/delete`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('자료 삭제에 실패했습니다.');
            }

            const result = await response.json();

            // 자료실 목록에서 제거
            setResources(prev => prev.filter(resource => resource.id !== resourceId));

            alert(result.message);
        } catch {
            alert('자료 삭제에 실패했습니다.');
        }
    };


    const handleActivitySearch = (search: string) => {
        setActivitySearch(search);
        setActivityPage(1);
        fetchActivities(1, search, activityFilter);
    };

    const handleActivityFilterChange = (filter: 'all' | 'published' | 'draft' | 'private') => {
        setActivityFilter(filter);
        setActivityPage(1);
        fetchActivities(1, activitySearch, filter);
    };

    const handleActivityPageChange = (page: number) => {
        setActivityPage(page);
        fetchActivities(page, activitySearch, activityFilter);
    };

    const handleActivityTogglePin = async (activityId: number, isPinned: boolean) => {
        try {
            const response = await fetch(`/api/activities/${activityId}/pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isPinned })
            });

            if (!response.ok) {
                throw new Error('활동 고정 상태 변경에 실패했습니다.');
            }

            const result = await response.json();

            setActivities(prev =>
                prev.map(activity =>
                    activity.id === activityId
                        ? { ...activity, is_pinned: isPinned }
                        : activity
                )
            );

            alert(result.message);
        } catch {
            alert('활동 고정 상태 변경에 실패했습니다.');
        }
    };

    const handleActivityStatusChange = async (activityId: number, status: 'published' | 'private') => {
        try {
            if (!confirm(`활동을 ${status === 'private' ? '비공개' : '공개'} 상태로 변경하시겠습니까?`)) {
                return;
            }

            const response = await fetch(`/api/activities/${activityId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '활동 상태 변경에 실패했습니다.');
            }

            setActivities(prev =>
                prev.map(activity =>
                    activity.id === activityId
                        ? { ...activity, status }
                        : activity
                )
            );

            alert(result.message);
        } catch {
            alert('활동 상태 변경에 실패했습니다.');
        }
    };

    const handleActivityDelete = async (activityId: number) => {
        try {
            if (!confirm('정말로 이 활동을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                return;
            }

            const response = await fetch(`/api/activities/${activityId}/delete`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('활동 삭제에 실패했습니다.');
            }

            const result = await response.json();

            setActivities(prev => prev.filter(activity => activity.id !== activityId));

            alert(result.message);
        } catch {
            alert('활동 삭제에 실패했습니다.');
        }
    };

    // 참가자 관리 함수들
    const fetchParticipants = async (activityId: number) => {
        try {
            setParticipantsLoading(true);
            const response = await fetch(`/api/activities/${activityId}/participants`);

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || '참가자 목록을 가져오는데 실패했습니다.');
            }

            const data = await response.json();
            setParticipants(data.participants || []);
        } catch {
            // 오류가 발생해도 빈 배열로 설정하여 UI가 깨지지 않도록 함
            setParticipants([]);
            // 알림창 제거 - 참가자가 0명인 경우는 정상적인 상태
        } finally {
            setParticipantsLoading(false);
        }
    };

    const handleShowParticipants = (activity: Activity) => {
        setSelectedActivity(activity);
        setShowParticipantsModal(true);
        fetchParticipants(activity.id);
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-32">
                {/* 헤더 */}
                <div className="mb-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900 mb-1">
                                아치셈틀 공홈 관리
                            </h1>
                            <p className="text-gray-500">시스템 관리 및 모니터링 대시보드</p>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 모바일/태블릿 탭 네비게이션 */}
                <div className="mb-8 lg:hidden">
                    <nav className="flex flex-wrap gap-2 bg-white p-4 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md ${activeTab === 'overview'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            개요
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md ${activeTab === 'users'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            사용자
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md ${activeTab === 'contact'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Mail className="w-4 h-4" />
                            문의
                        </button>
                        <button
                            onClick={() => setActiveTab('activities')}
                            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md ${activeTab === 'activities'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            활동
                        </button>
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md ${activeTab === 'projects'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <FolderOpen className="w-4 h-4" />
                            프로젝트
                        </button>
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md ${activeTab === 'resources'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            자료실
                        </button>
                    </nav>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* 데스크톱 사이드바 */}
                    <div className="hidden lg:block w-48 flex-shrink-0">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'overview'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <BarChart3 className="w-5 h-5 mr-3" />
                                개요
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'users'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Users className="w-5 h-5 mr-3" />
                                사용자 관리
                            </button>
                            <button
                                onClick={() => setActiveTab('contact')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'contact'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Mail className="w-5 h-5 mr-3" />
                                문의 관리
                            </button>
                            <button
                                onClick={() => setActiveTab('activities')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'activities'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Calendar className="w-5 h-5 mr-3" />
                                활동게시판 관리
                            </button>
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'projects'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <FolderOpen className="w-5 h-5 mr-3" />
                                프로젝트 관리
                            </button>
                            <button
                                onClick={() => setActiveTab('resources')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'resources'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <FileText className="w-5 h-5 mr-3" />
                                자료실 관리
                            </button>
                        </nav>
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg border border-gray-200">
                            {activeTab === 'overview' && (
                                <div className="divide-y divide-gray-200">
                                    {/* 환영 메시지 */}
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-medium text-gray-900">시스템 현황</h2>
                                                <p className="mt-1 text-sm text-gray-500">전체 시스템 상태를 확인할 수 있습니다</p>
                                            </div>
                                            <div className="hidden md:block">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 시스템 통계 */}
                                    <div className="p-4 sm:p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center mr-3">
                                                        <Users className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">총 사용자</p>
                                                        <p className="text-2xl font-semibold text-gray-900">{systemStats?.totalUsers || 0}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-green-50 rounded-md flex items-center justify-center mr-3">
                                                        <Shield className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">관리자</p>
                                                        <p className="text-2xl font-semibold text-gray-900">{systemStats?.totalAdmins || 0}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-purple-50 rounded-md flex items-center justify-center mr-3">
                                                        <FileText className="h-4 w-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">총 게시물</p>
                                                        <p className="text-2xl font-semibold text-gray-900">{(systemStats?.totalProjects || 0) + (systemStats?.totalResources || 0) + (systemStats?.totalActivities || 0)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 게시물 통계 */}
                                    {postStats && (
                                        <div className="p-4 sm:p-6">
                                            <div className="mb-4">
                                                <h2 className="text-base font-medium text-gray-900">게시물 통계</h2>
                                                <p className="mt-1 text-sm text-gray-500">카테고리별 상세 현황</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                    <div className="flex items-center mb-4">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center mr-3">
                                                            <FolderOpen className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <h3 className="text-sm font-medium text-gray-900">프로젝트</h3>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-500">총 게시물</span>
                                                            <span className="text-sm font-medium text-gray-900">{postStats.projects.total || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-500">발행됨</span>
                                                            <span className="text-sm font-medium text-green-600">{postStats.projects.published || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-500">임시저장</span>
                                                            <span className="text-sm font-medium text-orange-600">{postStats.projects.drafts || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                    <div className="flex items-center mb-4">
                                                        <div className="w-8 h-8 bg-green-50 rounded-md flex items-center justify-center mr-3">
                                                            <FileText className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <h3 className="text-sm font-medium text-gray-900">자료실</h3>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-500">총 게시물</span>
                                                            <span className="text-sm font-medium text-gray-900">{postStats.resources.total || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-500">발행됨</span>
                                                            <span className="text-sm font-medium text-green-600">{postStats.resources.published || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-500">임시저장</span>
                                                            <span className="text-sm font-medium text-orange-600">{postStats.resources.drafts || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                    <div className="flex items-center mb-4">
                                                        <div className="w-8 h-8 bg-purple-50 rounded-md flex items-center justify-center mr-3">
                                                            <Calendar className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        <h3 className="text-sm font-medium text-gray-900">활동</h3>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-500">총 게시물</span>
                                                            <span className="text-sm font-medium text-gray-900">{postStats.activities.total || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-500">발행됨</span>
                                                            <span className="text-sm font-medium text-green-600">{postStats.activities.published || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-500">임시저장</span>
                                                            <span className="text-sm font-medium text-orange-600">{postStats.activities.drafts || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div>
                                    <div className="p-4 sm:p-6 border-b border-gray-200">
                                        <h2 className="text-base font-medium text-gray-900">사용자 관리</h2>
                                        <p className="mt-1 text-sm text-gray-500">전체 사용자 목록과 권한을 관리합니다</p>

                                        {/* 표시 관리자 선택 */}
                                        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                                    표시 관리자:
                                                </label>
                                                <select
                                                    value={representativeAdmin?.id || ''}
                                                    onChange={async (e) => {
                                                        const selectedUserId = e.target.value;
                                                        console.log('선택박스 변경:', selectedUserId);
                                                        if (selectedUserId === '') {
                                                            await handleRepresentativeAdminSet('');
                                                        } else {
                                                            await handleRepresentativeAdminSet(selectedUserId);
                                                        }
                                                    }}
                                                    disabled={isUpdatingRepresentative}
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">표시 관리자 선택</option>
                                                    {users
                                                        .filter(user => user.role === 'admin' || user.role === 'super_admin')
                                                        .map(user => (
                                                            <option key={user.id} value={user.id}>
                                                                {user.nickname} ({user.name}) - {user.role === 'super_admin' ? '대표 관리자' : '관리자'}
                                                            </option>
                                                        ))}
                                                </select>
                                                {isUpdatingRepresentative && (
                                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                )}
                                            </div>
                                            {representativeAdmin && (
                                                <div className="mt-2 text-xs text-gray-600">
                                                    현재: {representativeAdmin.nickname} ({representativeAdmin.email})
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    {/* 데스크톱 테이블 뷰 */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-medium text-gray-900">사용자</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">이름</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">이메일</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">생년월일</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">전공</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">학년</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">역할</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">상태</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">가입일</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {users.map((user) => (
                                                    <tr key={user.id}>
                                                        <td className="whitespace-nowrap py-4 pl-6 pr-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden relative">
                                                                    {user.profile_image ? (
                                                                        <Image
                                                                            src={user.profile_image}
                                                                            alt={user.nickname}
                                                                            fill
                                                                            sizes="32px"
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-white text-sm font-semibold">
                                                                            {user.nickname.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div
                                                                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                                                                    onClick={() => router.push(`/profile/${user.nickname}`)}
                                                                >
                                                                    {user.nickname}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                            {user.name}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {user.email}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {user.birth_date ? new Date(user.birth_date).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {user.major || '-'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {user.grade || '-'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            {/* 역할 선택박스 */}
                                                            {profile?.role === 'super_admin' && user.id !== profile?.id ? (
                                                                // 슈퍼 관리자: 모든 역할 변경 가능
                                                                <select
                                                                    value={user.role}
                                                                    onChange={(e) => {
                                                                        const newRole = e.target.value as 'member' | 'admin' | 'super_admin';

                                                                        if (newRole === 'super_admin') {
                                                                            handleSuperAdminToggle(user.id, 'grant');
                                                                        } else if (user.role === 'super_admin') {
                                                                            handleSuperAdminToggle(user.id, 'revoke');
                                                                        } else {
                                                                            handleUserRoleChange(user.id, newRole);
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                                                                >
                                                                    <option value="member">일반 사용자</option>
                                                                    <option value="admin">관리자</option>
                                                                    <option value="super_admin">대표 관리자</option>
                                                                </select>
                                                            ) : profile?.role === 'admin' && user.role === 'member' && user.id !== profile?.id ? (
                                                                // 일반 관리자: 일반 사용자만 관리자로 변경 가능
                                                                <select
                                                                    value={user.role}
                                                                    onChange={(e) => handleUserRoleChange(user.id, e.target.value as 'member' | 'admin')}
                                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border-0 shadow-sm bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 hover:from-gray-100 hover:to-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
                                                                >
                                                                    <option value="member">일반 사용자</option>
                                                                    <option value="admin">관리자</option>
                                                                </select>
                                                            ) : (
                                                                // 읽기 전용
                                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${user.role === 'super_admin'
                                                                    ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                                    : user.role === 'admin'
                                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                                        : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
                                                                    }`}>
                                                                    {user.role === 'super_admin' ? '대표 관리자' :
                                                                        user.role === 'admin' ? '관리자' : '일반 사용자'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            {/* 상태 선택박스 */}
                                                            {user.id !== profile?.id ? (
                                                                <select
                                                                    value={user.status}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value.startsWith('suspended_')) {
                                                                            const duration = parseInt(value.split('_')[1]);
                                                                            handleUserStatusChange(user.id, 'suspended', duration);
                                                                        } else {
                                                                            handleUserStatusChange(user.id, value as 'active' | 'banned');
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 text-gray-700 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer"
                                                                >
                                                                    <option value="active">활성</option>
                                                                    <option value="suspended_1">정지(1일)</option>
                                                                    <option value="suspended_3">정지(3일)</option>
                                                                    <option value="suspended_7">정지(7일)</option>
                                                                    <option value="suspended_15">정지(15일)</option>
                                                                    <option value="suspended_30">정지(30일)</option>
                                                                    <option value="suspended_90">정지(90일)</option>
                                                                    <option value="banned">차단</option>
                                                                </select>
                                                            ) : (
                                                                // 본인은 읽기 전용
                                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${user.status === 'active'
                                                                    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                                    : user.status === 'suspended'
                                                                        ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                                                                        : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                                    }`}>
                                                                    {user.status === 'active' ? '활성' :
                                                                        user.status === 'suspended' ? '정지' : '차단'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 모바일 카드 뷰 */}
                                    <div className="lg:hidden p-4 space-y-4">
                                        {users.map((user) => (
                                            <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                                        {user.profile_image ? (
                                                            <Image
                                                                src={user.profile_image}
                                                                alt={user.nickname}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-white text-sm font-semibold">
                                                                {user.nickname.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div
                                                            className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors duration-200"
                                                            onClick={() => router.push(`/profile/${user.nickname}`)}
                                                        >
                                                            {user.nickname}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">{user.name}</div>
                                                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {user.birth_date ? new Date(user.birth_date).toLocaleDateString() : '-'} |
                                                            {user.major || '-'} |
                                                            {user.grade || '-'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">권한</span>
                                                        {profile?.role === 'super_admin' && user.id !== profile?.id ? (
                                                            // 슈퍼 관리자: 모든 역할 변경 가능
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => {
                                                                    const newRole = e.target.value as 'member' | 'admin' | 'super_admin';

                                                                    if (newRole === 'super_admin') {
                                                                        handleSuperAdminToggle(user.id, 'grant');
                                                                    } else if (user.role === 'super_admin') {
                                                                        handleSuperAdminToggle(user.id, 'revoke');
                                                                    } else {
                                                                        handleUserRoleChange(user.id, newRole);
                                                                    }
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                                                            >
                                                                <option value="member">일반 사용자</option>
                                                                <option value="admin">관리자</option>
                                                                <option value="super_admin">대표 관리자</option>
                                                            </select>
                                                        ) : profile?.role === 'admin' && user.role === 'member' && user.id !== profile?.id ? (
                                                            // 일반 관리자: 일반 사용자만 관리자로 변경 가능
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleUserRoleChange(user.id, e.target.value as 'member' | 'admin')}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border-0 shadow-sm bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 hover:from-gray-100 hover:to-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
                                                            >
                                                                <option value="member">일반 사용자</option>
                                                                <option value="admin">관리자</option>
                                                            </select>
                                                        ) : (
                                                            // 읽기 전용
                                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${user.role === 'super_admin'
                                                                ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                                : user.role === 'admin'
                                                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                                    : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
                                                                }`}>
                                                                {user.role === 'super_admin' ? '대표 관리자' :
                                                                    user.role === 'admin' ? '관리자' : '일반 사용자'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">상태</span>
                                                        {user.id !== profile?.id ? (
                                                            <select
                                                                value={user.status}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value.startsWith('suspended_')) {
                                                                        const duration = parseInt(value.split('_')[1]);
                                                                        handleUserStatusChange(user.id, 'suspended', duration);
                                                                    } else {
                                                                        handleUserStatusChange(user.id, value as 'active' | 'banned');
                                                                    }
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 text-gray-700 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer"
                                                            >
                                                                <option value="active">활성</option>
                                                                <option value="suspended_1">정지(1일)</option>
                                                                <option value="suspended_3">정지(3일)</option>
                                                                <option value="suspended_7">정지(7일)</option>
                                                                <option value="suspended_15">정지(15일)</option>
                                                                <option value="suspended_30">정지(30일)</option>
                                                                <option value="suspended_90">정지(90일)</option>
                                                                <option value="banned">차단</option>
                                                            </select>
                                                        ) : (
                                                            // 본인은 읽기 전용
                                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${user.status === 'active'
                                                                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                                : user.status === 'suspended'
                                                                    ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                                                                    : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                                }`}>
                                                                {user.status === 'active' ? '활성' :
                                                                    user.status === 'suspended' ? '정지' : '차단'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">가입일</span>
                                                        <span className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'activities' && (
                                <div>
                                    <div className="p-4 sm:p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-base font-medium text-gray-900">활동게시판 관리</h2>
                                                <p className="mt-1 text-sm text-gray-500">활동 게시물을 관리하고 모니터링합니다</p>
                                            </div>
                                            <button
                                                onClick={() => router.push('/activities/write')}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                활동 작성
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        {/* 필터 및 검색 */}
                                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleActivityFilterChange('all')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${activityFilter === 'all'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    전체
                                                </button>
                                                <button
                                                    onClick={() => handleActivityFilterChange('published')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${activityFilter === 'published'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    발행됨
                                                </button>
                                                <button
                                                    onClick={() => handleActivityFilterChange('draft')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${activityFilter === 'draft'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    임시저장
                                                </button>
                                                <button
                                                    onClick={() => handleActivityFilterChange('private')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${activityFilter === 'private'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    비공개
                                                </button>
                                            </div>
                                            <div className="flex gap-2 flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="활동 검색..."
                                                    value={activitySearch}
                                                    onChange={(e) => setActivitySearch(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleActivitySearch(activitySearch)}
                                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={() => handleActivitySearch(activitySearch)}
                                                    className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    검색
                                                </button>
                                            </div>
                                        </div>

                                        {/* 활동 목록 */}
                                        {activitiesLoading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-500">활동을 불러오는 중...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {activities.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                                        <p className="mt-2 text-sm font-medium text-gray-900">활동이 없습니다</p>
                                                        <p className="mt-1 text-sm text-gray-500">새로운 활동을 작성해보세요.</p>
                                                    </div>
                                                ) : (
                                                    activities.map((activity) => (
                                                        <div key={activity.id} className={`border rounded-lg p-4 ${activity.is_pinned ? 'bg-yellow-50 border-yellow-200' : 'border-gray-200'}`}>
                                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                        {activity.is_pinned && (
                                                                            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                                                                고정
                                                                            </span>
                                                                        )}
                                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${activity.status === 'published'
                                                                            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                                            : activity.status === 'draft'
                                                                                ? 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
                                                                                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                                            }`}>
                                                                            {activity.status === 'published' ? '발행됨' : activity.status === 'draft' ? '임시저장' : '비공개'}
                                                                        </span>
                                                                    </div>
                                                                    <h3 className="text-sm font-medium text-gray-900 mb-1">{activity.title}</h3>
                                                                    {activity.subtitle && (
                                                                        <p className="text-sm text-gray-600 mb-2">{activity.subtitle}</p>
                                                                    )}
                                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                                        <span>작성자: {activity.author.nickname}</span>
                                                                        {activity.location && <span>장소: {activity.location}</span>}
                                                                        {activity.start_date && (
                                                                            <span>시작: {new Date(activity.start_date).toLocaleDateString('ko-KR')}</span>
                                                                        )}
                                                                        <span>조회수: {activity.views}</span>
                                                                        <span>좋아요: {activity.likes_count}</span>
                                                                        {activity.max_participants && (
                                                                            <span>참가: {activity.current_participants}/{activity.max_participants}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <button
                                                                        onClick={() => router.push(`/activities/${activity.id}`)}
                                                                        className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                                                                    >
                                                                        보기
                                                                    </button>
                                                                    <button
                                                                        onClick={() => router.push(`/activities/edit/${activity.id}`)}
                                                                        className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                                                                    >
                                                                        수정
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleActivityTogglePin(activity.id, !activity.is_pinned)}
                                                                        className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${activity.is_pinned
                                                                            ? 'text-yellow-700 bg-yellow-50 border border-yellow-300 hover:bg-yellow-100'
                                                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        {activity.is_pinned ? '고정 해제' : '고정'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleActivityStatusChange(activity.id, activity.status === 'published' ? 'private' : 'published')}
                                                                        className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                                                                    >
                                                                        {activity.status === 'published' ? '비공개' : '공개'}
                                                                    </button>
                                                                    {activity.max_participants && (
                                                                        <button
                                                                            onClick={() => handleShowParticipants(activity)}
                                                                            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                                                                        >
                                                                            참가자 ({activity.current_participants}/{activity.max_participants})
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleActivityDelete(activity.id)}
                                                                        className="px-3 py-1.5 text-xs sm:text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 whitespace-nowrap"
                                                                    >
                                                                        삭제
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {/* 페이지네이션 */}
                                        {activityPagination.totalPages > 1 && (
                                            <div className="mt-6 flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleActivityPageChange(activityPage - 1)}
                                                    disabled={!activityPagination.hasPrev}
                                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    이전
                                                </button>
                                                <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700">
                                                    {activityPagination.page} / {activityPagination.totalPages}
                                                </span>
                                                <button
                                                    onClick={() => handleActivityPageChange(activityPage + 1)}
                                                    disabled={!activityPagination.hasNext}
                                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    다음
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'resources' && (
                                <div>
                                    <div className="p-4 sm:p-6 border-b border-gray-200">
                                        <h2 className="text-base font-medium text-gray-900">자료실 관리</h2>
                                        <p className="mt-1 text-sm text-gray-500">자료를 고정하거나 상태를 관리할 수 있습니다</p>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        {/* 필터 및 검색 */}
                                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleResourceFilterChange('all')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${resourceFilter === 'all'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    전체
                                                </button>
                                                <button
                                                    onClick={() => handleResourceFilterChange('published')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${resourceFilter === 'published'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    발행됨
                                                </button>
                                                <button
                                                    onClick={() => handleResourceFilterChange('draft')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${resourceFilter === 'draft'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    임시저장
                                                </button>
                                                <button
                                                    onClick={() => handleResourceFilterChange('private')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${resourceFilter === 'private'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    비공개
                                                </button>
                                            </div>
                                            <div className="flex gap-2 flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="자료 검색..."
                                                    value={resourceSearch}
                                                    onChange={(e) => setResourceSearch(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleResourceSearch(resourceSearch)}
                                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={() => handleResourceSearch(resourceSearch)}
                                                    className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    검색
                                                </button>
                                            </div>
                                        </div>

                                        {/* 자료실 목록 */}
                                        {resourcesLoading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-500">자료를 불러오는 중...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {resources.map((resource) => (
                                                    <div key={resource.id} className={`border rounded-lg p-4 ${resource.is_pinned ? 'bg-yellow-50 border-yellow-200' : 'border-gray-200'}`}>
                                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                    {resource.is_pinned && (
                                                                        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                                                            고정
                                                                        </span>
                                                                    )}
                                                                    {resource.is_verified && (
                                                                        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                                                                            검증됨
                                                                        </span>
                                                                    )}
                                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${resource.status === 'published'
                                                                        ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                                        : resource.status === 'draft'
                                                                            ? 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
                                                                            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                                        }`}>
                                                                        {resource.status === 'published' ? '발행됨' : resource.status === 'draft' ? '임시저장' : '비공개'}
                                                                    </span>
                                                                </div>
                                                                <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">{resource.title}</h3>
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                                                                    <span>작성자: {resource.author.nickname}</span>
                                                                    {resource.subject && <span>과목: {resource.subject}</span>}
                                                                    {resource.professor && <span>교수: {resource.professor}</span>}
                                                                    <span>조회: {resource.views || 0}</span>
                                                                    <span>다운로드: {resource.downloads_count || 0}</span>
                                                                    <span>좋아요: {resource.likes_count || 0}</span>
                                                                    <span className="hidden sm:inline">작성일: {new Date(resource.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2 lg:ml-4">
                                                                <button
                                                                    onClick={() => handleResourceTogglePin(resource.id, !resource.is_pinned)}
                                                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${resource.is_pinned
                                                                        ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20 hover:bg-yellow-100'
                                                                        : 'text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'
                                                                        }`}
                                                                >
                                                                    {resource.is_pinned ? '고정 해제' : '고정하기'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleResourceStatusChange(resource.id, resource.status === 'private' ? 'published' : 'private')}
                                                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${resource.status === 'private'
                                                                        ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20 hover:bg-purple-100'
                                                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 ring-1 ring-inset ring-gray-300'
                                                                        }`}
                                                                >
                                                                    {resource.status === 'private' ? '공개하기' : '비공개'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleResourceDelete(resource.id)}
                                                                    className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-inset ring-red-600/20 whitespace-nowrap"
                                                                >
                                                                    삭제
                                                                </button>
                                                                <a
                                                                    href={`/resources/${resource.id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-md ring-1 ring-inset ring-blue-600/20 whitespace-nowrap"
                                                                >
                                                                    보기
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {resources.length === 0 && (
                                                    <div className="text-center py-8">
                                                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                                        <h3 className="mt-2 text-sm font-medium text-gray-900">자료 없음</h3>
                                                        <p className="mt-1 text-sm text-gray-500">조건에 맞는 자료가 없습니다.</p>
                                                    </div>
                                                )}

                                                {/* 페이지네이션 */}
                                                {resourcePagination.totalPages > 1 && (
                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                        <button
                                                            onClick={() => handleResourcePageChange(resourcePage - 1)}
                                                            disabled={!resourcePagination.hasPrev}
                                                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            이전
                                                        </button>
                                                        <span className="text-sm text-gray-700">
                                                            페이지 {resourcePagination.page} / {resourcePagination.totalPages}
                                                        </span>
                                                        <button
                                                            onClick={() => handleResourcePageChange(resourcePage + 1)}
                                                            disabled={!resourcePagination.hasNext}
                                                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            다음
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div>
                                    <div className="p-4 sm:p-6 border-b border-gray-200">
                                        <h2 className="text-base font-medium text-gray-900">문의 관리</h2>
                                        <p className="mt-1 text-sm text-gray-500">사용자 문의를 관리하고 응답합니다</p>
                                    </div>
                                    <ContactManagement />
                                </div>
                            )}

                            {activeTab === 'projects' && (
                                <div>
                                    <div className="p-4 sm:p-6 border-b border-gray-200">
                                        <h2 className="text-base font-medium text-gray-900">프로젝트 관리</h2>
                                        <p className="mt-1 text-sm text-gray-500">프로젝트를 고정하거나 상태를 관리할 수 있습니다</p>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        {/* 필터 및 검색 */}
                                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleProjectFilterChange('all')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${projectFilter === 'all'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    전체
                                                </button>
                                                <button
                                                    onClick={() => handleProjectFilterChange('published')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${projectFilter === 'published'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    발행됨
                                                </button>
                                                <button
                                                    onClick={() => handleProjectFilterChange('draft')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${projectFilter === 'draft'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    임시저장
                                                </button>
                                                <button
                                                    onClick={() => handleProjectFilterChange('private')}
                                                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md ${projectFilter === 'private'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                        : 'text-gray-700 hover:bg-gray-50'
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
                                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={() => handleProjectSearch(projectSearch)}
                                                    className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    검색
                                                </button>
                                            </div>
                                        </div>

                                        {/* 프로젝트 목록 */}
                                        {projectsLoading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-500">프로젝트를 불러오는 중...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {projects.map((project) => (
                                                    <div key={project.id} className={`border rounded-lg p-4 ${project.is_pinned ? 'bg-yellow-50 border-yellow-200' : 'border-gray-200'}`}>
                                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                    {project.is_pinned && (
                                                                        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                                                            고정
                                                                        </span>
                                                                    )}
                                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${project.status === 'published'
                                                                        ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                                        : project.status === 'draft'
                                                                            ? 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
                                                                            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                                        }`}>
                                                                        {project.status === 'published' ? '발행됨' : project.status === 'draft' ? '임시저장' : '비공개'}
                                                                    </span>
                                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${project.project_status === 'recruiting'
                                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                                        : project.project_status === 'active'
                                                                            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                                            : project.project_status === 'completed'
                                                                                ? 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
                                                                                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                                        }`}>
                                                                        {project.project_status === 'recruiting' ? '모집중' :
                                                                            project.project_status === 'active' ? '진행중' :
                                                                                project.project_status === 'completed' ? '완료' : '취소'}
                                                                    </span>
                                                                </div>
                                                                <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">{project.title}</h3>
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                                                                    <span>작성자: {project.author.nickname}</span>
                                                                    <span>조회: {project.views || 0}</span>
                                                                    <span>좋아요: {project.likes_count || 0}</span>
                                                                    <span>댓글: {project.comments_count || 0}</span>
                                                                    <span className="hidden sm:inline">작성일: {new Date(project.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2 lg:ml-4">
                                                                <button
                                                                    onClick={() => handleTogglePin(project.id, !project.is_pinned)}
                                                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${project.is_pinned
                                                                        ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20 hover:bg-yellow-100'
                                                                        : 'text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'
                                                                        }`}
                                                                >
                                                                    {project.is_pinned ? '고정 해제' : '고정하기'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(project.id, project.status === 'private' ? 'published' : 'private')}
                                                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${project.status === 'private'
                                                                        ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20 hover:bg-purple-100'
                                                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 ring-1 ring-inset ring-gray-300'
                                                                        }`}
                                                                >
                                                                    {project.status === 'private' ? '공개하기' : '비공개'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(project.id)}
                                                                    className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-inset ring-red-600/20 whitespace-nowrap"
                                                                >
                                                                    삭제
                                                                </button>
                                                                <a
                                                                    href={`/projects/${project.id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-md ring-1 ring-inset ring-blue-600/20 whitespace-nowrap"
                                                                >
                                                                    보기
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {projects.length === 0 && (
                                                    <div className="text-center py-8">
                                                        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8">
                                                            <FolderOpen className="mx-auto h-10 w-10 text-gray-400" />
                                                            <p className="mt-2 text-sm font-medium text-gray-900">프로젝트 없음</p>
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                {projectSearch ? '검색 결과가 없습니다.' : '등록된 프로젝트가 없습니다.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 페이지네이션 */}
                                        {projectPagination.totalPages > 1 && (
                                            <div className="mt-6 flex items-center justify-between">
                                                <div className="text-sm text-gray-500">
                                                    총 {projectPagination.total || 0}개의 프로젝트 중 {((projectPagination.page - 1) * projectPagination.limit) + 1}-{Math.min(projectPagination.page * projectPagination.limit, projectPagination.total || 0)}개 표시
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleProjectPageChange(projectPagination.page - 1)}
                                                        disabled={!projectPagination.hasPrev}
                                                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${projectPagination.hasPrev
                                                            ? 'text-gray-700 hover:bg-gray-50'
                                                            : 'text-gray-400 cursor-not-allowed'
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
                                                                className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${pageNum === projectPagination.page
                                                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                                                    : 'text-gray-700 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}

                                                    <button
                                                        onClick={() => handleProjectPageChange(projectPagination.page + 1)}
                                                        disabled={!projectPagination.hasNext}
                                                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${projectPagination.hasNext
                                                            ? 'text-gray-700 hover:bg-gray-50'
                                                            : 'text-gray-400 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        다음
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* 참가자 모달 */}
            {showParticipantsModal && selectedActivity && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)'
                    }}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    참가자 목록 - {selectedActivity.title}
                                </h3>
                                <button
                                    onClick={() => setShowParticipantsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                총 {participants.length}명 / 최대 {selectedActivity.max_participants}명
                            </p>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {participantsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">참가자를 불러오는 중...</p>
                                </div>
                            ) : participants.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm font-medium text-gray-900">참가자가 없습니다</p>
                                    <p className="mt-1 text-sm text-gray-500">아직 참가한 사용자가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative flex-shrink-0 w-10 h-10">
                                                    {participant.user_profiles?.profile_image ? (
                                                        <Image
                                                            src={participant.user_profiles.profile_image}
                                                            alt={participant.user_profiles?.nickname || '사용자'}
                                                            fill
                                                            className="rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium text-sm">
                                                                {participant.user_profiles?.nickname?.charAt(0) || '?'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                if (participant.user_profiles?.nickname) {
                                                                    router.push(`/profile/${participant.user_profiles.nickname}`);
                                                                }
                                                            }}
                                                            disabled={!participant.user_profiles?.nickname}
                                                            className={`text-sm font-medium hover:underline ${participant.user_profiles?.nickname
                                                                ? 'text-gray-900 hover:text-blue-600 cursor-pointer'
                                                                : 'text-gray-400 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {participant.user_profiles?.nickname || '익명 사용자'}
                                                        </button>
                                                        {participant.user_profiles?.name && (
                                                            <span className="text-sm text-gray-500">
                                                                ({participant.user_profiles.name})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        {participant.user_profiles?.student_id && (
                                                            <span>학번: {participant.user_profiles.student_id}</span>
                                                        )}
                                                        {participant.user_profiles?.major && (
                                                            <span>전공: {participant.user_profiles.major}</span>
                                                        )}
                                                        {participant.user_profiles?.grade && (
                                                            <span>학년: {participant.user_profiles.grade}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${participant.status === 'registered'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : participant.status === 'attended'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {participant.status === 'registered' ? '등록됨' :
                                                        participant.status === 'attended' ? '참석' : '취소됨'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(participant.joined_at).toLocaleDateString('ko-KR')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}