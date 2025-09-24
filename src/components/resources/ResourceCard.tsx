'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ResourcePost } from '@/types/resource';
import { Calendar, Download, File, Code, Image as ImageIcon, Video, Presentation, GraduationCap, User, Star, Pin, CheckCircle, AlertCircle } from 'lucide-react';

interface ResourceCardProps {
    resource: ResourcePost;
    className?: string;
}

export default function ResourceCard({ resource, className = '' }: ResourceCardProps) {
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '알 수 없음';

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileTypeIcon = (fileType: string) => {
        switch (fileType) {
            case 'document':
                return File;
            case 'code':
                return Code;
            case 'presentation':
                return Presentation;
            case 'image':
                return ImageIcon;
            case 'video':
                return Video;
            default:
                return File;
        }
    };

    const getFileTypeLabel = (fileType: string) => {
        switch (fileType) {
            case 'document':
                return '문서';
            case 'code':
                return '코드';
            case 'presentation':
                return '프레젠테이션';
            case 'image':
                return '이미지';
            case 'video':
                return '동영상';
            case 'other':
                return '기타';
            default:
                return '파일';
        }
    };

    const getFileTypeColor = (fileType: string) => {
        switch (fileType) {
            case 'document':
                return 'bg-blue-100 text-blue-800';
            case 'code':
                return 'bg-green-100 text-green-800';
            case 'presentation':
                return 'bg-purple-100 text-purple-800';
            case 'image':
                return 'bg-pink-100 text-pink-800';
            case 'video':
                return 'bg-red-100 text-red-800';
            case 'other':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusInfo = (resource: ResourcePost) => {
        if (!resource.resource_data) {
            return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        }

        const { resource_status, is_verified } = resource.resource_data;

        if (resource_status === 'removed') {
            return { label: '삭제됨', color: 'bg-red-100 text-red-800', icon: AlertCircle };
        }

        if (resource_status === 'outdated') {
            return { label: '구버전', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
        }

        if (is_verified) {
            return { label: '검증됨', color: 'bg-green-100 text-green-800', icon: CheckCircle };
        }

        return { label: '활성', color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
    };

    const StatusInfo = getStatusInfo(resource);
    const StatusIcon = StatusInfo.icon;
    const FileTypeIcon = getFileTypeIcon(resource.resource_data?.file_type || 'other');

    return (
        <Link href={`/resources/${resource.id}`}>
            <article className={`group bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
                {/* 썸네일 */}
                <div className="relative aspect-video w-full overflow-hidden">
                    {resource.thumbnail && !imageError ? (
                        <Image
                            src={resource.thumbnail}
                            alt={resource.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                            <FileTypeIcon className="w-16 h-16 text-purple-400" />
                        </div>
                    )}

                    {/* 배지들 */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {resource.is_pinned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-md">
                                <Pin className="w-3 h-3 mr-1" />
                                고정
                            </span>
                        )}
                        {resource.is_featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white shadow-md">
                                <Star className="w-3 h-3 mr-1" />
                                추천
                            </span>
                        )}
                    </div>

                    {/* 파일 타입 및 상태 */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getFileTypeColor(resource.resource_data?.file_type || 'other')}`}>
                            {getFileTypeLabel(resource.resource_data?.file_type || 'other')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${StatusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {StatusInfo.label}
                        </span>
                    </div>
                </div>

                {/* 내용 */}
                <div className="p-6">
                    {/* 카테고리 */}
                    {resource.category && (
                        <div className="mb-3">
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: `${resource.category.color}20`,
                                    color: resource.category.color
                                }}
                            >
                                {resource.category.name}
                            </span>
                        </div>
                    )}

                    {/* 제목 */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
                        {resource.title}
                    </h3>

                    {/* 부제목 */}
                    {resource.subtitle && (
                        <p className="text-slate-600 mb-4 line-clamp-2">
                            {resource.subtitle}
                        </p>
                    )}

                    {/* 자료 정보 */}
                    {resource.resource_data && (
                        <div className="space-y-2 mb-4">
                            {resource.resource_data.subject && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>{resource.resource_data.subject}</span>
                                </div>
                            )}

                            {resource.resource_data.professor && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <User className="w-4 h-4" />
                                    <span>{resource.resource_data.professor} 교수</span>
                                </div>
                            )}

                            {resource.resource_data.semester && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{resource.resource_data.semester}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <FileTypeIcon className="w-4 h-4" />
                                <span>
                                    {resource.resource_data.file_name || '파일'}
                                    {resource.resource_data.file_size && ` (${formatFileSize(resource.resource_data.file_size)})`}
                                </span>
                            </div>

                            {resource.resource_data.language && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Code className="w-4 h-4" />
                                    <span>{resource.resource_data.language}</span>
                                </div>
                            )}

                            {resource.resource_data.version && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                        {resource.resource_data.version}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 태그 */}
                    {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {resource.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {resource.tags.length > 3 && (
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                    +{resource.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* 작성자 정보 */}
                    {resource.author && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                                {resource.author.profile_image ? (
                                    <Image
                                        src={resource.author.profile_image}
                                        alt={resource.author.nickname}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-bold">
                                        {resource.author.nickname.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{resource.author.nickname}</p>
                                <p className="text-xs text-slate-500">{resource.author.name}</p>
                            </div>
                        </div>
                    )}

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(resource.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                <span>{resource.resource_data?.downloads_count || 0} 다운로드</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                <span>{resource.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <File className="w-4 h-4" />
                                <span>{resource.comments_count}</span>
                            </div>
                        </div>
                    </div>

                    {/* 다운로드 가능 표시 */}
                    {resource.resource_data?.resource_status === 'active' && resource.resource_data?.file_url && (
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2 text-purple-700">
                                <Download className="w-4 h-4" />
                                <span className="text-sm font-medium">다운로드 가능</span>
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </Link>
    );
}
