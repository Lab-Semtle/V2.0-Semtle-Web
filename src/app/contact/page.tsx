'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, User, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [representativeAdmin, setRepresentativeAdmin] = useState<{
        name: string;
        email: string;
    } | null>(null);

    useEffect(() => {
        const fetchRepresentativeAdmin = async () => {
            try {
                const response = await fetch('/api/admin/representative');
                if (response.ok) {
                    const data = await response.json();
                    setRepresentativeAdmin(data.representativeAdmin);
                }
            } catch (error) {
            }
        };

        fetchRepresentativeAdmin();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '문의 전송에 실패했습니다.');
            }

            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setSubmitStatus('error');
            setErrorMessage(error instanceof Error ? error.message : '문의 전송 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
                {/* 헤더 */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                        홈으로 돌아가기
                    </Link>

                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">문의하기</h1>
                            <p className="text-gray-600 mt-1">아치셈틀에 문의사항이 있으시면 언제든 연락해주세요</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 연락처 정보 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-32">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">연락처 정보</h2>

                            <div className="space-y-6">
                                {representativeAdmin ? (
                                    <>
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">대표 이메일</h3>
                                                <p className="text-gray-600 text-sm">{representativeAdmin.email}</p>
                                                <p className="text-gray-500 text-xs mt-1">{representativeAdmin.name}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">이메일</h3>
                                                <p className="text-gray-600 text-sm">semtle@kmou.ac.kr</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Phone className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">전화</h3>
                                                <p className="text-gray-600 text-sm">051-410-4XXX</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">응답 시간</h3>
                                        <p className="text-gray-600 text-sm">일주일 이내</p>
                                        <p className="text-gray-500 text-xs mt-1">문의 접수 후</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                                <h3 className="font-semibold text-gray-900 mb-2">문의 유형</h3>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    <li>• 학회 가입 관련</li>
                                    <li>• 활동 및 행사 문의</li>
                                    <li>• 기술적 문제</li>
                                    <li>• 기타 문의사항</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 문의 폼 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">문의 양식</h2>

                                {/* 성공/오류 메시지 */}
                                {submitStatus === 'success' && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <p className="text-green-800 font-medium">문의가 성공적으로 전송되었습니다!</p>
                                        </div>
                                        <p className="text-green-700 text-sm mt-1">
                                            빠른 시일 내에 답변드리겠습니다.
                                        </p>
                                    </div>
                                )}

                                {submitStatus === 'error' && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            <p className="text-red-800 font-medium">문의 전송에 실패했습니다.</p>
                                        </div>
                                        <p className="text-red-700 text-sm mt-1">
                                            {errorMessage}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* 이름 */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            이름 <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="이름을 입력해주세요"
                                            />
                                        </div>
                                    </div>

                                    {/* 이메일 */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            이메일 <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="이메일을 입력해주세요"
                                            />
                                        </div>
                                    </div>

                                    {/* 전화번호 */}
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            전화번호 <span className="text-gray-500">(선택)</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="전화번호를 입력해주세요"
                                            />
                                        </div>
                                    </div>

                                    {/* 문의 제목 */}
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                            문의 제목 <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="문의 제목을 입력해주세요"
                                            />
                                        </div>
                                    </div>

                                    {/* 문의 내용 */}
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            문의 내용 <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            required
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                            placeholder="문의 내용을 자세히 입력해주세요"
                                        />
                                        <p className="text-gray-500 text-sm mt-2">
                                            최소 10자 이상 입력해주세요. ({formData.message.length}/10)
                                        </p>
                                    </div>

                                    {/* 제출 버튼 */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || formData.message.length < 10}
                                            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>전송 중...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    <span>문의 전송</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
