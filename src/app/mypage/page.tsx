'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Bell, Trophy, Code, FileText, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyPage() {
    const { user, profile } = useAuth();
    const router = useRouter();

    if (!user || !profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">사용자 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* 배경 패턴 */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-indigo-100/30"></div>

                <div className="relative container mx-auto px-4 py-20 pt-24">
                    {/* 뒤로 가기 버튼 */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-slate-700 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-medium">뒤로 가기</span>
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        {/* 왼쪽 - 사용자 정보 */}
                        <div className="flex items-center space-x-8">
                            {/* 프로필 아바타 */}
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                            </div>

                            {/* 사용자 정보 */}
                            <div className="text-slate-800">
                                <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    {profile.name || '사용자'}
                                </h1>
                                <p className="text-slate-600 text-xl mb-2 font-medium">{profile.email}</p>
                                <div className="flex items-center gap-4 text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-sm">온라인</span>
                                    </div>
                                    <span className="text-sm">가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽 - 통계 정보 */}
                        <div className="flex flex-wrap gap-6 lg:gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-800 mb-1">12</div>
                                <div className="text-slate-600 text-sm font-medium">게시물</div>
                            </div>
                            <div className="w-px h-12 bg-slate-300 hidden lg:block"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-800 mb-1">24</div>
                                <div className="text-slate-600 text-sm font-medium">댓글</div>
                            </div>
                            <div className="w-px h-12 bg-slate-300 hidden lg:block"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-800 mb-1">156</div>
                                <div className="text-slate-600 text-sm font-medium">좋아요</div>
                            </div>
                            <div className="w-px h-12 bg-slate-300 hidden lg:block"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-800 mb-1">2.8K</div>
                                <div className="text-slate-600 text-sm font-medium">조회수</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-10 pt-32 pb-32">


                {/* 내가 작성한 글 관리 섹션 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* 프로젝트 글 관리 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Code className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">프로젝트 글</h3>
                                    <p className="text-sm text-slate-600">작성한 프로젝트 글 관리</p>
                                </div>
                            </div>
                            <Link
                                href="/projects/my-posts"
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 font-medium"
                            >
                                전체보기
                            </Link>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-medium text-slate-900">AI 챗봇 프로젝트</span>
                                </div>
                                <span className="text-sm text-slate-500">2일 전</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-medium text-slate-900">웹 개발 프로젝트</span>
                                </div>
                                <span className="text-sm text-slate-500">1주 전</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="font-medium text-slate-900">모바일 앱 개발</span>
                                </div>
                                <span className="text-sm text-slate-500">2주 전</span>
                            </div>
                        </div>
                    </div>

                    {/* 자료실 글 관리 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">자료실 글</h3>
                                    <p className="text-sm text-slate-600">작성한 자료실 글 관리</p>
                                </div>
                            </div>
                            <Link
                                href="/resources/my-posts"
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200 font-medium"
                            >
                                전체보기
                            </Link>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-medium text-slate-900">React 가이드</span>
                                </div>
                                <span className="text-sm text-slate-500">3일 전</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-medium text-slate-900">Python 튜토리얼</span>
                                </div>
                                <span className="text-sm text-slate-500">1주 전</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="font-medium text-slate-900">데이터베이스 설계</span>
                                </div>
                                <span className="text-sm text-slate-500">2주 전</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* 최근 활동 섹션 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">최근 활동</h3>
                                <p className="text-sm text-slate-600">최근 7일간의 활동 내역</p>
                            </div>
                        </div>
                        <Link
                            href="/activities"
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-all duration-200 font-medium"
                        >
                            전체보기
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Code className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">새 프로젝트 글을 작성했습니다</p>
                                <p className="text-sm text-slate-500">AI 챗봇 프로젝트 • 2일 전</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">자료실에 새 자료를 업로드했습니다</p>
                                <p className="text-sm text-slate-500">React 가이드 • 3일 전</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Bell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">댓글을 작성했습니다</p>
                                <p className="text-sm text-slate-500">웹 개발 프로젝트 • 4일 전</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
