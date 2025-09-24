'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ActivityPost } from '@/types/activity';
import { Calendar, MapPin, Users, Clock, Vote, Pin, Star, CheckCircle } from 'lucide-react';

interface ActivityCardProps {
    activity: ActivityPost;
    className?: string;
}

export default function ActivityCard({ activity, className = '' }: ActivityCardProps) {
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActivityTypeLabel = (type: string) => {
        switch (type) {
            case 'announcement':
                return '공지사항';
            case 'event':
                return '이벤트';
            case 'seminar':
                return '세미나';
            case 'workshop':
                return '워크샵';
            case 'vote':
                return '투표';
            case 'record':
                return '행사기록';
            default:
                return '활동';
        }
    };

    const getActivityTypeColor = (type: string) => {
        switch (type) {
            case 'announcement':
                return 'bg-purple-100 text-purple-800';
            case 'event':
                return 'bg-red-100 text-red-800';
            case 'seminar':
                return 'bg-blue-100 text-blue-800';
            case 'workshop':
                return 'bg-green-100 text-green-800';
            case 'vote':
                return 'bg-yellow-100 text-yellow-800';
            case 'record':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusInfo = (activity: ActivityPost) => {
        if (!activity.activity_data?.start_date) {
            return { label: '상시', color: 'bg-gray-100 text-gray-800', icon: Clock };
        }

        const now = new Date();
        const startDate = new Date(activity.activity_data.start_date);
        const endDate = activity.activity_data.end_date ? new Date(activity.activity_data.end_date) : null;

        if (endDate && now > endDate) {
            return { label: '종료됨', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
        }

        if (now < startDate) {
            return { label: '예정', color: 'bg-blue-100 text-blue-800', icon: Clock };
        }

        if (endDate && now >= startDate && now <= endDate) {
            return { label: '진행중', color: 'bg-green-100 text-green-800', icon: CheckCircle };
        }

        return { label: '진행중', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    };

    const StatusInfo = getStatusInfo(activity);
    const StatusIcon = StatusInfo.icon;

    return (
        <Link href={`/activities/${activity.id}`}>
            <article className={`group bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
                {/* 썸네일 */}
                <div className="relative aspect-video w-full overflow-hidden">
                    {activity.thumbnail && !imageError ? (
                        <Image
                            src={activity.thumbnail}
                            alt={activity.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <span className="text-blue-400 text-4xl font-bold">
                                {getActivityTypeLabel(activity.activity_data?.activity_type || 'activity').charAt(0)}
                            </span>
                        </div>
                    )}

                    {/* 배지들 */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {activity.is_pinned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-md">
                                <Pin className="w-3 h-3 mr-1" />
                                고정
                            </span>
                        )}
                        {activity.is_featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white shadow-md">
                                <Star className="w-3 h-3 mr-1" />
                                추천
                            </span>
                        )}
                    </div>

                    {/* 활동 타입 및 상태 */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getActivityTypeColor(activity.activity_data?.activity_type || 'activity')}`}>
                            {getActivityTypeLabel(activity.activity_data?.activity_type || 'activity')}
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
                    {activity.category && (
                        <div className="mb-3">
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: `${activity.category.color}20`,
                                    color: activity.category.color
                                }}
                            >
                                {activity.category.name}
                            </span>
                        </div>
                    )}

                    {/* 제목 */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {activity.title}
                    </h3>

                    {/* 부제목 */}
                    {activity.subtitle && (
                        <p className="text-slate-600 mb-4 line-clamp-2">
                            {activity.subtitle}
                        </p>
                    )}

                    {/* 활동 정보 */}
                    {activity.activity_data && (
                        <div className="space-y-2 mb-4">
                            {activity.activity_data.start_date && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(activity.activity_data.start_date)}</span>
                                    {activity.activity_data.end_date && (
                                        <span>~ {formatDate(activity.activity_data.end_date)}</span>
                                    )}
                                </div>
                            )}

                            {activity.activity_data.location && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{activity.activity_data.location}</span>
                                </div>
                            )}

                            {activity.activity_data.max_participants && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Users className="w-4 h-4" />
                                    <span>
                                        {activity.activity_data.current_participants} / {activity.activity_data.max_participants}명
                                    </span>
                                </div>
                            )}

                            {activity.activity_data.activity_type === 'vote' && activity.activity_data.vote_options && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Vote className="w-4 h-4" />
                                    <span>{activity.activity_data.vote_options.length}개 옵션</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 태그 */}
                    {activity.tags && activity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {activity.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {activity.tags.length > 3 && (
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                    +{activity.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* 작성자 정보 */}
                    {activity.author && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                {activity.author.profile_image ? (
                                    <Image
                                        src={activity.author.profile_image}
                                        alt={activity.author.nickname}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-bold">
                                        {activity.author.nickname.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{activity.author.nickname}</p>
                                <p className="text-xs text-slate-500">{activity.author.name}</p>
                            </div>
                        </div>
                    )}

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(activity.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{activity.views} 조회</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{activity.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Vote className="w-4 h-4" />
                                <span>{activity.comments_count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}