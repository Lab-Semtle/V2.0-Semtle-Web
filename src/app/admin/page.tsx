'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Shield, Settings, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

export default function AdminDashboard() {
    const { user, profile, isAdmin } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState<'member' | 'admin' | 'super_admin'>('member');

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

        fetchUsers();
    }, [user, isAdmin, router]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '사용자 목록을 불러올 수 없습니다.');
            }

            setUsers(data.users || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setLoading(false);
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
                    <p className="text-gray-600">사용자 관리 및 시스템 설정</p>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex">
                            <XCircle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">총 사용자</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">관리자</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
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
                                    {users.filter(u => u.status === 'active').length}
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
                                    {users.filter(u => u.status === 'suspended' || u.status === 'banned').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

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
