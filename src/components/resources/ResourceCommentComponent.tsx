'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ResourcePost } from '@/types/resource';
import { Heart, MessageCircle, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ResourceComment {
    id: number;
    content: string;
    created_at: string;
    author: {
        id: string;
        nickname: string;
        name: string;
        profile_image?: string;
        role: string;
    };
    likes_count: number;
    parent_id?: number;
    replies?: ResourceComment[];
}

interface CommentComponentProps {
    resource: ResourcePost;
}

export default function CommentComponent({ resource }: CommentComponentProps) {
    const [comments, setComments] = useState<ResourceComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState<{ [key: number]: boolean }>({});
    const { user } = useAuth();
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/resources/${resource.id}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments || []);
            }
        } catch {
            // 댓글 조회 오류 시 무시
        } finally {
            setLoading(false);
        }
    }, [resource.id]);

    // 댓글 목록 조회
    useEffect(() => {
        fetchComments();
    }, [resource.id, fetchComments]);

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
            const response = await fetch(`/api/resources/${resource.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newComment.trim()
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments(prev => [...prev, data.comment]);
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
            const response = await fetch(`/api/resources/${resource.id}/comments`, {
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
            } else {
                alert('답글 작성에 실패했습니다.');
            }
        } catch (error) {
            console.error('답글 작성 오류:', error);
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
            const response = await fetch(`/api/comments/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setComments(prev => prev.map(comment =>
                    comment.id === commentId
                        ? { ...comment, likes_count: Math.max(0, data.likesCount) }
                        : comment
                ));
            }
        } catch (error) {
            console.error('댓글 좋아요 오류:', error);
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

    // 댓글 삭제
    const handleDeleteComment = async (commentId: number) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!confirm('댓글을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setComments(prev => prev.filter(comment => comment.id !== commentId));
            } else {
                alert('댓글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 삭제 오류:', error);
            alert('댓글 삭제 중 오류가 발생했습니다.');
        }
    };

    // 댓글과 답글 분리
    const parentComments = comments.filter(comment => !comment.parent_id);
    const replies = comments.filter(comment => comment.parent_id);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            <h3 className="text-2xl font-bold text-slate-900 mb-6">댓글 {comments.length}개</h3>

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
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {submitting ? '작성 중...' : '댓글 작성'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-6">
                {parentComments.map((comment) => {
                    const commentReplies = replies.filter(reply => reply.parent_id === comment.id);
                    const isExpanded = expandedReplies[comment.id];

                    return (
                        <div key={comment.id} className="border-b border-slate-100 pb-6">
                            {/* 댓글 */}
                            <div className="flex gap-4">
                                {/* 프로필 이미지 */}
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {comment.author.profile_image ? (
                                        <Image
                                            src={comment.author.profile_image}
                                            alt={comment.author.nickname}
                                            fill
                                            className="object-cover rounded-full"
                                        />
                                    ) : (
                                        <span className="text-white text-sm font-bold">
                                            {comment.author.nickname.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* 댓글 내용 */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-slate-900">{comment.author.nickname}</span>
                                        <span className="text-sm text-slate-500">{comment.author.name}</span>
                                        <span className="text-sm text-slate-400">•</span>
                                        <span className="text-sm text-slate-500">{formatDate(comment.created_at)}</span>
                                    </div>

                                    <p className="text-slate-700 mb-3 leading-relaxed">{comment.content}</p>

                                    {/* 댓글 액션 */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleCommentLike(comment.id)}
                                            className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors duration-200"
                                        >
                                            <Heart className="w-4 h-4" />
                                            <span className="text-sm font-medium">{comment.likes_count}</span>
                                        </button>

                                        <button
                                            onClick={() => openReplyForm(comment.id)}
                                            className="flex items-center gap-1 text-slate-600 hover:text-purple-600 transition-colors duration-200"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">답글</span>
                                        </button>

                                        {/* 삭제 버튼 (작성자만) */}
                                        {user && user.id === comment.author.id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">삭제</span>
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
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
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

                                            {isExpanded && (
                                                <div className="space-y-4 pl-4 border-l-2 border-purple-100">
                                                    {commentReplies.map((reply) => (
                                                        <div key={reply.id} className="flex gap-3">
                                                            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                {reply.author.profile_image ? (
                                                                    <Image
                                                                        src={reply.author.profile_image}
                                                                        alt={reply.author.nickname}
                                                                        fill
                                                                        className="object-cover rounded-full"
                                                                    />
                                                                ) : (
                                                                    <span className="text-white text-xs font-bold">
                                                                        {reply.author.nickname.charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-semibold text-slate-900 text-sm">{reply.author.nickname}</span>
                                                                    <span className="text-xs text-slate-500">{reply.author.name}</span>
                                                                    <span className="text-xs text-slate-400">•</span>
                                                                    <span className="text-xs text-slate-500">{formatDate(reply.created_at)}</span>
                                                                </div>
                                                                <p className="text-slate-700 text-sm leading-relaxed mb-2">{reply.content}</p>
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => handleCommentLike(reply.id)}
                                                                        className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors duration-200"
                                                                    >
                                                                        <Heart className="w-3 h-3" />
                                                                        <span className="text-xs font-medium">{reply.likes_count}</span>
                                                                    </button>

                                                                    {/* 답글 삭제 버튼 (작성자만) */}
                                                                    {user && user.id === reply.author.id && (
                                                                        <button
                                                                            onClick={() => handleDeleteComment(reply.id)}
                                                                            className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors duration-200"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                            <span className="text-xs font-medium">삭제</span>
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

            {comments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                </div>
            )}
        </div>
    );
}
