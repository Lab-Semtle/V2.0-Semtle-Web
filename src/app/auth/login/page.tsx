'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn } = useAuth();

    // URL 파라미터 확인
    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            setSuccessMessage('이메일 인증이 완료되었습니다. 이제 로그인하실 수 있습니다.');

            // URL에서 verified 파라미터 제거 (페이지 새로고침 시 메시지 재표시 방지)
            const url = new URL(window.location.href);
            url.searchParams.delete('verified');
            window.history.replaceState({}, '', url.toString());

            // 5초 후 메시지 자동 제거
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage(''); // 로그인 시도 시 성공 메시지 제거

        if (!email || !password) {
            setError('이메일과 비밀번호를 입력해주세요.');
            setLoading(false);
            return;
        }

        try {
            console.log('🖱️ LoginPage: 로그인 버튼 클릭', { email });

            // 타임아웃 설정 (15초)
            const loginPromise = signIn(email, password);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('로그인 시간이 초과되었습니다.')), 15000)
            );

            console.log('⏱️ LoginPage: 로그인 요청 시작 (15초 타임아웃)');
            const { error } = await Promise.race([loginPromise, timeoutPromise]) as any;

            console.log('📊 LoginPage: 로그인 결과 수신', {
                hasError: !!error,
                errorMessage: error?.message
            });

            if (error) {
                console.error('❌ LoginPage: 로그인 실패', {
                    message: error.message,
                    code: error.code,
                    status: error.status
                });

                if (error.message.includes('Email not confirmed')) {
                    setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
                } else if (error.message.includes('Invalid login credentials')) {
                    setError('이메일 또는 비밀번호가 올바르지 않습니다.');
                } else if (error.message.includes('로그인 시간이 초과')) {
                    setError('로그인 시간이 초과되었습니다. 다시 시도해주세요.');
                } else {
                    setError(error.message || '로그인 중 오류가 발생했습니다.');
                }
            } else {
                console.log('✅ LoginPage: 로그인 성공, 메인 페이지로 리다이렉트');
                // 로그인 성공 시 메인 페이지로 이동
                router.push('/');
            }
        } catch (error) {
            console.error('💥 LoginPage: 예외 발생', error);
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            console.log('🏁 LoginPage: 로그인 프로세스 완료, 로딩 상태 해제');
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
                        <div className="text-center mb-6 sm:mb-8">
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

                        {/* 네비게이션 버튼 */}
                        <div className="mb-8 flex justify-between items-center">
                            <Link
                                href="/"
                                className="inline-flex items-center space-x-2 px-4 py-2 text-slate-500 hover:text-slate-700 rounded-xl transition-all duration-200 text-sm hover:bg-slate-50/50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>홈으로 돌아가기</span>
                            </Link>
                            <Link
                                href="/auth/register"
                                className="group inline-flex items-center justify-center px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm"
                            >
                                회원가입
                            </Link>
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
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-12 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                            placeholder="비밀번호를 입력하세요"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* 성공 메시지 */}
                                {successMessage && (
                                    <div className="text-green-600 text-xs bg-green-50 border border-green-200 rounded-xl p-3 flex items-center animate-fade-in-up">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                        {successMessage}
                                    </div>
                                )}

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
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
