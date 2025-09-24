'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Eye, Heart, Pin, Clock, Share2, Clock3, CheckCircle, XCircle } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import NovelEditor from '@/components/editor/NovelEditor';
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { JSONContent } from 'novel';

interface Activity {
    id: number;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    category?: {
        name: string;
        color: string;
        icon: string;
    };
    author?: {
        name: string;
        role: string;
    };
    start_date?: string;
    end_date?: string;
    location?: string;
    max_participants?: number;
    current_participants?: number;
    views: number;
    likes: number;
    comments_count: number;
    status: string;
    is_pinned?: boolean;
    is_featured?: boolean;
    tags?: string[];
    content: unknown;
    created_at: string;
}

export default function ActivityDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { loading: authLoading } = useAuth();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isParticipating, setIsParticipating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null); // 이전 오류 상태 초기화

                if (authLoading) return;

                // 실제 API 호출
                const response = await fetch(`/api/activities/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '활동을 불러올 수 없습니다.');
                }

                setActivity(data.activity);
            } catch (err) {
                console.error('활동 로드 중 오류:', err);
                setError(err instanceof Error ? err.message : '활동을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (id && !authLoading) {
            fetchData();
        }
    }, [id, authLoading]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status: string) => {
        const statusMap = {
            'published': { text: '진행중', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            'draft': { text: '임시저장', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock3 },
            'cancelled': { text: '취소', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
            'completed': { text: '완료', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle }
        };
        return statusMap[status as keyof typeof statusMap] || statusMap.published;
    };

    const getCategoryColor = (categoryName: string) => {
        const colors = {
            '세미나': 'bg-blue-50 text-blue-700 border-blue-200',
            '워크샵': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            '회의': 'bg-amber-50 text-amber-700 border-amber-200',
            '이벤트': 'bg-red-50 text-red-700 border-red-200',
            '공지사항': 'bg-purple-50 text-purple-700 border-purple-200',
            '기타': 'bg-gray-50 text-gray-700 border-gray-200'
        };
        return colors[categoryName as keyof typeof colors] || colors.기타;
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        // TODO: 실제 좋아요 API 호출
    };

    const handleParticipate = () => {
        setIsParticipating(!isParticipating);
        // TODO: 실제 참가 API 호출
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: activity?.title,
                text: activity?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 클립보드에 복사되었습니다.');
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !activity) {
        return (
            <div className="min-h-screen bg-white">
                <Navigation />
                <main className="px-3 sm:px-4 md:px-6 py-8">
                    <div className="max-w-4xl mx-auto">
                        <EmptyState
                            title="활동을 찾을 수 없습니다"
                            description={error || '요청하신 활동이 존재하지 않습니다.'}
                            action={{
                                label: "활동 게시판으로 돌아가기",
                                onClick: () => window.location.href = "/activities"
                            }}
                        />
                    </div>
                </main>
            </div>
        );
    }

    const statusInfo = getStatusInfo(activity.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* 배경 패턴 */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>

                <div className="relative py-20 pt-24">
                    <div className="max-w-4xl mx-auto px-6">
                        {/* 뒤로 가기 버튼 */}
                        <Link
                            href="/activities"
                            className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 text-gray-700 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            활동 게시판으로
                        </Link>

                        {/* 카테고리 및 상태 */}
                        <div className="flex items-center gap-3 mb-6">
                            {activity.category && (
                                <span className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-sm border ${getCategoryColor(activity.category.name)}`}>
                                    {activity.category.name}
                                </span>
                            )}
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.text}
                            </span>
                            {activity.is_pinned && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                                    <Pin className="w-4 h-4 fill-amber-500" />
                                    고정
                                </div>
                            )}
                        </div>

                        {/* 제목 */}
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {activity.title}
                        </h1>

                        {/* 설명 */}
                        {activity.description && (
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                {activity.description}
                            </p>
                        )}

                        {/* 메타 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {activity.start_date && (
                                <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <div className="text-sm text-gray-500">일시</div>
                                        <div className="font-semibold text-gray-900">{formatDate(activity.start_date)}</div>
                                    </div>
                                </div>
                            )}

                            {activity.location && (
                                <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="text-sm text-gray-500">장소</div>
                                        <div className="font-semibold text-gray-900">{activity.location}</div>
                                    </div>
                                </div>
                            )}

                            {activity.max_participants && (
                                <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                                    <Users className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <div className="text-sm text-gray-500">참가자</div>
                                        <div className="font-semibold text-gray-900">
                                            {activity.current_participants || 0}/{activity.max_participants}명
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                                <Eye className="w-5 h-5 text-gray-600" />
                                <div>
                                    <div className="text-sm text-gray-500">조회수</div>
                                    <div className="font-semibold text-gray-900">{activity.views}</div>
                                </div>
                            </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleParticipate}
                                disabled={activity.status !== 'published' || !!(activity.max_participants && (activity.current_participants || 0) >= activity.max_participants)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isParticipating
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : activity.status === 'published' && (!activity.max_participants || (activity.current_participants || 0) < activity.max_participants)
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                        : 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                {isParticipating ? '참가 취소' : '참가하기'}
                            </button>

                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isLiked
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-white/50 text-gray-700 border border-white/30 hover:bg-white/70'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                                {activity.likes + (isLiked ? 1 : 0)}
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-6 py-3 bg-white/50 text-gray-700 border border-white/30 rounded-xl font-medium hover:bg-white/70 transition-all duration-200"
                            >
                                <Share2 className="w-5 h-5" />
                                공유
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 메인 콘텐츠 */}
                        <div className="lg:col-span-2">
                            {/* 활동 내용 */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">활동 상세</h2>
                                <div className="prose prose-lg max-w-none">
                                    <NovelEditor
                                        initialContent={activity.content as JSONContent | null | undefined}
                                        editable={false}
                                        className="text-gray-700"
                                        showToolbar={false}
                                        showStatus={false}
                                    />
                                </div>
                            </div>

                            {/* 태그 */}
                            {activity.tags && activity.tags.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">태그</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {activity.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 사이드바 */}
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                {/* 활동 정보 */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">활동 정보</h3>
                                    <div className="space-y-4">
                                        {activity.start_date && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <div className="text-sm text-gray-500">시작일</div>
                                                    <div className="font-semibold text-gray-900">{formatDate(activity.start_date)}</div>
                                                </div>
                                            </div>
                                        )}

                                        {activity.end_date && activity.end_date !== activity.start_date && (
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <div className="text-sm text-gray-500">종료일</div>
                                                    <div className="font-semibold text-gray-900">{formatDate(activity.end_date)}</div>
                                                </div>
                                            </div>
                                        )}

                                        {activity.location && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-5 h-5 text-red-600" />
                                                <div>
                                                    <div className="text-sm text-gray-500">장소</div>
                                                    <div className="font-semibold text-gray-900">{activity.location}</div>
                                                </div>
                                            </div>
                                        )}

                                        {activity.max_participants && (
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 text-purple-600" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-500">참가자</div>
                                                    <div className="font-semibold text-gray-900 mb-2">
                                                        {activity.current_participants || 0}/{activity.max_participants}명
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(100, ((activity.current_participants || 0) / activity.max_participants) * 100)}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 통계 */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">통계</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">조회수</span>
                                            <span className="font-bold text-gray-900">{activity.views}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">좋아요</span>
                                            <span className="font-bold text-gray-900">{activity.likes}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">댓글</span>
                                            <span className="font-bold text-gray-900">{activity.comments_count}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 작성자 정보 */}
                                {activity.author && (
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">작성자</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                                {activity.author.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{activity.author.name}</div>
                                                <div className="text-sm text-gray-500">{activity.author.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}