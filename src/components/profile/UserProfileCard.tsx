'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/types/user';
import { Calendar, GraduationCap, Github, ExternalLink, Edit3, Shield, AlertTriangle } from 'lucide-react';

interface UserProfileCardProps {
    profile: UserProfile;
    isOwnProfile?: boolean;
    onEdit?: () => void;
}

export default function UserProfileCard({ profile, isOwnProfile = false, onEdit }: UserProfileCardProps) {
    const [imageError, setImageError] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'suspended':
                return 'bg-yellow-100 text-yellow-800';
            case 'banned':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'bg-purple-100 text-purple-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            case 'user':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'super_admin':
                return '대표 관리자';
            case 'admin':
                return '관리자';
            case 'user':
                return '일반 사용자';
            default:
                return '사용자';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return '활성';
            case 'suspended':
                return '정지됨';
            case 'banned':
                return '영구 정지';
            default:
                return '알 수 없음';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    {/* 프로필 이미지 */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            {profile.profile_image && !imageError ? (
                                <Image
                                    src={profile.profile_image}
                                    alt={profile.nickname}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <span className="text-white text-2xl font-bold">
                                    {profile.nickname.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        {/* 상태 표시 */}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${getStatusColor(profile.status)}`}>
                            {profile.status === 'suspended' && <AlertTriangle className="w-3 h-3" />}
                            {profile.status === 'banned' && <Shield className="w-3 h-3" />}
                        </div>
                    </div>

                    {/* 기본 정보 */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-slate-900">{profile.nickname}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(profile.role)}`}>
                                {getRoleLabel(profile.role)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(profile.status)}`}>
                                {getStatusLabel(profile.status)}
                            </span>
                        </div>
                        <p className="text-slate-600 font-medium">{profile.name}</p>
                        <p className="text-slate-500 text-sm">학번: {profile.student_id}</p>
                    </div>
                </div>

                {/* 편집 버튼 */}
                {isOwnProfile && onEdit && (
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors duration-200"
                    >
                        <Edit3 className="w-4 h-4" />
                        편집
                    </button>
                )}
            </div>

            {/* 소개글 */}
            {profile.bio && (
                <div className="mb-6">
                    <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
                </div>
            )}

            {/* 학과/전공 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {profile.major && (
                    <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm text-slate-500">전공</p>
                            <p className="font-medium text-slate-900">{profile.major}</p>
                        </div>
                    </div>
                )}

                {profile.grade && (
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm text-slate-500">학년</p>
                            <p className="font-medium text-slate-900">{profile.grade}학년</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 링크 */}
            <div className="flex flex-wrap gap-3 mb-6">
                {profile.github_url && (
                    <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                    >
                        <Github className="w-4 h-4" />
                        <span className="text-sm font-medium">GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}

                {profile.portfolio_url && (
                    <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm font-medium">포트폴리오</span>
                    </a>
                )}

                {profile.linkedin_url && (
                    <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                )}
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{profile.total_posts}</p>
                    <p className="text-sm text-slate-600">게시물</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{profile.total_likes_received}</p>
                    <p className="text-sm text-slate-600">받은 좋아요</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{profile.total_comments}</p>
                    <p className="text-sm text-slate-600">댓글</p>
                </div>
            </div>

            {/* 가입일 */}
            <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">가입일: {formatDate(profile.created_at)}</span>
                </div>
                {profile.last_login && (
                    <div className="flex items-center gap-3 text-slate-500 mt-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">마지막 로그인: {formatDate(profile.last_login)}</span>
                    </div>
                )}
            </div>

            {/* 정지 정보 */}
            {(profile.status === 'suspended' || profile.status === 'banned') && profile.suspension_reason && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">계정 제재 정보</span>
                    </div>
                    <p className="text-sm text-red-700">{profile.suspension_reason}</p>
                    {profile.suspended_until && (
                        <p className="text-sm text-red-600 mt-1">
                            정지 기간: {formatDate(profile.suspended_until)}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
