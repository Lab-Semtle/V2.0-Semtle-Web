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
    Users,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    User,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

interface ProjectApplication {
    id: number;
    project_id: number;
    applicant_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    applied_at: string;
    motivation: string;
    relevant_experience?: string;
    available_time?: string;
    portfolio_url?: string;
    github_url?: string;
    additional_info?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    review_notes?: string;
    rejection_reason?: string;
    applicant?: {
        id: string;
        nickname: string;
        name: string;
        profile_image?: string;
        major?: string;
        grade?: string;
        github_url?: string;
        portfolio_url?: string;
    };
}

interface ProjectWithApplications {
    id: number;
    title: string;
    subtitle?: string;
    thumbnail?: string;
    project_status: string;
    team_size: number;
    current_members: number;
    deadline?: string;
    created_at: string;
    category: { name: string };
    project_type: { name: string; color: string };
    applications: ProjectApplication[];
}

export default function ProjectApplicationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectWithApplications[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
    const [processingApplication, setProcessingApplication] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        fetchProjects();
    }, [user, router]);

    const fetchProjects = async (page: number = 1) => {
        try {
            setError('');
            const response = await fetch(`/api/my-projects/applications?page=${page}&limit=5`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '프로젝트 목록을 불러올 수 없습니다.');
            }

            setProjects(data.projects || []);

            // 페이지네이션 정보 업데이트
            if (data.pagination) {
                setTotalPages(data.pagination.totalPages);
                setTotalCount(data.pagination.total);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const toggleProjectExpansion = (projectId: number) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId);
        } else {
            newExpanded.add(projectId);
        }
        setExpandedProjects(newExpanded);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setLoading(true);
        fetchProjects(page);
    };

    const handleApplicationAction = async (applicationId: number, action: 'accepted' | 'rejected', reviewNotes?: string, rejectionReason?: string) => {
        setProcessingApplication(applicationId);

        try {
            const response = await fetch(`/api/projects/applications/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: action,
                    review_notes: reviewNotes,
                    rejection_reason: rejectionReason
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '신청 처리에 실패했습니다.');
            }

            // 목록 새로고침
            await fetchProjects();
        } catch (err) {
            alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setProcessingApplication(null);
        }
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
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">
                        취소됨
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleViewProject = (projectId: number) => {
        router.push(`/projects/${projectId}`);
    };

    const getProjectTypeColor = (projectType: Record<string, unknown>) => {
        if (!projectType?.color) return '#3B82F6';
        return projectType.color;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">프로젝트 목록을 불러오는 중...</p>
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
                        <Button onClick={() => fetchProjects()} variant="outline">
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
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">내 프로젝트 관리</h1>
                    </div>
                    <p className="text-gray-600">내가 작성한 프로젝트에 신청한 사용자들을 관리할 수 있습니다.</p>
                </div>

                {/* 프로젝트 목록 */}
                {projects.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">작성한 프로젝트가 없습니다</h2>
                        <p className="text-gray-600 mb-4">프로젝트를 작성해보세요!</p>
                        <Button onClick={() => router.push('/projects')} className="bg-blue-600 hover:bg-blue-700">
                            프로젝트 작성하기
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:shadow-xl transition-all duration-300 border-0 !border-0 bg-white/80 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* 프로젝트 썸네일 */}
                                        <div className="flex-shrink-0">
                                            {project.thumbnail ? (
                                                <Image
                                                    src={project.thumbnail}
                                                    alt={project.title}
                                                    width={128}
                                                    height={96}
                                                    className="w-32 h-24 object-cover rounded-xl shadow-md"
                                                />
                                            ) : (
                                                <div
                                                    className="w-32 h-24 rounded-xl relative overflow-hidden shadow-md"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${getProjectTypeColor(project.project_type)}30 0%, ${getProjectTypeColor(project.project_type)}50 50%, ${getProjectTypeColor(project.project_type)}70 100%)`
                                                    }}
                                                >
                                                    {/* 그라데이션 오버레이 효과 */}
                                                    <div
                                                        className="absolute inset-0 opacity-30"
                                                        style={{
                                                            background: `radial-gradient(circle at 30% 20%, ${getProjectTypeColor(project.project_type)}60 0%, transparent 50%), 
                                                                        radial-gradient(circle at 70% 80%, ${getProjectTypeColor(project.project_type)}50 0%, transparent 50%)`
                                                        }}
                                                    ></div>

                                                    {/* 미묘한 패턴 효과 */}
                                                    <div
                                                        className="absolute inset-0 opacity-20"
                                                        style={{
                                                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${getProjectTypeColor(project.project_type)}40 10px, ${getProjectTypeColor(project.project_type)}40 20px)`
                                                        }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 프로젝트 정보 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-gray-900 truncate">{project.title}</h3>
                                                        <Badge className={`px-3 py-1 ${project.applications.length >= project.team_size
                                                            ? 'bg-red-100 text-red-800'
                                                            : project.applications.length > 0
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            대기중 {project.applications.length}명
                                                        </Badge>
                                                    </div>

                                                    {project.subtitle && (
                                                        <p className="text-gray-600 mb-3 line-clamp-2">{project.subtitle}</p>
                                                    )}

                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                                                            <Users className="w-3 h-3 inline mr-1" />
                                                            {project.current_members}/{project.team_size}명
                                                        </span>
                                                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                                                            <Calendar className="w-3 h-3 inline mr-1" />
                                                            {formatDate(project.created_at)}
                                                        </span>
                                                        {project.deadline && (
                                                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                                                                <Clock className="w-3 h-3 inline mr-1" />
                                                                {formatDate(project.deadline)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewProject(project.id)}
                                                        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        프로젝트 보기
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleProjectExpansion(project.id)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {expandedProjects.has(project.id) ? (
                                                            <ChevronDown className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                        {expandedProjects.has(project.id) ? '접기' : '펼치기'}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* 신청자 목록 */}
                                            {expandedProjects.has(project.id) && (
                                                <div className="border-t pt-6">
                                                    {project.applications.length === 0 ? (
                                                        <div className="text-center py-12">
                                                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                            <p className="text-gray-500 text-lg">아직 신청자가 없습니다</p>
                                                            <p className="text-gray-400 text-sm mt-1">프로젝트를 홍보해서 더 많은 신청자를 받아보세요!</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-6">
                                                            {project.applications.map((application) => (
                                                                <div key={application.id} className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200/50">
                                                                    <div className="flex items-start justify-between mb-4">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm overflow-hidden">
                                                                                {application.applicant?.profile_image ? (
                                                                                    <Image
                                                                                        src={application.applicant.profile_image}
                                                                                        alt={application.applicant.nickname || '신청자'}
                                                                                        fill
                                                                                        className="object-cover rounded-full"
                                                                                    />
                                                                                ) : (
                                                                                    <User className="w-6 h-6 text-white" />
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-bold text-gray-900 text-lg">
                                                                                    {application.applicant?.nickname || '알 수 없음'}
                                                                                </h4>
                                                                                <p className="text-gray-600 font-medium">
                                                                                    {application.applicant?.name || '알 수 없음'}
                                                                                </p>
                                                                                {application.applicant?.major && (
                                                                                    <p className="text-sm text-gray-500">
                                                                                        {application.applicant.major} {application.applicant.grade || ''}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            {getStatusBadge(application.status)}
                                                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                                                <Calendar className="w-4 h-4" />
                                                                                {formatDate(application.applied_at)}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* 신청 내용 */}
                                                                    <div className="mb-4">
                                                                        <div className="bg-white/60 rounded-lg p-4 mb-4">
                                                                            <h6 className="font-medium text-gray-800 mb-2">지원 동기</h6>
                                                                            <p className="text-gray-700 leading-relaxed">{application.motivation}</p>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                                            {application.relevant_experience && (
                                                                                <div className="bg-white/60 rounded-lg p-3">
                                                                                    <h6 className="font-medium text-gray-800 mb-1">관련 경험</h6>
                                                                                    <p className="text-gray-700 text-sm">{application.relevant_experience}</p>
                                                                                </div>
                                                                            )}
                                                                            {application.available_time && (
                                                                                <div className="bg-white/60 rounded-lg p-3">
                                                                                    <h6 className="font-medium text-gray-800 mb-1">참여 가능 시간</h6>
                                                                                    <p className="text-gray-700 text-sm">{application.available_time}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* 링크들 */}
                                                                    <div className="space-y-2 mb-4">
                                                                        {/* GitHub 링크들 */}
                                                                        {application.applicant?.github_url && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-medium text-gray-600">GitHub (프로필):</span>
                                                                                <a
                                                                                    href={application.applicant.github_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                                                                >
                                                                                    {application.applicant.github_url}
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                        {application.github_url && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-medium text-gray-600">GitHub:</span>
                                                                                <a
                                                                                    href={application.github_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                                                                >
                                                                                    {application.github_url}
                                                                                </a>
                                                                            </div>
                                                                        )}

                                                                        {/* 포트폴리오 링크들 */}
                                                                        {application.applicant?.portfolio_url && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-medium text-gray-600">포트폴리오 (프로필):</span>
                                                                                <a
                                                                                    href={application.applicant.portfolio_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                                                                >
                                                                                    {application.applicant.portfolio_url}
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                        {application.portfolio_url && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-medium text-gray-600">포트폴리오:</span>
                                                                                <a
                                                                                    href={application.portfolio_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                                                                >
                                                                                    {application.portfolio_url}
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* 액션 버튼 */}
                                                                    {application.status === 'pending' && (
                                                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                                            <div className="flex gap-3">
                                                                                <Button
                                                                                    size="sm"
                                                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                                                                                    onClick={() => handleApplicationAction(application.id, 'accepted')}
                                                                                    disabled={processingApplication === application.id}
                                                                                >
                                                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                                                    승인
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="border-red-300 text-red-600 hover:bg-red-50 px-4 py-2"
                                                                                    onClick={() => {
                                                                                        const reason = prompt('거절 사유를 입력해주세요:');
                                                                                        if (reason) {
                                                                                            handleApplicationAction(application.id, 'rejected', undefined, reason);
                                                                                        }
                                                                                    }}
                                                                                    disabled={processingApplication === application.id}
                                                                                >
                                                                                    <XCircle className="w-4 h-4 mr-2" />
                                                                                    거절
                                                                                </Button>
                                                                            </div>
                                                                            {processingApplication === application.id && (
                                                                                <div className="text-sm text-gray-500">처리 중...</div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* 처리 결과 */}
                                                                    {application.status !== 'pending' && application.reviewed_at && (
                                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                                            <div className="bg-white/60 rounded-lg p-3">
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                                                    <span className="text-sm font-medium text-gray-700">
                                                                                        처리일: {formatDate(application.reviewed_at)}
                                                                                    </span>
                                                                                </div>
                                                                                {application.review_notes && (
                                                                                    <div className="mb-2">
                                                                                        <span className="text-sm font-medium text-gray-700">메모:</span>
                                                                                        <p className="text-sm text-gray-600 mt-1">{application.review_notes}</p>
                                                                                    </div>
                                                                                )}
                                                                                {application.rejection_reason && (
                                                                                    <div>
                                                                                        <span className="text-sm font-medium text-red-700">거절 사유:</span>
                                                                                        <p className="text-sm text-red-600 mt-1">{application.rejection_reason}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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