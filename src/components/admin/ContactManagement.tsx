import { useState, useEffect, useCallback } from 'react';
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

    const fetchInquiries = useCallback(async () => {
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
    }, [selectedStatus, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchInquiries();
    }, [selectedStatus, pagination.page, fetchInquiries]);

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
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            상세보기
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
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
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
                                    문의 상세 정보
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <span className="sr-only">닫기</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                            <div className="space-y-6">
                                {/* 제목 섹션 */}
                                <div className="border border-gray-200 rounded-lg p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        <h4 className="text-base font-semibold text-gray-900">문의 제목</h4>
                                    </div>
                                    <p className="text-gray-700">{selectedInquiry.subject}</p>
                                </div>

                                {/* 작성자 정보 섹션 */}
                                <div className="border border-gray-200 rounded-lg p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <h4 className="text-base font-semibold text-gray-900">작성자 정보</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-md p-3">
                                            <p className="text-xs text-gray-500 mb-1">이름</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedInquiry.name}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-md p-3">
                                            <p className="text-xs text-gray-500 mb-1">이메일</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedInquiry.email}</p>
                                        </div>
                                        {selectedInquiry.phone && (
                                            <div className="bg-gray-50 rounded-md p-3">
                                                <p className="text-xs text-gray-500 mb-1">전화번호</p>
                                                <p className="text-sm font-medium text-gray-900">{selectedInquiry.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 문의 내용 섹션 */}
                                <div className="border border-gray-200 rounded-lg p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <h4 className="text-base font-semibold text-gray-900">문의 내용</h4>
                                    </div>
                                    <div className="bg-gray-50 rounded-md p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
                                    </div>
                                </div>

                                {/* 관리자 노트 섹션 */}
                                <div className="border border-gray-200 rounded-lg p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <h4 className="text-base font-semibold text-gray-900">관리자 노트</h4>
                                    </div>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 resize-none bg-gray-50"
                                        rows={4}
                                        placeholder="관리자 노트를 입력하세요..."
                                    />
                                </div>

                                {/* 상태 및 시간 정보 섹션 */}
                                <div className="border border-gray-200 rounded-lg p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h4 className="text-base font-semibold text-gray-900">상태 및 시간 정보</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="bg-gray-50 rounded-md p-3">
                                            <p className="text-xs text-gray-500 mb-1">현재 상태</p>
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInquiry.status)}`}>
                                                {getStatusText(selectedInquiry.status)}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 rounded-md p-3">
                                            <p className="text-xs text-gray-500 mb-1">작성일</p>
                                            <p className="text-sm font-medium text-gray-900">{formatDate(selectedInquiry.created_at)}</p>
                                        </div>
                                        {selectedInquiry.resolved_at && (
                                            <div className="bg-gray-50 rounded-md p-3">
                                                <p className="text-xs text-gray-500 mb-1">해결일</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDate(selectedInquiry.resolved_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 버튼 섹션 */}
                            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
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
                                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
