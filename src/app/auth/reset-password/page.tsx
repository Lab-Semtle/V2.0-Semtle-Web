'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Eye, EyeOff, Lock, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    // 회원가입과 동일한 비밀번호 검증 함수
    const validatePassword = (value: string) => {
        if (value.length < 8) {
            return "비밀번호는 8글자 이상이어야 합니다";
        }
        const hasLowerCase = /[a-z]/.test(value);
        const hasSpecialChar = /[!@#$%^&*]/.test(value);
        const hasInvalidChar = /[()]/.test(value);

        if (!hasLowerCase) {
            return "영어소문자를 포함해야 합니다";
        }
        if (!hasSpecialChar) {
            return "특수문자(!, @, #, $, %, ^, &, *)를 포함해야 합니다";
        }
        if (hasInvalidChar) {
            return "해킹위험이 의심되는 기호는 사용할 수 없습니다";
        }
        return null;
    };

    const validateConfirmPassword = (value: string) => {
        if (value !== newPassword) {
            return "비밀번호가 일치하지 않습니다";
        }
        return null;
    };

    // 비밀번호 입력 핸들러
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewPassword(value);
        const error = validatePassword(value);
        setValidationErrors(prev => ({ ...prev, password: error || '' }));

        // 비밀번호 확인도 다시 검증
        if (confirmPassword) {
            const confirmError = validateConfirmPassword(confirmPassword);
            setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError || '' }));
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        const error = validateConfirmPassword(value);
        setValidationErrors(prev => ({ ...prev, confirmPassword: error || '' }));
    };

    // 말풍선 컴포넌트 (회원가입과 동일)
    const Tooltip = ({ message, show }: { message: string; show: boolean }) => {
        if (!show || !message) return null;

        return (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg relative">
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                    <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {message}
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => {
        const handleHashChange = async () => {
            setLoading(true);
            setError(null);
            setMessage(null);

            const { data, error: getSessionError } = await supabase.auth.getSession();

            if (getSessionError) {
                setError('세션을 가져오는 데 실패했습니다. 다시 시도해주세요.');
                setLoading(false);
                return;
            }

            if (data.session) {
                setMessage('새 비밀번호를 설정해주세요.');
                setLoading(false);
            } else {
                setError('유효하지 않거나 만료된 비밀번호 재설정 링크입니다.');
                setLoading(false);
            }
        };

        // 페이지 로드 시 및 해시 변경 시 세션 확인
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const handlePasswordReset = async () => {
        setError(null);
        setMessage(null);

        if (!newPassword || !confirmPassword) {
            setError('새 비밀번호와 확인 비밀번호를 모두 입력해주세요.');
            return;
        }

        // 비밀번호 검증
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                setError(updateError.message || '비밀번호 재설정에 실패했습니다.');
            } else {
                setSuccess(true);
                setMessage('비밀번호가 성공적으로 재설정되었습니다. 설정 페이지로 이동합니다.');
                setTimeout(() => {
                    router.push('/settings');
                }, 3000);
            }
        } catch {
            setError('비밀번호 재설정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            비밀번호 재설정 완료!
                        </h1>
                        <p className="text-slate-600 mb-6">
                            비밀번호가 성공적으로 재설정되었습니다.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                            설정 페이지로 이동 중...
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
                        href="/settings"
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        설정으로 돌아가기
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
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            비밀번호 재설정
                        </h1>
                        <p className="text-slate-600">
                            새로운 비밀번호를 설정해주세요
                        </p>
                    </div>

                    {/* 메시지 표시 */}
                    {message && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-700">{message}</p>
                        </div>
                    )}

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* 비밀번호 입력 폼 */}
                    <div className="space-y-6">
                        {/* 새 비밀번호 입력 */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-3">
                                <span className="flex items-center gap-2">
                                    새 비밀번호
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                        필수
                                    </span>
                                </span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                                </div>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                                    placeholder="새 비밀번호를 입력하세요"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <Tooltip
                                    message={validationErrors.password || ''}
                                    show={!!validationErrors.password}
                                />
                            </div>
                        </div>

                        {/* 비밀번호 확인 입력 */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-3">
                                <span className="flex items-center gap-2">
                                    비밀번호 확인
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                        필수
                                    </span>
                                </span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                                    placeholder="비밀번호를 다시 입력하세요"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <Tooltip
                                    message={validationErrors.confirmPassword || ''}
                                    show={!!validationErrors.confirmPassword}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 비밀번호 재설정 버튼 */}
                    <button
                        onClick={handlePasswordReset}
                        disabled={loading || !newPassword || !confirmPassword || !!validationErrors.password || !!validationErrors.confirmPassword}
                        className="w-full mt-8 px-4 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                                재설정 중...
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4 mr-2 inline" />
                                비밀번호 재설정
                            </>
                        )}
                    </button>

                    {/* 안내 메시지 */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 text-xs font-bold">!</span>
                            </div>
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-1">비밀번호 규칙</p>
                                <p>8글자 이상, 영어소문자, 특수문자(!, @, #, $, %, ^, &, *) 포함</p>
                                <p className="text-xs mt-1">해킹위험이 의심되는 기호는 사용할 수 없습니다</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}