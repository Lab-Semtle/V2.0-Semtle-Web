'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, ArrowLeft, Check, Eye, EyeOff, Calendar, Hash, UserCheck, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        studentId: '',
        nickname: '',
        birthDate: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    // 단계별 필드 정의
    const stepFields = [
        'studentId',
        'nickname',
        'birthDate',
        'name',
        'email',
        'password'
    ];

    // 입력 규칙 검증 함수들
    const validateStudentId = (value: string) => {
        const numericRegex = /^[0-9]+$/;
        if (!numericRegex.test(value)) {
            return "숫자만 입력 가능합니다";
        }
        if (value.length !== 8) {
            return "학번은 8글자여야 합니다";
        }
        return null;
    };

    const validateNickname = (value: string) => {
        const nicknameRegex = /^[a-z0-9._-]+$/;
        if (!nicknameRegex.test(value)) {
            return "영어소문자, 숫자, '_', '-', '.' 만 사용 가능합니다";
        }
        return null;
    };

    const validateName = (value: string) => {
        const nameRegex = /^[가-힣a-zA-Z]+$/;
        if (!nameRegex.test(value)) {
            return "한글, 영어만 입력 가능합니다";
        }
        return null;
    };

    const validateEmail = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return "올바른 이메일 형식을 입력해주세요";
        }
        return null;
    };

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
        if (value !== formData.password) {
            return "비밀번호가 일치하지 않습니다";
        }
        return null;
    };

    // 입력 제한 함수들
    const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericRegex = /^[0-9]*$/;
        if (numericRegex.test(value) && value.length <= 8) {
            setFormData(prev => ({ ...prev, studentId: value }));
            const error = validateStudentId(value);
            setValidationErrors(prev => ({ ...prev, studentId: error || '' }));
        }
    };

    const handleNicknameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // 허용된 키들: 백스페이스, 델리트, 탭, 엔터, 화살표 키들
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

        if (allowedKeys.includes(e.key)) {
            return; // 허용된 키는 통과
        }

        // 허용된 문자들만 입력 가능
        const allowedCharRegex = /^[a-z0-9._-]$/;
        if (!allowedCharRegex.test(e.key.toLowerCase())) {
            e.preventDefault(); // 입력 차단
            // 일시적으로 말풍선 표시
            setValidationErrors(prev => ({ ...prev, nickname: "영어소문자, 숫자, '_', '-', '.' 만 사용 가능합니다" }));
            setTimeout(() => {
                setValidationErrors(prev => ({ ...prev, nickname: '' }));
            }, 2000);
        }
    };

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase(); // 소문자로 변환
        setFormData(prev => ({ ...prev, nickname: value }));
        const error = validateNickname(value);
        setValidationErrors(prev => ({ ...prev, nickname: error || '' }));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const nameRegex = /^[가-힣a-zA-Z]*$/;
        if (nameRegex.test(value)) {
            setFormData(prev => ({ ...prev, name: value }));
            const error = validateName(value);
            setValidationErrors(prev => ({ ...prev, name: error || '' }));
        } else {
            // 잘못된 입력 시 일시적으로 말풍선 표시
            setValidationErrors(prev => ({ ...prev, name: "한글, 영어만 입력 가능합니다" }));
            setTimeout(() => {
                setValidationErrors(prev => ({ ...prev, name: '' }));
            }, 2000);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, email: value }));
        const error = validateEmail(value);
        setValidationErrors(prev => ({ ...prev, email: error || '' }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, password: value }));
        const error = validatePassword(value);
        setValidationErrors(prev => ({ ...prev, password: error || '' }));

        // 비밀번호 확인도 다시 검증
        if (formData.confirmPassword) {
            const confirmError = validateConfirmPassword(formData.confirmPassword);
            setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError || '' }));
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, confirmPassword: value }));
        const error = validateConfirmPassword(value);
        setValidationErrors(prev => ({ ...prev, confirmPassword: error || '' }));
    };

    // 현재 단계 검증
    const isCurrentStepValid = () => {
        const currentField = stepFields[currentStep];
        if (!currentField) return false;

        if (currentField === 'birthDate') return true; // 선택 필드는 항상 유효

        const value = formData[currentField as keyof typeof formData];
        if (!value.trim()) return false;

        // 각 필드별 검증
        switch (currentField) {
            case 'studentId':
                return !validateStudentId(value);
            case 'nickname':
                return !validateNickname(value);
            case 'name':
                return !validateName(value);
            case 'email':
                return !validateEmail(value);
            case 'password':
                return !validatePassword(value);
            default:
                return true;
        }
    };

    // 다음 단계로 이동
    const goToNextStep = () => {
        if (currentStep < stepFields.length - 1 && isCurrentStepValid()) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsTransitioning(false);
            }, 300);
        } else if (currentStep === stepFields.length - 1 && isCurrentStepValid() && arePasswordsValid()) {
            // 마지막 단계에서 비밀번호가 모두 유효하면 회원가입 실행
            handleRegister(new Event('submit') as any);
        }
    };

    // 이전 단계로 이동
    const goToPreviousStep = () => {
        if (currentStep > 0) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsTransitioning(false);
            }, 300);
        }
    };

    // 비밀번호와 비밀번호 확인이 모두 유효한지 확인
    const arePasswordsValid = () => {
        return !validatePassword(formData.password) && !validateConfirmPassword(formData.confirmPassword);
    };

    // 회원가입 버튼 활성화 조건
    const isRegisterButtonEnabled = () => {
        return arePasswordsValid() && formData.password && formData.confirmPassword;
    };

    // 말풍선 컴포넌트
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 비밀번호 확인
            if (formData.password !== formData.confirmPassword) {
                setError('비밀번호가 일치하지 않습니다.');
                return;
            }

            // TODO: 실제 회원가입 로직 구현
            await new Promise(resolve => setTimeout(resolve, 1500)); // 임시 딜레이

            // 임시 성공 처리
            if (formData.studentId && formData.nickname && formData.name && formData.email && formData.password) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
            } else {
                setError('모든 필드를 입력해주세요.');
            }
        } catch (error) {
            setError('회원가입 중 오류가 발생했습니다.');
            console.error('Register error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white relative overflow-hidden">
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50"></div>
                </div>

                <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
                    <div className="w-full max-w-md text-center">
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-green-200/50 p-8 shadow-2xl">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-4">회원가입 완료!</h1>
                            <p className="text-slate-600 mb-6">
                                아치셈틀에 가입해주셔서 감사합니다.<br />
                                로그인 페이지로 이동합니다.
                            </p>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

                        {/* 상단 네비게이션 */}
                        <div className="mb-6 flex justify-between items-center">
                            <Link
                                href="/"
                                className="inline-flex items-center space-x-2 px-4 py-2 text-slate-500 hover:text-slate-700 rounded-xl transition-all duration-200 text-sm hover:bg-slate-50/50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>홈으로 돌아가기</span>
                            </Link>
                            <Link
                                href="/auth/login"
                                className="group inline-flex items-center justify-center px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm"
                            >
                                로그인
                            </Link>
                        </div>

                        {/* 회원가입 폼 */}
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-xl">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full mb-4">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                                    회원가입
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">함께 시작하세요</h1>
                                <p className="text-slate-600 text-sm sm:text-base">아치셈틀과 함께 성장해보세요</p>
                            </div>

                            {/* 진행 단계 표시 */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex space-x-2">
                                        {stepFields.map((_, step) => (
                                            <div
                                                key={step}
                                                className={`w-3 h-3 rounded-full transition-all duration-300 ${step < currentStep
                                                    ? 'bg-emerald-500 scale-110'
                                                    : step === currentStep
                                                        ? 'bg-emerald-300 scale-110'
                                                        : 'bg-slate-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">
                                        {currentStep + 1}/{stepFields.length}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-6">
                                {/* 현재 단계 입력 필드 */}
                                <div className="relative min-h-[200px]">
                                    {/* 학번 입력 */}
                                    {currentStep === 0 && (
                                        <div className={`transition-all duration-500 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                            <label htmlFor="studentId" className="block text-sm font-semibold text-slate-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    학번
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                                        필수
                                                    </span>
                                                </span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Hash className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                                                </div>
                                                <input
                                                    id="studentId"
                                                    name="studentId"
                                                    type="text"
                                                    value={formData.studentId}
                                                    onChange={handleStudentIdChange}
                                                    required
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                                                    placeholder="학번을 입력하세요 (예: 20241234)"
                                                />
                                                <Tooltip
                                                    message={validationErrors.studentId || ''}
                                                    show={!!validationErrors.studentId}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* 닉네임 입력 */}
                                    {currentStep === 1 && (
                                        <div className={`transition-all duration-500 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                            <label htmlFor="nickname" className="block text-sm font-semibold text-slate-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    닉네임
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                                        필수
                                                    </span>
                                                </span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <UserCheck className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                                                </div>
                                                <input
                                                    id="nickname"
                                                    name="nickname"
                                                    type="text"
                                                    value={formData.nickname}
                                                    onChange={handleNicknameChange}
                                                    onKeyDown={handleNicknameKeyDown}
                                                    required
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                                                    placeholder="닉네임을 입력하세요"
                                                />
                                                <Tooltip
                                                    message={validationErrors.nickname || ''}
                                                    show={!!validationErrors.nickname}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* 생년월일 입력 */}
                                    {currentStep === 2 && (
                                        <div className={`transition-all duration-500 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                            <label htmlFor="birthDate" className="block text-sm font-semibold text-slate-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    생년월일
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                        선택
                                                    </span>
                                                </span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                                                </div>
                                                <input
                                                    id="birthDate"
                                                    name="birthDate"
                                                    type="date"
                                                    value={formData.birthDate}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm cursor-pointer"
                                                    onClick={(e) => {
                                                        // 클릭 시 달력 열기
                                                        e.currentTarget.showPicker?.();
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* 이름 입력 */}
                                    {currentStep === 3 && (
                                        <div className={`transition-all duration-500 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    이름
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                                        필수
                                                    </span>
                                                </span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                                                </div>
                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={handleNameChange}
                                                    required
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                                                    placeholder="이름을 입력하세요"
                                                />
                                                <Tooltip
                                                    message={validationErrors.name || ''}
                                                    show={!!validationErrors.name}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* 이메일 입력 */}
                                    {currentStep === 4 && (
                                        <div className={`transition-all duration-500 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    이메일
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                                        필수
                                                    </span>
                                                </span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                                                </div>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleEmailChange}
                                                    required
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                                                    placeholder="이메일을 입력하세요"
                                                />
                                                <Tooltip
                                                    message={validationErrors.email || ''}
                                                    show={!!validationErrors.email}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* 비밀번호 입력 */}
                                    {currentStep === 5 && (
                                        <div className={`transition-all duration-500 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                            <div className="space-y-6">
                                                {/* 비밀번호 입력 */}
                                                <div>
                                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                                                        <span className="flex items-center gap-2">
                                                            비밀번호
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
                                                            id="password"
                                                            name="password"
                                                            type={showPassword ? "text" : "password"}
                                                            value={formData.password}
                                                            onChange={handlePasswordChange}
                                                            required
                                                            className="w-full pl-12 pr-12 py-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                                                            placeholder="비밀번호를 입력하세요"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                                        >
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                                                            value={formData.confirmPassword}
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
                                        </div>
                                    )}
                                </div>

                                {/* 네비게이션 버튼 */}
                                <div className="flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={goToPreviousStep}
                                        disabled={currentStep === 0}
                                        className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        이전
                                    </button>

                                    <button
                                        type="button"
                                        onClick={goToNextStep}
                                        disabled={
                                            !isCurrentStepValid() ||
                                            (currentStep === stepFields.length - 1 && !arePasswordsValid())
                                        }
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                처리 중...
                                            </>
                                        ) : (
                                            <>
                                                {currentStep === stepFields.length - 1 ? '회원가입' : '다음'}
                                                <ChevronRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* 에러 메시지 */}
                                {error && (
                                    <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center animate-fade-in-up">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                        {error}
                                    </div>
                                )}

                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}