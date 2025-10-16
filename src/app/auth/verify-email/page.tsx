'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const isExistingAccount = searchParams.get('existing') === 'true';
    const conflictType = searchParams.get('conflict') || '';

    const [isVerified] = useState(false);
    const [error] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    // 페이지 로드 시 이메일 확인 안내
    useEffect(() => {
        if (email) {
        }
    }, [email]);

    // 이메일 재전송 함수
    const handleResendEmail = async () => {
        if (!email) return;

        setIsResending(true);
        setResendMessage('');

        try {
            const response = await fetch('/api/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setResendMessage('이메일이 재전송되었습니다. 수신함을 확인해주세요.');
            } else {
                setResendMessage(`오류: ${data.error}`);
            }
        } catch {
            setResendMessage('이메일 재전송 중 오류가 발생했습니다.');
        } finally {
            setIsResending(false);
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            인증 완료!
                        </h1>
                        <p className="text-slate-600 mb-6">
                            이메일 인증이 성공적으로 완료되었습니다.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                            로그인 페이지로 이동 중...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* 네비게이션 버튼들 */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/auth/register"
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        회원가입으로 돌아가기
                    </Link>

                    <Link
                        href="/auth/login"
                        className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
                    >
                        로그인
                    </Link>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                    {/* 로고 및 제목 */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            이메일 인증
                        </h1>
                        <p className="text-slate-600">
                            회원가입을 완료하기 위해 이메일 인증이 필요합니다
                        </p>
                    </div>

                    {/* 이메일 주소 표시 */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-slate-600 mb-1">인증 이메일이 발송된 주소</p>
                        <p className="font-medium text-slate-900">{email}</p>
                        {isExistingAccount && (
                            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs text-amber-700">
                                    {conflictType === 'student_id'
                                        ? '기존 미인증 계정(학번)을 업데이트했습니다. 이메일 인증을 완료해주세요.'
                                        : '기존 미인증 계정을 업데이트했습니다. 이메일 인증을 완료해주세요.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Supabase 인증 안내 */}
                    <div className="space-y-4">
                        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                이메일 인증 링크를 확인하세요
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                {email}로 발송된 인증 이메일의 링크를 클릭하여 계정을 활성화해주세요.
                            </p>
                            <div className="text-xs text-slate-500 mb-4">
                                이메일이 보이지 않는다면 스팸 폴더를 확인해보세요.
                            </div>

                            {/* 이메일 재전송 버튼 */}
                            <button
                                onClick={handleResendEmail}
                                disabled={isResending}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {isResending ? '재전송 중...' : '이메일 재전송'}
                            </button>

                            {/* 재전송 메시지 */}
                            {resendMessage && (
                                <div className={`text-sm p-3 rounded-lg mt-4 ${resendMessage.includes('오류')
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                                    }`}>
                                    {resendMessage}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* 안내 메시지 */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 text-xs font-bold">!</span>
                            </div>
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-1">인증 완료 후</p>
                                <p>이메일의 링크를 클릭하면 자동으로 로그인 페이지로 이동합니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        }>
            <VerifyEmailForm />
        </Suspense>
    );
}