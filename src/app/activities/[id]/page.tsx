'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, MapPin, Users, Eye, Heart, Pin, Clock, Share2, CheckCircle, FileText, ChevronDown, MessageCircle, Edit3, Trash2, Send, ChevronUp } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import NovelEditor from '@/components/editor/NovelEditor';
import EmptyState from '@/components/common/EmptyState';
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

interface Comment {
    id: number;
    content: string;
    created_at: string;
    updated_at: string;
    likes_count: number;
    user_id: string;
    parent_id?: number;
    user_profiles: {
        id: string;
        nickname: string;
        name: string;
        profile_image?: string;
        role: string;
    };
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
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState<number | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState<{ [key: number]: boolean }>({});

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

    const fetchComments = useCallback(async () => {
        try {
            setCommentsLoading(true);
            const response = await fetch(`/api/activities/${id}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments);
            }
        } catch {
            // 댓글 조회 오류 시 무시
        } finally {
            setCommentsLoading(false);
        }
    }, [id]);

    // 투표 결과 가져오기
    useEffect(() => {
        if (activity?.has_voting && user) {
            fetchVoteResults();
        }
    }, [activity?.has_voting, user, id, fetchVoteResults]);

    // 댓글 가져오기
    useEffect(() => {
        if (activity) {
            fetchComments();
        }
    }, [activity, id, fetchComments]);

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
                console.log('좋아요 응답:', data);

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

    const handleSubmitComment = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!newComment.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`/api/activities/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments([...comments, data.comment]);
                setNewComment('');
                // 활동 데이터를 다시 가져와서 댓글 수 업데이트
                const activityResponse = await fetch(`/api/activities/${id}`);
                if (activityResponse.ok) {
                    const activityData = await activityResponse.json();
                    setActivity(activityData.activity);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || '댓글 작성 중 오류가 발생했습니다.');
            }
        } catch {
            alert('댓글 작성 중 오류가 발생했습니다.');
        }
    };

    const handleEditComment = async (commentId: number) => {
        if (!editCommentContent.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`/api/activities/${id}/comments`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commentId,
                    content: editCommentContent
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments(comments.map(comment =>
                    comment.id === commentId ? data.comment : comment
                ));
                setEditingComment(null);
                setEditCommentContent('');
            } else {
                const errorData = await response.json();
                alert(errorData.error || '댓글 수정 중 오류가 발생했습니다.');
            }
        } catch {
            alert('댓글 수정 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`/api/activities/${id}/comments`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ commentId }),
            });

            if (response.ok) {
                setComments(comments.filter(comment => comment.id !== commentId));
                // 활동 데이터를 다시 가져와서 댓글 수 업데이트
                const activityResponse = await fetch(`/api/activities/${id}`);
                if (activityResponse.ok) {
                    const activityData = await activityResponse.json();
                    setActivity(activityData.activity);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || '댓글 삭제 중 오류가 발생했습니다.');
            }
        } catch {
            alert('댓글 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleLikeComment = async (commentId: number) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`/api/activities/${id}/comments/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ commentId }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments(comments.map(comment =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            likes_count: data.liked
                                ? comment.likes_count + 1
                                : comment.likes_count - 1
                        }
                        : comment
                ));
            } else {
                const errorData = await response.json();
                alert(errorData.error || '좋아요 처리 중 오류가 발생했습니다.');
            }
        } catch {
            alert('좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    // 답글 작성
    const handleSubmitReply = async (parentId: number) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!replyContent.trim()) {
            alert('답글 내용을 입력해주세요.');
            return;
        }

        setSubmittingReply(true);
        try {
            const response = await fetch(`/api/activities/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: replyContent.trim(),
                    parent_id: parentId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments(prev => [...prev, data.comment]);
                setReplyContent('');
                setReplyTo(null);
                // 활동 데이터를 다시 가져와서 댓글 수 업데이트
                const activityResponse = await fetch(`/api/activities/${id}`);
                if (activityResponse.ok) {
                    const activityData = await activityResponse.json();
                    setActivity(activityData.activity);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || '답글 작성에 실패했습니다.');
            }
        } catch {
            alert('답글 작성 중 오류가 발생했습니다.');
        } finally {
            setSubmittingReply(false);
        }
    };

    // 답글 토글
    const toggleReplies = (commentId: number) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    // 답글 폼 열기
    const openReplyForm = (commentId: number) => {
        setReplyTo(commentId);
        setTimeout(() => {
            const textarea = document.getElementById(`reply-${commentId}`) as HTMLTextAreaElement;
            if (textarea) {
                textarea.focus();
            }
        }, 100);
    };

    // 답글 폼 닫기
    const closeReplyForm = () => {
        setReplyTo(null);
        setReplyContent('');
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

    const statusInfo = getStatusInfo(activity);
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
                            className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-blue-100/50 hover:border-blue-200 transition-all duration-300 border border-white/30 text-gray-700 hover:text-blue-700 font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                            활동 게시판으로
                        </Link>

                        {/* 썸네일 이미지 */}
                        <div className="mb-8">
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
                            </div>
                        </div>

                        {/* 카테고리, 태그, 상태 */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                {activity.category && (
                                    <span className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-sm border ${getCategoryColor(activity.category.name)}`}>
                                        {activity.category.name}
                                    </span>
                                )}
                                {activity.tags && activity.tags.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        {activity.tags.slice(0, 3).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium"
                                            >
                                                #{tag}
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
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {activity.title}
                        </h1>

                        {/* 소제목 */}
                        {activity.subtitle && (
                            <h2 className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed">
                                {activity.subtitle}
                            </h2>
                        )}

                        {/* 작성자 정보 */}
                        {activity.author && (
                            <div className="flex items-center gap-3 mb-8">
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                                    {activity.author.profile_image ? (
                                        <Image
                                            src={activity.author.profile_image}
                                            alt={activity.author.nickname}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-lg font-bold">
                                            {activity.author.nickname.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{activity.author.nickname}</div>
                                    <div className="text-sm text-gray-500">{activity.author.name}</div>
                                </div>
                            </div>
                        )}

                        {/* 설명 */}
                        {activity.description && (
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
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

                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-4 mb-8">
                            {/* 조회수 */}
                            <div className="flex items-center gap-2 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                                <Eye className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{activity.views}</span>
                            </div>

                            {/* 좋아요 버튼 */}
                            <button
                                onClick={handleLike}
                                disabled={isLiking}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isLiked
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-white/50 text-gray-700 border border-white/30 hover:bg-white/70'
                                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLiking ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                                ) : (
                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                                )}
                                {activity.likes}
                            </button>

                            {/* 공유 버튼 */}
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-6 py-3 bg-white/50 text-gray-700 border border-white/30 rounded-xl font-medium hover:bg-white/70 transition-all duration-200"
                                title="공유하기"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-8">
                        {/* 메인 콘텐츠 */}
                        <div>
                            {/* 참가 기능 섹션 */}
                            {(activity.max_participants || activity.participation_fee) && (
                                <div className="mb-12">
                                    <button
                                        onClick={() => setIsParticipationExpanded(!isParticipationExpanded)}
                                        className="flex items-center justify-between w-full mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                <Users className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">참가 정보</h3>
                                        </div>
                                        <ChevronDown
                                            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isParticipationExpanded ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {isParticipationExpanded && (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8">
                                            <div className="space-y-6">
                                                {activity.max_participants && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                            <Users className="w-6 h-6 text-purple-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-gray-600 mb-1">참가자 현황</div>
                                                            <div className="text-2xl font-bold text-gray-900 mb-3">
                                                                {activity.current_participants || 0}/{activity.max_participants}명
                                                            </div>
                                                            <div className="w-full bg-white rounded-full h-3 shadow-inner">
                                                                <div
                                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                                                                    style={{
                                                                        width: `${Math.min(100, ((activity.current_participants || 0) / activity.max_participants) * 100)}%`
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
                                                            <div className="text-2xl font-bold text-gray-900">{activity.participation_fee.toLocaleString()}원</div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-4">
                                                    <button
                                                        onClick={handleParticipate}
                                                        disabled={activity.status !== 'published' || !!(activity.max_participants && (activity.current_participants || 0) >= activity.max_participants)}
                                                        className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${isParticipating
                                                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                                            : activity.status === 'published' && (!activity.max_participants || (activity.current_participants || 0) < activity.max_participants)
                                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        {isParticipating ? (
                                                            <>
                                                                <CheckCircle className="w-6 h-6" />
                                                                참가 완료
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Users className="w-6 h-6" />
                                                                참가하기
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 투표 기능 섹션 */}
                            {activity.has_voting && (
                                <div className="mb-12">
                                    <button
                                        onClick={() => setIsVotingExpanded(!isVotingExpanded)}
                                        className="flex items-center justify-between w-full mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">투표</h3>
                                        </div>
                                        <ChevronDown
                                            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isVotingExpanded ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {isVotingExpanded && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-6">
                                                    {activity.vote_deadline && (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                                <Clock className="w-6 h-6 text-orange-600" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-600 mb-1">투표 마감</div>
                                                                <div className="text-2xl font-bold text-gray-900">{formatDate(activity.vote_deadline)}</div>
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
                                                                <div className="text-2xl font-bold text-gray-900">{totalVotes}명</div>
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
                                                                            <div className={`font-semibold text-lg ${isVoted ? 'text-white' : 'text-gray-900'}`}>
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
                            )}


                            {/* 활동 내용 */}
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">활동 상세</h2>
                                </div>

                                <div className="prose prose-lg max-w-none">
                                    <NovelEditor
                                        initialContent={activity.content as JSONContent | null | undefined}
                                        editable={false}
                                        className="text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* 댓글 섹션 */}
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">댓글 {activity.comments_count}개</h3>

                                {/* 댓글 작성 */}
                                {user && (
                                    <div className="mb-8">
                                        <form onSubmit={handleSubmitComment} className="space-y-4">
                                            <div>
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="댓글을 작성해주세요..."
                                                    className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    rows={4}
                                                    maxLength={1000}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">
                                                    {newComment.length}/1000
                                                </span>
                                                <button
                                                    type="submit"
                                                    disabled={!newComment.trim()}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    댓글 작성
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* 댓글 목록 */}
                                <div className="space-y-6">
                                    {commentsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                            <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                                        </div>
                                    ) : (
                                        (() => {
                                            // 댓글과 답글 분리
                                            const parentComments = comments.filter(comment => !comment.parent_id);
                                            const replies = comments.filter(comment => comment.parent_id);

                                            return parentComments.map((comment) => {
                                                const commentReplies = replies.filter(reply => reply.parent_id === comment.id);
                                                const isExpanded = expandedReplies[comment.id];

                                                return (
                                                    <div key={comment.id} className="border-b border-slate-100 pb-6">
                                                        <div className="flex gap-4">
                                                            {/* 프로필 이미지 */}
                                                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                {comment.user_profiles.profile_image ? (
                                                                    <Image
                                                                        src={comment.user_profiles.profile_image}
                                                                        alt={comment.user_profiles.nickname}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-white text-sm font-bold">
                                                                        {comment.user_profiles.nickname.charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* 댓글 내용 */}
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="font-semibold text-slate-900">{comment.user_profiles.nickname}</span>
                                                                    <span className="text-sm text-slate-400">•</span>
                                                                    <span className="text-sm text-slate-500">{formatDate(comment.created_at)}</span>
                                                                    {comment.user_profiles.role === 'admin' && (
                                                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                                                            관리자
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* 댓글 내용 */}
                                                                {editingComment === comment.id ? (
                                                                    <div className="mb-4">
                                                                        <textarea
                                                                            value={editCommentContent}
                                                                            onChange={(e) => setEditCommentContent(e.target.value)}
                                                                            className="w-full h-20 p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                                            maxLength={1000}
                                                                        />
                                                                        <div className="flex gap-2 mt-2">
                                                                            <button
                                                                                onClick={() => handleEditComment(comment.id)}
                                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200"
                                                                            >
                                                                                저장
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingComment(null);
                                                                                    setEditCommentContent('');
                                                                                }}
                                                                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all duration-200"
                                                                            >
                                                                                취소
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-slate-700 mb-3 leading-relaxed whitespace-pre-wrap">
                                                                        {comment.content}
                                                                    </p>
                                                                )}

                                                                {/* 댓글 액션 */}
                                                                <div className="flex items-center gap-4">
                                                                    <button
                                                                        onClick={() => handleLikeComment(comment.id)}
                                                                        className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors duration-200"
                                                                    >
                                                                        <Heart className="w-4 h-4" />
                                                                        <span className="text-sm font-medium">{comment.likes_count}</span>
                                                                    </button>

                                                                    <button
                                                                        onClick={() => openReplyForm(comment.id)}
                                                                        className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors duration-200"
                                                                    >
                                                                        <MessageCircle className="w-4 h-4" />
                                                                        <span className="text-sm font-medium">답글</span>
                                                                    </button>

                                                                    {user && user.id === comment.user_id && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingComment(comment.id);
                                                                                    setEditCommentContent(comment.content);
                                                                                }}
                                                                                className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors duration-200"
                                                                            >
                                                                                <Edit3 className="w-4 h-4" />
                                                                                <span className="text-sm font-medium">수정</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                                className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors duration-200"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                                <span className="text-sm font-medium">삭제</span>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* 답글 폼 */}
                                                                {replyTo === comment.id && (
                                                                    <div className="mt-4 pl-4 border-l-2 border-blue-200">
                                                                        <textarea
                                                                            id={`reply-${comment.id}`}
                                                                            value={replyContent}
                                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                                            placeholder="답글을 작성해주세요..."
                                                                            className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                                            rows={3}
                                                                            maxLength={1000}
                                                                        />
                                                                        <div className="flex gap-2 mt-2">
                                                                            <button
                                                                                onClick={() => handleSubmitReply(comment.id)}
                                                                                disabled={submittingReply || !replyContent.trim()}
                                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                                            >
                                                                                <Send className="w-3 h-3" />
                                                                                {submittingReply ? '작성 중...' : '답글 작성'}
                                                                            </button>
                                                                            <button
                                                                                onClick={closeReplyForm}
                                                                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all duration-200"
                                                                            >
                                                                                취소
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* 답글 목록 */}
                                                                {commentReplies.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <button
                                                                            onClick={() => toggleReplies(comment.id)}
                                                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-3"
                                                                        >
                                                                            {isExpanded ? (
                                                                                <ChevronUp className="w-4 h-4" />
                                                                            ) : (
                                                                                <ChevronDown className="w-4 h-4" />
                                                                            )}
                                                                            <span className="text-sm font-medium">
                                                                                {isExpanded ? '답글 숨기기' : `답글 ${commentReplies.length}개 보기`}
                                                                            </span>
                                                                        </button>

                                                                        {isExpanded && (
                                                                            <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                                                                                {commentReplies.map((reply) => (
                                                                                    <div key={reply.id} className="flex gap-3">
                                                                                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                                            {reply.user_profiles.profile_image ? (
                                                                                                <Image
                                                                                                    src={reply.user_profiles.profile_image}
                                                                                                    alt={reply.user_profiles.nickname}
                                                                                                    fill
                                                                                                    className="object-cover"
                                                                                                />
                                                                                            ) : (
                                                                                                <span className="text-white text-xs font-bold">
                                                                                                    {reply.user_profiles.nickname.charAt(0).toUpperCase()}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex-1">
                                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                                <span className="font-semibold text-slate-900 text-sm">{reply.user_profiles.nickname}</span>
                                                                                                <span className="text-xs text-slate-400">•</span>
                                                                                                <span className="text-xs text-slate-500">{formatDate(reply.created_at)}</span>
                                                                                                {reply.user_profiles.role === 'admin' && (
                                                                                                    <span className="px-1 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                                                                                        관리자
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                            <p className="text-slate-700 text-sm leading-relaxed mb-2 whitespace-pre-wrap">{reply.content}</p>
                                                                                            <div className="flex items-center gap-3">
                                                                                                <button
                                                                                                    onClick={() => handleLikeComment(reply.id)}
                                                                                                    className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors duration-200"
                                                                                                >
                                                                                                    <Heart className="w-3 h-3" />
                                                                                                    <span className="text-xs font-medium">{reply.likes_count}</span>
                                                                                                </button>
                                                                                                {user && user.id === reply.user_id && (
                                                                                                    <>
                                                                                                        <button
                                                                                                            onClick={() => {
                                                                                                                setEditingComment(reply.id);
                                                                                                                setEditCommentContent(reply.content);
                                                                                                            }}
                                                                                                            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors duration-200"
                                                                                                        >
                                                                                                            <Edit3 className="w-3 h-3" />
                                                                                                            <span className="text-xs font-medium">수정</span>
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={() => handleDeleteComment(reply.id)}
                                                                                                            className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors duration-200"
                                                                                                        >
                                                                                                            <Trash2 className="w-3 h-3" />
                                                                                                            <span className="text-xs font-medium">삭제</span>
                                                                                                        </button>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}