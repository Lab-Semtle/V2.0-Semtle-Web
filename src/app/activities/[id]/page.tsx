'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, MapPin, Users, Heart, Pin, Clock, Share2, CheckCircle, ChevronDown, } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import NovelEditor from '@/components/editor/NovelEditor';
import CommentSystem from '@/components/common/CommentSystem';
import { useAuth } from '@/contexts/AuthContext';
import { JSONContent } from 'novel';

interface Activity {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    thumbnail?: string;
    category?: {
        name: string;
        color: string;
        icon: string;
    };
    author?: {
        name: string;
        nickname: string;
        role: string;
        profile_image?: string;
    };
    start_date?: string;
    end_date?: string;
    location?: string;
    max_participants?: number;
    current_participants?: number;
    participation_fee?: number;
    contact_info?: string;
    has_voting?: boolean;
    vote_options?: Array<{ text: string }>;
    vote_deadline?: string;
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
    const { loading: authLoading, user } = useAuth();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isParticipating, setIsParticipating] = useState(false);
    const [userVote, setUserVote] = useState<string | null>(null);
    const [voteResults, setVoteResults] = useState<{ [key: string]: number }>({});
    const [totalVotes, setTotalVotes] = useState(0);
    const [isVoting, setIsVoting] = useState(false);
    const [isParticipationExpanded, setIsParticipationExpanded] = useState(true);
    const [isVotingExpanded, setIsVotingExpanded] = useState(true);

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

                // 좋아요 상태 확인
                const likeResponse = await fetch(`/api/activities/${id}/like`);
                if (likeResponse.ok) {
                    const likeData = await likeResponse.json();
                    setIsLiked(likeData.liked);
                }

                // 참가 상태 확인
                const participateResponse = await fetch(`/api/activities/${id}/participate`);
                if (participateResponse.ok) {
                    const participateData = await participateResponse.json();
                    setIsParticipating(participateData.participated);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : '활동을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (id && !authLoading) {
            fetchData();
        }
    }, [id, authLoading]);

    const fetchVoteResults = useCallback(async () => {
        try {
            const response = await fetch(`/api/activities/${id}/vote`);
            if (response.ok) {
                const data = await response.json();
                setUserVote(data.userVote);
                setVoteResults(data.voteResults);
                setTotalVotes(data.totalVotes);
            }
        } catch {
            // 투표 결과 조회 오류 시 무시
        }
    }, [id]);


    // 투표 결과 가져오기
    useEffect(() => {
        if (activity?.has_voting && user) {
            fetchVoteResults();
        }
    }, [activity?.has_voting, user, id, fetchVoteResults]);


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

    const getStatusInfo = (activity: Activity) => {
        if (!activity.start_date) {
            return { text: '상시', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock };
        }

        const now = new Date();
        const startDate = new Date(activity.start_date);
        const endDate = activity.end_date ? new Date(activity.end_date) : null;

        if (endDate && now > endDate) {
            return { text: '종료됨', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle };
        }

        if (now < startDate) {
            return { text: '예정', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock };
        }

        if (endDate && now >= startDate && now <= endDate) {
            return { text: '진행중', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
        }

        return { text: '진행중', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
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


    const handleLike = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (isLiking) return;

        setIsLiking(true);

        try {
            const response = await fetch(`/api/activities/${id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                setIsLiked(data.liked);

                // 활동 데이터 업데이트
                if (data.likes_count !== undefined) {
                    setActivity(prev => prev ? { ...prev, likes: data.likes_count } : null);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || '좋아요 처리 중 오류가 발생했습니다.');
            }
        } catch {
            alert('좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLiking(false);
        }
    };

    const handleParticipate = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`/api/activities/${id}/participate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setIsParticipating(data.participated);

                // 활동 데이터 업데이트
                if (data.current_participants !== undefined && activity) {
                    setActivity(prev => prev ? {
                        ...prev,
                        current_participants: data.current_participants
                    } : null);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || '참가 처리 중 오류가 발생했습니다.');
            }
        } catch {
            alert('참가 처리 중 오류가 발생했습니다.');
        }
    };

    const handleVote = async (voteOption: string) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!activity?.has_voting) {
            alert('이 활동은 투표 기능이 비활성화되어 있습니다.');
            return;
        }

        // 투표 마감일 확인
        if (activity.vote_deadline) {
            const deadline = new Date(activity.vote_deadline);
            const now = new Date();
            if (now > deadline) {
                alert('투표 마감일이 지났습니다.');
                return;
            }
        }

        try {
            setIsVoting(true);
            const response = await fetch(`/api/activities/${id}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ voteOption }),
            });

            if (response.ok) {
                const data = await response.json();
                setUserVote(data.voted ? voteOption : null);

                // 투표 결과 다시 가져오기
                await fetchVoteResults();

                alert(data.message);
            } else {
                const errorData = await response.json();
                alert(errorData.error || '투표 처리 중 오류가 발생했습니다.');
            }
        } catch {
            alert('투표 처리 중 오류가 발생했습니다.');
        } finally {
            setIsVoting(false);
        }
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
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">활동을 찾을 수 없습니다</h2>
                            <p className="text-gray-600 mb-6">{error || '요청하신 활동이 존재하지 않습니다.'}</p>
                            <button
                                onClick={() => window.location.href = "/activities"}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                활동 게시판으로 돌아가기
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const statusInfo = getStatusInfo(activity);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            {/* Hero Section */}
            <div
                className="relative overflow-hidden"
                style={{
                    background: activity.category?.color
                        ? `linear-gradient(135deg, ${activity.category.color}15 0%, ${activity.category.color}25 50%, ${activity.category.color}35 100%)`
                        : 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)'
                }}
            >
                {/* 배경 패턴 */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>

                <div className="relative py-12 sm:py-20 pt-12 sm:pt-24">
                    <div className="max-w-4xl mx-auto px-6">
                        {/* 뒤로 가기 버튼 - 데스크톱만 */}
                        <Link
                            href="/activities"
                            className="hidden sm:inline-flex mb-8 items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-blue-100/50 hover:border-blue-200 transition-all duration-300 border border-white/70 text-gray-800 hover:text-blue-700 font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                            활동 게시판으로
                        </Link>

                        {/* 썸네일 이미지 - 모바일 */}
                        <div className="sm:hidden -mx-6 mb-6">
                            <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                {activity.thumbnail ? (
                                    <Image
                                        src={activity.thumbnail}
                                        alt={activity.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                        <span className="text-blue-400 text-6xl font-bold">
                                            A
                                        </span>
                                    </div>
                                )}

                                {/* 카테고리 배지 - 이미지 좌측 상단 */}
                                {activity.category && (
                                    <div className="absolute top-4 left-4">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-xs border backdrop-blur-sm ${getCategoryColor(activity.category.name)}`}>
                                            {activity.category.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 썸네일 이미지 - 데스크톱 */}
                        <div className="hidden sm:block mb-8">
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
                                {activity.thumbnail ? (
                                    <Image
                                        src={activity.thumbnail}
                                        alt={activity.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center rounded-2xl">
                                        <span className="text-blue-400 text-6xl font-bold">
                                            A
                                        </span>
                                    </div>
                                )}

                                {/* 카테고리 배지 - 이미지 좌측 상단 */}
                                {activity.category && (
                                    <div className="absolute top-4 left-4">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-sm border backdrop-blur-sm ${getCategoryColor(activity.category.name)}`}>
                                            {activity.category.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 태그, 상태 */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                {activity.tags && activity.tags.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        {activity.tags.slice(0, 3).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {activity.tags.length > 3 && (
                                            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium">
                                                +{activity.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
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
                        </div>

                        {/* 제목 */}
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                            {activity.title}
                        </h1>

                        {/* 소제목 */}
                        {activity.subtitle && (
                            <h2 className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 leading-relaxed">
                                {activity.subtitle}
                            </h2>
                        )}

                        {/* 설명 */}
                        {activity.description && (
                            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-8 leading-relaxed">
                                {activity.description}
                            </p>
                        )}

                        {/* 기본 정보 */}
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            {activity.start_date && (
                                <div className="flex items-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 min-w-0 flex-shrink-0">
                                    <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <div className="text-xs text-gray-500">일시</div>
                                        <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">{formatDate(activity.start_date)}</div>
                                    </div>
                                </div>
                            )}

                            {activity.location && (
                                <div className="flex items-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 min-w-0 flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <div className="text-xs text-gray-500">장소</div>
                                        <div className="font-semibold text-gray-900 text-sm truncate">{activity.location}</div>
                                    </div>
                                </div>
                            )}

                            {activity.contact_info && (
                                <div className="flex items-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 min-w-0 flex-shrink-0">
                                    <div className="w-4 h-4 text-orange-600 flex items-center justify-center flex-shrink-0">
                                        📞
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs text-gray-500">연락처</div>
                                        <div className="font-semibold text-gray-900 text-sm truncate">{activity.contact_info}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 작성자 정보와 액션 버튼들 */}
                        <div className="flex items-center justify-between -mb-4">
                            {/* 작성자 정보 */}
                            {activity.author && (
                                <div className="flex items-center gap-3">
                                    <div
                                        onClick={() => window.location.href = `/profile/${activity.author?.nickname}`}
                                        className="relative w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                                    >
                                        {activity.author.profile_image ? (
                                            <Image
                                                src={activity.author.profile_image}
                                                alt={activity.author.nickname}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-slate-600 text-lg font-bold">
                                                {activity.author.nickname.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div
                                            onClick={() => window.location.href = `/profile/${activity.author?.nickname}`}
                                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                                        >
                                            {activity.author.nickname}
                                        </div>
                                        <div className="text-sm text-gray-500">{activity.author.name}</div>
                                    </div>
                                </div>
                            )}

                            {/* 액션 버튼들 */}
                            <div className="flex items-center gap-2">
                                {/* 좋아요 버튼 */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">{activity.likes}</span>
                                    <button
                                        onClick={handleLike}
                                        disabled={isLiking}
                                        className={`flex items-center gap-2 px-2 py-2 rounded-lg font-medium transition-all duration-200 border ${isLiked
                                            ? 'bg-red-100 text-red-700 border-red-200'
                                            : 'bg-white/50 text-gray-700 border-white/30 hover:bg-white/70'
                                            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isLiking ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                        ) : (
                                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                                        )}
                                    </button>
                                </div>

                                {/* 공유 버튼 */}
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-2 py-2 bg-white/50 text-gray-700 border border-white/30 rounded-lg font-medium hover:bg-white/70 transition-all duration-200"
                                    title="공유하기"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-8">
                        {/* 메인 콘텐츠 */}
                        <div>
                            {/* 활동 내용 */}
                            <div className="mt-4 mb-6">
                                <div className="prose prose-sm sm:prose-lg max-w-none">
                                    <NovelEditor
                                        initialContent={activity.content as JSONContent | null | undefined}
                                        editable={false}
                                        className="text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* 참가 기능 섹션 */}
                            {((activity.max_participants && activity.max_participants > 0) || (activity.participation_fee && activity.participation_fee > 0)) && (
                                <div className="mb-6">
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setIsParticipationExpanded(!isParticipationExpanded)}
                                            className="flex items-center justify-between w-full p-4 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-white" />
                                                </div>
                                                <h3 className="text-base sm:text-base lg:text-lg font-bold text-gray-900">참가 정보</h3>
                                            </div>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isParticipationExpanded ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>

                                        {isParticipationExpanded && (
                                            <div className="px-4 pb-8">
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {activity.max_participants && activity.max_participants > 0 && (
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                                    <Users className="w-6 h-6 text-purple-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-gray-600 mb-1">참가자 현황</div>
                                                                    <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-3">
                                                                        {activity.current_participants ?? 0}/{activity.max_participants}명
                                                                    </div>
                                                                    <div className="w-full bg-white rounded-full h-3 shadow-inner">
                                                                        <div
                                                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                                                                            style={{
                                                                                width: `${Math.min(100, ((activity.current_participants ?? 0) / activity.max_participants) * 100)}%`
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {activity.participation_fee && activity.participation_fee > 0 && (
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                                    <div className="text-2xl">💰</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-600 mb-1">참가비</div>
                                                                    <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{activity.participation_fee.toLocaleString()}원</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="pt-4">
                                                        <button
                                                            onClick={handleParticipate}
                                                            disabled={activity.status !== 'published' || !!(activity.max_participants && (activity.current_participants || 0) >= activity.max_participants)}
                                                            className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-sm lg:text-base transition-all duration-300 ${isParticipating
                                                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                                                : activity.status === 'published' && (!activity.max_participants || (activity.current_participants || 0) < activity.max_participants)
                                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {isParticipating ? (
                                                                <>
                                                                    <CheckCircle className="w-5 h-5" />
                                                                    참가 완료
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Users className="w-5 h-5" />
                                                                    참가하기
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 투표 기능 섹션 */}
                            {activity.has_voting && activity.vote_options && activity.vote_options.length > 0 && (
                                <div className="mb-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setIsVotingExpanded(!isVotingExpanded)}
                                            className="flex items-center justify-between w-full p-4 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-white" />
                                                </div>
                                                <h3 className="text-base sm:text-base lg:text-lg font-bold text-gray-900">투표</h3>
                                            </div>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isVotingExpanded ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>

                                        {isVotingExpanded && (
                                            <div className="px-4 pb-8">
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {activity.vote_deadline && (
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                                    <Clock className="w-6 h-6 text-orange-600" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-600 mb-1">투표 마감</div>
                                                                    <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{formatDate(activity.vote_deadline)}</div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {totalVotes > 0 && (
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                                    <Users className="w-6 h-6 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-600 mb-1">총 투표수</div>
                                                                    <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{totalVotes}명</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        {activity.vote_options?.map((option, index) => {
                                                            const voteCount = voteResults[option.text] || 0;
                                                            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                                                            const isVoted = userVote === option.text;
                                                            const isVoteDeadlinePassed = activity.vote_deadline ? new Date() > new Date(activity.vote_deadline) : false;

                                                            return (
                                                                <div key={index} className="relative">
                                                                    <button
                                                                        onClick={() => handleVote(option.text)}
                                                                        disabled={isVoting || isVoteDeadlinePassed}
                                                                        className={`w-full p-6 rounded-2xl transition-all duration-300 ${isVoted
                                                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]'
                                                                            : 'bg-white hover:bg-blue-50 shadow-sm hover:shadow-md hover:transform hover:scale-[1.01]'
                                                                            } ${isVoting || isVoteDeadlinePassed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <div className="text-left">
                                                                                <div className={`font-semibold text-sm sm:text-base lg:text-lg ${isVoted ? 'text-white' : 'text-gray-900'}`}>
                                                                                    {option.text}
                                                                                </div>
                                                                                {totalVotes > 0 && (
                                                                                    <div className={`text-sm mt-1 ${isVoted ? 'text-blue-100' : 'text-gray-600'}`}>
                                                                                        {voteCount}표 ({percentage.toFixed(1)}%)
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {isVoted && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <CheckCircle className="w-6 h-6 text-white" />
                                                                                    <span className="font-medium text-white">투표함</span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* 투표 진행률 바 */}
                                                                        {totalVotes > 0 && (
                                                                            <div className={`rounded-full h-3 ${isVoted ? 'bg-white/30' : 'bg-gray-200'}`}>
                                                                                <div
                                                                                    className={`h-3 rounded-full transition-all duration-500 ${isVoted ? 'bg-white' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                                                                        }`}
                                                                                    style={{ width: `${percentage}%` }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {isVoting && (
                                                        <div className="text-center py-6">
                                                            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-sm">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                                                <span className="font-medium text-gray-700">투표 처리 중...</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}



                            {/* 댓글 섹션 */}
                            <div className="mb-12">
                                <CommentSystem postType="activity" postId={activity.id} />
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}