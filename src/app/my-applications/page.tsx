'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/Pagination';
import {
    FileText,
    Calendar,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    User
} from 'lucide-react';

interface ProjectApplication {
    id: number;
    project_id: number;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    applied_at: string;
    motivation: string;
    relevant_experience?: string;
    available_time?: string;
    portfolio_url?: string;
    github_url?: string;
    additional_info?: string;
    project?: {
        id: number;
        title: string;
        subtitle?: string;
        thumbnail?: string;
        project_status: string;
        team_size: number;
        current_members: number;
        deadline?: string;
        created_at: string;
        author_id: string;
        category: { name: string };
        project_type: { name: string; color: string };
        author: {
            id: string;
            nickname: string;
            name: string;
            profile_image?: string;
        };
    };
}

export default function MyApplicationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<ProjectApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        fetchApplications();
    }, [user, router]);

    const fetchApplications = async (page: number = 1) => {
        try {
            setError('');
            const response = await fetch(`/api/my-applications?page=${page}&limit=5`);
            const data = await response.json();

            if (!response.ok) {
                console.error('API 응답 오류:', { status: response.status, data });
                throw new Error(data.error || '신청 목록을 불러올 수 없습니다.');
            }

            console.log('신청 목록 데이터:', data);
            // 빈 배열도 정상적인 데이터로 처리
            setApplications(data.applications || []);

            // 페이지네이션 정보 업데이트
            if (data.pagination) {
                setTotalPages(data.pagination.totalPages);
                setTotalCount(data.pagination.total);
            }
        } catch (err) {
            console.error('신청 목록 조회 오류:', err);
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setLoading(true);
        fetchApplications(page);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        대기중
                    </Badge>
                );
            case 'accepted':
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        승인됨
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-200 px-3 py-1">
                        <XCircle className="w-4 h-4 mr-1" />
                        거절됨
                    </Badge>
                );
            case 'withdrawn':
                return (
                    <Badge variant="outline" className="text-gray-600 border-gray-300 px-3 py-1">
                        취소됨
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="px-3 py-1">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // 프로젝트 타입별 기본 색상 가져오기
    const getProjectTypeColor = (projectType?: { name: string; color: string }) => {
        if (projectType?.color) {
            return projectType.color;
        }

        // 기본 색상 (fallback)
        return '#3B82F6';
    };

    const handleViewProject = (projectId: number) => {
        router.push(`/projects/${projectId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">신청 목록을 불러오는 중...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center py-16">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => fetchApplications()} variant="outline">
                            다시 시도
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">신청한 프로젝트 현황</h1>
                    </div>
                    <p className="text-gray-600">신청한 프로젝트들의 상태를 확인하고 관리할 수 있습니다.</p>
                </div>

                {/* 신청 목록 */}
                {applications.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">신청한 프로젝트가 없습니다</h2>
                        <p className="text-gray-600 mb-4">아직 프로젝트에 신청하지 않으셨네요. 흥미로운 프로젝트를 찾아보세요!</p>
                        <Button onClick={() => router.push('/projects')} className="bg-blue-600 hover:bg-blue-700">
                            프로젝트 둘러보기
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map((application) => (
                            <Card key={application.id} className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* 프로젝트 썸네일 */}
                                        <div className="flex-shrink-0">
                                            {application.project?.thumbnail ? (
                                                <Image
                                                    src={application.project.thumbnail}
                                                    alt={application.project?.title || '프로젝트'}
                                                    width={128}
                                                    height={96}
                                                    className="w-32 h-24 object-cover rounded-xl shadow-md"
                                                />
                                            ) : (
                                                <div
                                                    className="w-32 h-24 rounded-xl relative overflow-hidden shadow-md"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${getProjectTypeColor(application.project?.project_type)}30 0%, ${getProjectTypeColor(application.project?.project_type)}50 50%, ${getProjectTypeColor(application.project?.project_type)}70 100%)`
                                                    }}
                                                >
                                                    {/* 그라데이션 오버레이 효과 */}
                                                    <div
                                                        className="absolute inset-0 opacity-30"
                                                        style={{
                                                            background: `radial-gradient(circle at 30% 20%, ${getProjectTypeColor(application.project?.project_type)}60 0%, transparent 50%), 
                                                                        radial-gradient(circle at 70% 80%, ${getProjectTypeColor(application.project?.project_type)}50 0%, transparent 50%)`
                                                        }}
                                                    ></div>

                                                    {/* 미묘한 패턴 효과 */}
                                                    <div
                                                        className="absolute inset-0 opacity-20"
                                                        style={{
                                                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${getProjectTypeColor(application.project?.project_type)}40 10px, ${getProjectTypeColor(application.project?.project_type)}40 20px)`
                                                        }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 프로젝트 정보 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                            {application.project?.title || '프로젝트 정보 없음'}
                                                        </h3>
                                                        {getStatusBadge(application.status)}
                                                    </div>
                                                    {application.project?.subtitle && (
                                                        <p className="text-gray-600 mb-3 text-sm">{application.project.subtitle}</p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                                            <Users className="w-4 h-4" />
                                                            {application.project?.current_members || 0}/{application.project?.team_size || 0}명
                                                        </span>
                                                        {application.project?.created_at && (
                                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                                                <Calendar className="w-4 h-4" />
                                                                {formatDate(application.project.created_at)}
                                                            </span>
                                                        )}
                                                        {application.project?.deadline && (
                                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                                                <Clock className="w-4 h-4" />
                                                                {formatDate(application.project.deadline)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {application.project?.id && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => application.project?.id && handleViewProject(application.project.id)}
                                                            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            프로젝트 보기
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 신청 정보 */}
                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200/50">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                    <h4 className="font-semibold text-gray-900">신청 내용</h4>
                                                </div>
                                                <p className="text-gray-700 mb-4 leading-relaxed">{application.motivation}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    {application.relevant_experience && (
                                                        <div className="bg-white/60 rounded-lg p-3">
                                                            <span className="font-medium text-gray-600 text-sm">관련 경험</span>
                                                            <p className="text-gray-700 text-sm mt-1">{application.relevant_experience}</p>
                                                        </div>
                                                    )}

                                                    {application.available_time && (
                                                        <div className="bg-white/60 rounded-lg p-3">
                                                            <span className="font-medium text-gray-600 text-sm">가능한 시간</span>
                                                            <p className="text-gray-700 text-sm mt-1">{application.available_time}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            신청일: {formatDate(application.applied_at)}
                                                        </span>
                                                        {application.project?.author?.nickname && (
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-4 h-4" />
                                                                작성자: {application.project.author.nickname}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* 페이지네이션 */}
                {totalCount > 0 && totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
