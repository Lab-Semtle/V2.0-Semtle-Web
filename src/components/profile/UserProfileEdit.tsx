'use client';

import { useState } from 'react';
import { UserProfile, UserProfileUpdate } from '@/types/user';
import { Github, ExternalLink, Save, X } from 'lucide-react';

interface UserProfileEditProps {
    profile: UserProfile;
    onSave: (updates: UserProfileUpdate) => Promise<void>;
    onCancel: () => void;
}

export default function UserProfileEdit({ profile, onSave, onCancel }: UserProfileEditProps) {
    const [formData, setFormData] = useState<UserProfileUpdate>({
        nickname: profile.nickname,
        name: profile.name,
        birth_date: profile.birth_date,
        bio: profile.bio,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
        linkedin_url: profile.linkedin_url,
        major: profile.major,
        grade: profile.grade,
        student_status: profile.student_status,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: keyof UserProfileUpdate, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // 에러 메시지 제거
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.nickname?.trim()) {
            newErrors.nickname = '닉네임을 입력해주세요.';
        } else if (formData.nickname.length < 2) {
            newErrors.nickname = '닉네임은 2자 이상이어야 합니다.';
        }

        if (!formData.name?.trim()) {
            newErrors.name = '이름을 입력해주세요.';
        }

        if (formData.grade && (formData.grade < 1 || formData.grade > 4)) {
            newErrors.grade = '학년은 1-4 사이의 값이어야 합니다.';
        }

        // URL 유효성 검사
        const urlFields = ['github_url', 'portfolio_url', 'linkedin_url'];
        urlFields.forEach(field => {
            const url = formData[field as keyof UserProfileUpdate];
            if (url && typeof url === 'string' && url.trim()) {
                try {
                    new URL(url);
                } catch {
                    newErrors[field] = '올바른 URL 형식이 아닙니다.';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">프로필 편집</h2>
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                >
                    <X className="w-4 h-4" />
                    취소
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            닉네임 *
                        </label>
                        <input
                            type="text"
                            value={formData.nickname || ''}
                            onChange={(e) => handleInputChange('nickname', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.nickname ? 'border-red-300' : 'border-slate-300'
                                }`}
                            placeholder="닉네임을 입력하세요"
                        />
                        {errors.nickname && (
                            <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            이름 *
                        </label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.name ? 'border-red-300' : 'border-slate-300'
                                }`}
                            placeholder="이름을 입력하세요"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>
                </div>

                {/* 학과/전공 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            전공
                        </label>
                        <input
                            type="text"
                            value={formData.major || ''}
                            onChange={(e) => handleInputChange('major', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="전공을 입력하세요"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            학년
                        </label>
                        <select
                            value={formData.grade || ''}
                            onChange={(e) => handleInputChange('grade', parseInt(e.target.value) || '')}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.grade ? 'border-red-300' : 'border-slate-300'
                                }`}
                        >
                            <option value="">학년 선택</option>
                            <option value="1">1학년</option>
                            <option value="2">2학년</option>
                            <option value="3">3학년</option>
                            <option value="4">4학년</option>
                        </select>
                        {errors.grade && (
                            <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
                        )}
                    </div>
                </div>

                {/* 생년월일 */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        생년월일
                    </label>
                    <input
                        type="date"
                        value={formData.birth_date || ''}
                        onChange={(e) => handleInputChange('birth_date', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                </div>

                {/* 소개글 */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        소개글
                    </label>
                    <textarea
                        value={formData.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="자신을 소개해주세요"
                    />
                </div>

                {/* 링크 정보 */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">링크</h3>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <Github className="w-4 h-4 inline mr-2" />
                            GitHub
                        </label>
                        <input
                            type="url"
                            value={formData.github_url || ''}
                            onChange={(e) => handleInputChange('github_url', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.github_url ? 'border-red-300' : 'border-slate-300'
                                }`}
                            placeholder="https://github.com/username"
                        />
                        {errors.github_url && (
                            <p className="mt-1 text-sm text-red-600">{errors.github_url}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <ExternalLink className="w-4 h-4 inline mr-2" />
                            포트폴리오
                        </label>
                        <input
                            type="url"
                            value={formData.portfolio_url || ''}
                            onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.portfolio_url ? 'border-red-300' : 'border-slate-300'
                                }`}
                            placeholder="https://portfolio.example.com"
                        />
                        {errors.portfolio_url && (
                            <p className="mt-1 text-sm text-red-600">{errors.portfolio_url}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <ExternalLink className="w-4 h-4 inline mr-2" />
                            LinkedIn
                        </label>
                        <input
                            type="url"
                            value={formData.linkedin_url || ''}
                            onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.linkedin_url ? 'border-red-300' : 'border-slate-300'
                                }`}
                            placeholder="https://linkedin.com/in/username"
                        />
                        {errors.linkedin_url && (
                            <p className="mt-1 text-sm text-red-600">{errors.linkedin_url}</p>
                        )}
                    </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? '저장 중...' : '저장'}
                    </button>
                </div>
            </form>
        </div>
    );
}
