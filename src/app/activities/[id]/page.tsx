'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Eye, Heart, MessageCircle, Share2, Pin, Tag, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// 임시 데이터 (실제로는 API에서 가져올 데이터)
const mockPost = {
    id: 1,
    title: "2024년 1학기 정기 세미나 - AI와 머신러닝의 최신 동향",
    content: `인공지능과 머신러닝 분야의 최신 연구 동향과 실제 적용 사례에 대해 함께 논의하는 시간을 가집니다.

## 세미나 개요
- **일시**: 2024년 3월 15일 (금) 오후 2시
- **장소**: 공과대학 3호관 101호
- **주제**: AI와 머신러닝의 최신 동향
- **발표자**: 김아치 (인공지능공학부 교수)

## 주요 내용
1. **딥러닝의 최신 발전사항**
   - Transformer 아키텍처의 발전
   - Vision Transformer (ViT)의 응용
   - 자연어 처리의 새로운 패러다임

2. **실제 적용 사례**
   - 의료 분야 AI 응용
   - 자율주행 기술의 현황
   - 금융 서비스의 AI 활용

3. **향후 전망**
   - AI 윤리와 사회적 영향
   - 연구 방향과 기회

## 참가 방법
- 사전 등록: 3월 10일까지
- 문의: archsemtle@kmou.ac.kr
- 참가비: 무료

많은 관심과 참여 부탁드립니다!`,
    author: "김아치",
    authorRole: "회장",
    date: "2024-03-15",
    views: 156,
    likes: 23,
    comments: 8,
    category: "세미나",
    isPinned: true,
    tags: ["AI", "머신러닝", "세미나", "딥러닝", "연구동향"],
    location: "공과대학 3호관 101호",
    time: "오후 2시",
    contact: "archsemtle@kmou.ac.kr"
};

export default function ActivityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState(mockPost);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.content.substring(0, 100) + '...',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 클립보드에 복사되었습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* 배경 패턴 */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10"></div>

                <div className="relative py-20 pt-24">
                    <div className="max-w-4xl mx-auto px-6">
                        {/* 뒤로 가기 버튼 */}
                        <button
                            onClick={() => router.back()}
                            className="mb-8 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 text-slate-700 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            뒤로 가기
                        </button>

                        {/* 카테고리 및 고정 표시 */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold text-sm">
                                {post.category}
                            </div>
                            {post.isPinned && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                                    <Pin className="w-4 h-4 fill-amber-500" />
                                    고정
                                </div>
                            )}
                        </div>

                        {/* 제목 */}
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {/* 메타 정보 */}
                        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <span className="font-medium">{post.author}</span>
                                <span className="text-sm">({post.authorRole})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                <span>{post.views} 조회</span>
                            </div>
                            {post.location && (
                                <div className="flex items-center gap-2">
                                    <Pin className="w-5 h-5" />
                                    <span>{post.location}</span>
                                </div>
                            )}
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isLiked
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : 'bg-white/50 text-slate-700 border border-white/30 hover:bg-white/70'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                                {post.likes + (isLiked ? 1 : 0)}
                            </button>
                            <button
                                onClick={handleBookmark}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isBookmarked
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-white/50 text-slate-700 border border-white/30 hover:bg-white/70'
                                    }`}
                            >
                                <Pin className={`w-5 h-5 ${isBookmarked ? 'fill-blue-500' : ''}`} />
                                북마크
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-6 py-3 bg-white/50 text-slate-700 border border-white/30 rounded-xl font-medium hover:bg-white/70 transition-all duration-200"
                            >
                                <Share2 className="w-5 h-5" />
                                공유
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* 메인 콘텐츠 */}
                        <div className="lg:col-span-3">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                                {/* 태그 */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {post.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors duration-200"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* 본문 내용 */}
                                <div className="prose prose-slate max-w-none">
                                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                        {post.content}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 사이드바 */}
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                {/* 통계 카드 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">통계</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">조회수</span>
                                            <span className="font-bold text-slate-900">{post.views}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">좋아요</span>
                                            <span className="font-bold text-slate-900">{post.likes}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">댓글</span>
                                            <span className="font-bold text-slate-900">{post.comments}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 작성자 정보 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">작성자</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                            {post.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{post.author}</div>
                                            <div className="text-sm text-slate-500">{post.authorRole}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 관련 정보 */}
                                {post.location && (
                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4">상세 정보</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Pin className="w-4 h-4" />
                                                <span>{post.location}</span>
                                            </div>
                                            {post.time && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{post.time}</span>
                                                </div>
                                            )}
                                            {post.contact && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span className="text-sm">{post.contact}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
