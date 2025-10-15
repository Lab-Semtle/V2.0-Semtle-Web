import { useState, useEffect } from 'react';
import { Mail, Search, Filter, Loader2 } from 'lucide-react';

interface ContactInquiry {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function ContactManagement() {
    const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                status: selectedStatus,
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });

            const response = await fetch(`/api/admin/contact?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '문의 목록을 불러오는데 실패했습니다.');
            }

            setInquiries(data.inquiries);
            setPagination(data.pagination);
        } catch (error) {
            setError(error instanceof Error ? error.message : '문의 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [selectedStatus, pagination.page]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return '대기중';
            case 'in_progress':
                return '처리중';
            case 'resolved':
                return '해결됨';
            case 'closed':
                return '종료됨';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleStatusChange = async (inquiryId: string, status: 'pending' | 'in_progress' | 'resolved' | 'closed') => {
        try {
            const response = await fetch(`/api/contact/${inquiryId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '문의 상태 변경에 실패했습니다.');
            }

            // 문의 목록 업데이트
            setInquiries(prev =>
                prev.map(inquiry =>
                    inquiry.id === inquiryId
                        ? { ...inquiry, status }
                        : inquiry
                )
            );

            // 상태가 resolved로 변경되면 resolved_at 업데이트
            if (status === 'resolved') {
                setInquiries(prev =>
                    prev.map(inquiry =>
                        inquiry.id === inquiryId
                            ? { ...inquiry, resolved_at: new Date().toISOString() }
                            : inquiry
                    )
                );
            }

        } catch (error) {
            console.error('문의 상태 변경 오류:', error);
            alert(error instanceof Error ? error.message : '문의 상태 변경에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                    <Mail className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-auto pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full sm:w-auto pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        >
                            <option value="all">모든 상태</option>
                            <option value="pending">대기중</option>
                            <option value="in_progress">처리중</option>
                            <option value="resolved">해결됨</option>
                            <option value="closed">종료됨</option>
                        </select>
                    </div>
                </div>
                <div className="text-sm text-gray-500">
                    총 {pagination.total}개의 문의
                </div>
            </div>

            {/* 데스크톱 테이블 뷰 */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                제목
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                작성자
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                상태
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                작성일
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                작업
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {inquiries.map((inquiry) => (
                            <tr key={inquiry.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {inquiry.subject}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{inquiry.name}</div>
                                    <div className="text-sm text-gray-500">{inquiry.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={inquiry.status}
                                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value as 'pending' | 'in_progress' | 'resolved' | 'closed')}
                                        className={`text-xs font-medium rounded-md px-2 py-1 border ${getStatusColor(inquiry.status)}`}
                                    >
                                        <option value="pending">대기중</option>
                                        <option value="in_progress">처리중</option>
                                        <option value="resolved">해결됨</option>
                                        <option value="closed">종료됨</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(inquiry.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedInquiry(inquiry);
                                                setAdminNotes(inquiry.admin_notes || '');
                                                setShowModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            상세 보기
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('정말로 이 문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                                                    return;
                                                }

                                                try {
                                                    const response = await fetch(`/api/contact/${inquiry.id}/delete`, {
                                                        method: 'DELETE'
                                                    });

                                                    const result = await response.json();

                                                    if (!response.ok) {
                                                        throw new Error(result.error || '문의 삭제에 실패했습니다.');
                                                    }

                                                    // 문의 목록에서 제거
                                                    setInquiries(prev => prev.filter(item => item.id !== inquiry.id));
                                                    alert('문의가 삭제되었습니다.');
                                                } catch (error) {
                                                    console.error('문의 삭제 오류:', error);
                                                    alert(error instanceof Error ? error.message : '문의 삭제에 실패했습니다.');
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 모바일 카드 뷰 */}
            <div className="lg:hidden space-y-4">
                {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-1">{inquiry.subject}</h3>
                                <div className="text-xs text-gray-500">
                                    <p>{inquiry.name}</p>
                                    <p>{inquiry.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-500">
                                    {formatDate(inquiry.created_at)}
                                </div>
                                <select
                                    value={inquiry.status}
                                    onChange={(e) => handleStatusChange(inquiry.id, e.target.value as 'pending' | 'in_progress' | 'resolved' | 'closed')}
                                    className={`text-xs font-medium rounded-md px-2 py-1 border ${getStatusColor(inquiry.status)}`}
                                >
                                    <option value="pending">대기중</option>
                                    <option value="in_progress">처리중</option>
                                    <option value="resolved">해결됨</option>
                                    <option value="closed">종료됨</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setSelectedInquiry(inquiry);
                                        setAdminNotes(inquiry.admin_notes || '');
                                        setShowModal(true);
                                    }}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                                >
                                    상세 보기
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!confirm('정말로 이 문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                                            return;
                                        }

                                        try {
                                            const response = await fetch(`/api/contact/${inquiry.id}/delete`, {
                                                method: 'DELETE'
                                            });

                                            const result = await response.json();

                                            if (!response.ok) {
                                                throw new Error(result.error || '문의 삭제에 실패했습니다.');
                                            }

                                            setInquiries(prev => prev.filter(item => item.id !== inquiry.id));
                                            alert('문의가 삭제되었습니다.');
                                        } catch (error) {
                                            console.error('문의 삭제 오류:', error);
                                            alert(error instanceof Error ? error.message : '문의 삭제에 실패했습니다.');
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {inquiries.length === 0 && (
                <div className="text-center py-12">
                    <Mail className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">문의 없음</h3>
                    <p className="mt-1 text-sm text-gray-500">아직 접수된 문의가 없습니다.</p>
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-2">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        이전
                    </button>
                    <span className="text-xs sm:text-sm text-gray-700">
                        {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        다음
                    </button>
                </div>
            )}

            {/* 상세 보기 모달 */}
            {showModal && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                문의 상세 정보
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">닫기</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">제목</h4>
                                <p className="mt-1 text-sm text-gray-500">{selectedInquiry.subject}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900">작성자 정보</h4>
                                <div className="mt-1 text-sm text-gray-500">
                                    <p>이름: {selectedInquiry.name}</p>
                                    <p>이메일: {selectedInquiry.email}</p>
                                    {selectedInquiry.phone && <p>전화번호: {selectedInquiry.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900">문의 내용</h4>
                                <p className="mt-1 text-sm text-gray-500 whitespace-pre-wrap">{selectedInquiry.message}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900">관리자 노트</h4>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    rows={4}
                                    placeholder="관리자 노트를 입력하세요..."
                                />
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900">상태 및 시간 정보</h4>
                                <div className="mt-1 text-sm text-gray-500">
                                    <p>현재 상태: {getStatusText(selectedInquiry.status)}</p>
                                    <p>작성일: {formatDate(selectedInquiry.created_at)}</p>
                                    {selectedInquiry.resolved_at && (
                                        <p>해결일: {formatDate(selectedInquiry.resolved_at)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`/api/contact/${selectedInquiry.id}/notes`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({ notes: adminNotes })
                                        });

                                        const result = await response.json();

                                        if (!response.ok) {
                                            throw new Error(result.error || '관리자 노트 저장에 실패했습니다.');
                                        }

                                        // 문의 목록 업데이트
                                        setInquiries(prev =>
                                            prev.map(inquiry =>
                                                inquiry.id === selectedInquiry.id
                                                    ? { ...inquiry, admin_notes: adminNotes }
                                                    : inquiry
                                            )
                                        );

                                        setShowModal(false);
                                        alert('관리자 노트가 저장되었습니다.');
                                    } catch (error) {
                                        console.error('관리자 노트 저장 오류:', error);
                                        alert(error instanceof Error ? error.message : '관리자 노트 저장에 실패했습니다.');
                                    }
                                }}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
