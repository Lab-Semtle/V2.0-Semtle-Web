'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // TODO: 실제 인증 로직 구현
            await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 딜레이

            // 임시 성공 처리
            if (email && password) {
                router.push('/dashboard');
            } else {
                setError('이메일과 비밀번호를 입력해주세요.');
            }
        } catch (error) {
            setError('로그인 중 오류가 발생했습니다.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* 배경 이미지 */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero/kmou_fall.jpg"
                    alt="KMOU Fall Background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/90 backdrop-blur-sm"></div>
            </div>

            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            {/* 스크롤되는 내용 */}
            <div className="relative z-10">
                <main className="flex items-center justify-center min-h-screen p-4 sm:p-6">
                    <div className="w-full max-w-sm sm:max-w-md">
                        {/* 로고 */}
                        <div className="text-center mb-8 sm:mb-10">
                            <Link
                                href="/"
                                className="font-dunggeunmo flex items-center justify-center space-x-2 sm:space-x-3 text-2xl sm:text-3xl font-bold text-slate-900 mb-2 hover:opacity-80 transition-opacity duration-200 drop-shadow-lg"
                            >
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                                    <Image
                                        src="/logo/semtle-logo-bg-square-v2022.png"
                                        alt="SEMTLE Logo"
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <span>아치셈틀</span>
                            </Link>
                            <p className="text-slate-600 text-sm sm:text-base font-medium">Archi Semtle Lab</p>
                        </div>

                        {/* 로그인 폼 */}
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-xl">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-4">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                    로그인
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">환영합니다</h1>
                                <p className="text-slate-600 text-sm sm:text-base">아치셈틀에 오신 것을 환영합니다</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                                {/* 이메일 입력 */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-2">
                                        이메일
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-3 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                            placeholder="이메일을 입력하세요"
                                        />
                                    </div>
                                </div>

                                {/* 비밀번호 입력 */}
                                <div>
                                    <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-2">
                                        비밀번호
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-3 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                            placeholder="비밀번호를 입력하세요"
                                        />
                                    </div>
                                </div>

                                {/* 에러 메시지 */}
                                {error && (
                                    <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl p-3 flex items-center animate-fade-in-up">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                                        {error}
                                    </div>
                                )}

                                {/* 로그인 버튼 */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-slate-900/20 transform hover:-translate-y-0.5 overflow-hidden text-sm"
                                >
                                    <span className="relative z-10">
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                로그인 중...
                                            </div>
                                        ) : (
                                            '로그인'
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                </button>
                            </form>

                            {/* 회원가입 링크 */}
                            <div className="mt-6 sm:mt-8 text-center">
                                <p className="text-slate-600 text-xs mb-3">
                                    아직 계정이 없으신가요?
                                </p>
                                <Link
                                    href="/auth/register"
                                    className="group inline-flex items-center justify-center px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm"
                                >
                                    회원가입
                                </Link>
                            </div>

                            {/* 홈으로 돌아가기 */}
                            <div className="mt-6 text-center">
                                <Link
                                    href="/"
                                    className="inline-flex items-center space-x-1.5 px-3 py-2 text-slate-500 hover:text-slate-700 rounded-lg transition-all duration-200 text-xs hover:bg-slate-50/50"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    <span>홈으로 돌아가기</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
