'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { MessageCircle, ChevronDown, ChevronUp, Reply, Edit3, ThumbsUp, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
    id: number;
    content: string;
    created_at: string;
    updated_at?: string;
    user: {
        id: string;
        nickname: string;
        profile_image?: string;
    };
    likes_count: number;
    parent_id?: number;
    replies?: Comment[];
}

interface CommentSystemProps {
    postType: 'project' | 'activity' | 'resource';
    postId: number;
}

export default function CommentSystem({ postType, postId }: CommentSystemProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState<{ [key: number]: boolean }>({});
    const [editingComment, setEditingComment] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [commentLikes, setCommentLikes] = useState<{ [key: number]: boolean }>({});
    const { user } = useAuth();
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/comments/${postType}/${postId}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments || []);
            }
        } catch {
            // 댓글 조회 오류 시 무시
        } finally {
            setLoading(false);
        }
    }, [postType, postId]);

    // 댓글 목록 조회
    useEffect(() => {
        fetchComments();
    }, [postType, postId, fetchComments]);

    // 좋아요 상태 확인
    const checkLikeStatus = useCallback(async (commentId: number) => {
        if (!user) return false;

        try {
            const response = await fetch(`/api/comments/${postType}/${postId}/${commentId}/like`);
            if (response.ok) {
                const data = await response.json();
                return data.isLiked;
            }
        } catch {
            // 오류 시 무시
        }
        return false;
    }, [postType, postId, user]);

    // 모든 댓글의 좋아요 상태 확인
    const fetchAllLikeStatuses = useCallback(async () => {
        if (!user) return;

        const allCommentIds = [
            ...comments.map(c => c.id),
            ...comments.flatMap(c => c.replies?.map(r => r.id) || [])
        ];

        const likeStatuses: { [key: number]: boolean } = {};

        for (const commentId of allCommentIds) {
            const isLiked = await checkLikeStatus(commentId);
            likeStatuses[commentId] = isLiked;
        }

        setCommentLikes(likeStatuses);
    }, [comments, checkLikeStatus, user]);

    // 댓글 로드 후 좋아요 상태 확인
    useEffect(() => {
        if (comments.length > 0) {
            fetchAllLikeStatuses();
        }
    }, [comments, fetchAllLikeStatuses]);

    // 댓글 작성
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!newComment.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/comments/${postType}/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newComment.trim()
                }),
            });

            if (response.ok) {
                // 댓글 새로고침으로 새 댓글 추가
                fetchComments();
                setNewComment('');
            } else {
                alert('댓글 작성에 실패했습니다.');
            }
        } catch {
            alert('댓글 작성 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
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
            const response = await fetch(`/api/comments/${postType}/${postId}`, {
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
                // 댓글 새로고침으로 새 답글 추가
                fetchComments();
                setReplyContent('');
                setReplyTo(null);
            } else {
                alert('답글 작성에 실패했습니다.');
            }
        } catch {
            alert('답글 작성 중 오류가 발생했습니다.');
        } finally {
            setSubmittingReply(false);
        }
    };

    // 댓글 좋아요
    const handleCommentLike = async (commentId: number) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`/api/comments/${postType}/${postId}/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                // 좋아요 상태 업데이트
                setCommentLikes(prev => ({
                    ...prev,
                    [commentId]: data.isLiked
                }));
                // 댓글 새로고침으로 좋아요 수 업데이트
                fetchComments();
            }
        } catch {
            // 댓글 좋아요 오류 시 무시
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
            if (replyTextareaRef.current) {
                replyTextareaRef.current.focus();
            }
        }, 100);
    };

    // 답글 폼 닫기
    const closeReplyForm = () => {
        setReplyTo(null);
        setReplyContent('');
    };

    // 댓글 수정 시작
    const startEditComment = (commentId: number, currentContent: string) => {
        setEditingComment(commentId);
        setEditContent(currentContent);
    };

    // 댓글 수정 취소
    const cancelEditComment = () => {
        setEditingComment(null);
        setEditContent('');
    };

    // 댓글 수정 제출
    const handleEditComment = async (commentId: number) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (!editContent.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        setSubmittingEdit(true);
        try {
            const response = await fetch(`/api/comments/${postType}/${postId}/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editContent.trim()
                }),
            });

            if (response.ok) {
                setEditingComment(null);
                setEditContent('');
                fetchComments();
            } else {
                alert('댓글 수정에 실패했습니다.');
            }
        } catch {
            alert('댓글 수정 중 오류가 발생했습니다.');
        } finally {
            setSubmittingEdit(false);
        }
    };

    // 댓글과 답글 분리
    const parentComments = comments.filter(comment => !comment.parent_id);
    const totalComments = parentComments.length;

    const formatDate = (dateString: string, isEdited?: boolean) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const formattedDate = `${year}.${month}.${day} ${hours}:${minutes}`;
        return isEdited ? `${formattedDate} (수정됨)` : formattedDate;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-6">
                {totalComments > 0 ? `댓글 ${totalComments}개` : '댓글'}
            </h3>

            {/* 댓글 작성 안내 문구 */}
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-600 text-sm">
                        댓글 및 답글은 수정이 불가능하니 신중하게 작성해주세요.
                    </span>
                </div>
            </div>

            {/* 댓글 작성 폼 */}
            <div className="mb-8">
                <form onSubmit={handleSubmitComment} className="space-y-4">
                    <div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 작성해주세요..."
                            className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            rows={4}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="px-3 md:px-4 py-1.5 md:py-1.5 bg-purple-600 text-white rounded-lg text-sm md:text-sm font-medium hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            {submitting ? '작성 중...' : '댓글 작성'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-6">
                {parentComments.map((comment) => {
                    const commentReplies = comment.replies || [];
                    const isExpanded = expandedReplies[comment.id];

                    return (
                        <div key={comment.id} className="border-b border-slate-100 pb-6">
                            {/* 댓글 */}
                            <div className="flex gap-4">
                                {/* 프로필 이미지 */}
                                <div className="relative w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {comment.user.profile_image ? (
                                        <Image
                                            src={comment.user.profile_image}
                                            alt={comment.user.nickname}
                                            fill
                                            className="object-cover rounded-full"
                                        />
                                    ) : (
                                        <span className="text-slate-600 text-sm font-bold">
                                            {comment.user.nickname.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* 댓글 내용 */}
                                <div className="flex-1">
                                    <div className="mb-2">
                                        <div className="font-semibold text-slate-900">{comment.user.nickname}</div>
                                        <div className="text-sm text-slate-500">
                                            {formatDate(comment.updated_at || comment.created_at, !!comment.updated_at)}
                                        </div>
                                    </div>

                                    {editingComment === comment.id ? (
                                        <div className="mb-3">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                rows={3}
                                                placeholder="댓글을 수정하세요..."
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleEditComment(comment.id)}
                                                    disabled={submittingEdit || !editContent.trim()}
                                                    className="px-3 md:px-3.5 lg:px-4 py-1.5 md:py-1.5 lg:py-2 bg-purple-600 text-white rounded-lg text-xs md:text-sm lg:text-sm font-medium hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {submittingEdit ? '수정 중...' : '수정 완료'}
                                                </button>
                                                <button
                                                    onClick={cancelEditComment}
                                                    className="px-3 md:px-3.5 lg:px-4 py-1.5 md:py-1.5 lg:py-2 bg-slate-100 text-slate-600 rounded-lg text-xs md:text-sm lg:text-sm font-medium hover:bg-slate-200 transition-all duration-200"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-700 text-sm sm:text-base mb-3 leading-relaxed">{comment.content}</p>
                                    )}

                                    {/* 댓글 액션 */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleCommentLike(comment.id)}
                                            className={`flex items-center gap-1 transition-colors duration-200 ${commentLikes[comment.id]
                                                ? 'text-red-500'
                                                : 'text-slate-600 hover:text-red-500'
                                                }`}
                                        >
                                            <ThumbsUp className={`w-4 h-4 ${commentLikes[comment.id] ? 'fill-current' : ''}`} />
                                            <span className="text-sm font-medium">{comment.likes_count}</span>
                                        </button>

                                        <button
                                            onClick={() => openReplyForm(comment.id)}
                                            className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1 md:py-1 lg:py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                                        >
                                            <Reply className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                                            <span className="hidden md:inline text-xs lg:text-sm font-semibold">답글 작성하기</span>
                                        </button>

                                        {user && user.id === comment.user.id && editingComment !== comment.id && (
                                            <button
                                                onClick={() => startEditComment(comment.id, comment.content)}
                                                className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1 md:py-1 lg:py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                                            >
                                                <Edit3 className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                                                <span className="hidden md:inline text-xs lg:text-sm font-semibold">댓글 수정하기</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* 답글 폼 */}
                                    {replyTo === comment.id && (
                                        <div className="mt-4 pl-4 border-l-2 border-purple-200">
                                            <textarea
                                                ref={replyTextareaRef}
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="답글을 작성해주세요..."
                                                className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                                rows={3}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleSubmitReply(comment.id)}
                                                    disabled={submittingReply || !replyContent.trim()}
                                                    className="px-3 md:px-3.5 py-1.5 md:py-1.5 bg-purple-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {submittingReply ? '작성 중...' : '답글 작성'}
                                                </button>
                                                <button
                                                    onClick={closeReplyForm}
                                                    className="px-3 md:px-3.5 py-1.5 md:py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-200 transition-all duration-200"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 답글 목록 */}
                                    {commentReplies.length > 0 && (
                                        <div className="mt-4">
                                            <div className="flex justify-start md:justify-start">
                                                <button
                                                    onClick={() => toggleReplies(comment.id)}
                                                    className="flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors duration-200 mb-3"
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
                                            </div>

                                            {isExpanded && (
                                                <div className="space-y-4 pl-4 border-l-2 border-purple-100">
                                                    {commentReplies.map((reply) => (
                                                        <div key={reply.id} className="flex gap-3">
                                                            <div className="relative w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                {reply.user.profile_image ? (
                                                                    <Image
                                                                        src={reply.user.profile_image}
                                                                        alt={reply.user.nickname}
                                                                        fill
                                                                        className="object-cover rounded-full"
                                                                    />
                                                                ) : (
                                                                    <span className="text-slate-600 text-xs font-bold">
                                                                        {reply.user.nickname.charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="mb-1">
                                                                    <div className="font-semibold text-slate-900 text-sm">{reply.user.nickname}</div>
                                                                    <div className="text-xs text-slate-500">
                                                                        {formatDate(reply.updated_at || reply.created_at, !!reply.updated_at)}
                                                                    </div>
                                                                </div>

                                                                {editingComment === reply.id ? (
                                                                    <div className="mb-2">
                                                                        <textarea
                                                                            value={editContent}
                                                                            onChange={(e) => setEditContent(e.target.value)}
                                                                            className="w-full p-2 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                                                            rows={2}
                                                                            placeholder="답글을 수정하세요..."
                                                                        />
                                                                        <div className="flex gap-2 mt-1">
                                                                            <button
                                                                                onClick={() => handleEditComment(reply.id)}
                                                                                disabled={submittingEdit || !editContent.trim()}
                                                                                className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                {submittingEdit ? '수정 중...' : '수정 완료'}
                                                                            </button>
                                                                            <button
                                                                                onClick={cancelEditComment}
                                                                                className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium hover:bg-slate-200 transition-all duration-200"
                                                                            >
                                                                                취소
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-2">{reply.content}</p>
                                                                )}

                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => handleCommentLike(reply.id)}
                                                                        className={`flex items-center gap-1 transition-colors duration-200 ${commentLikes[reply.id]
                                                                            ? 'text-red-500'
                                                                            : 'text-slate-600 hover:text-red-500'
                                                                            }`}
                                                                    >
                                                                        <ThumbsUp className={`w-3 h-3 ${commentLikes[reply.id] ? 'fill-current' : ''}`} />
                                                                        <span className="text-xs font-medium">{reply.likes_count}</span>
                                                                    </button>

                                                                    {user && user.id === reply.user.id && editingComment !== reply.id && (
                                                                        <button
                                                                            onClick={() => startEditComment(reply.id, reply.content)}
                                                                            className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors duration-200"
                                                                        >
                                                                            <Edit3 className="w-3 h-3" />
                                                                            <span className="hidden md:inline text-xs font-semibold">답글 수정하기</span>
                                                                        </button>
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
                })}
            </div>

            {totalComments === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                </div>
            )}
        </div>
    );
}
