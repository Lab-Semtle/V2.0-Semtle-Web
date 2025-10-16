'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ActivityPost } from '@/types/activity';
import { Calendar, MapPin, Users, Clock, Vote, Pin, Star, CheckCircle, Heart, MessageCircle } from 'lucide-react';

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


    const getStatusInfo = (activity: ActivityPost) => {
        const startDate = activity.activity_data?.start_date;
        const endDate = activity.activity_data?.end_date;

        if (!startDate) {
            return { label: '상시', color: 'bg-gray-100 text-gray-800', icon: Clock };
        }

        const now = new Date();
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : null;

        if (end && now > end) {
            return { label: '종료됨', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
        }

        if (now < start) {
            return { label: '예정', color: 'bg-blue-100 text-blue-800', icon: Clock };
        }

        if (end && now >= start && now <= end) {
            return { label: '진행중', color: 'bg-green-100 text-green-800', icon: CheckCircle };
        }

        return { label: '진행중', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    };

    const StatusInfo = getStatusInfo(activity);
    const StatusIcon = StatusInfo.icon;

    return (
        <Link href={`/activities/${activity.id}`}>
            <article className={`group bg-transparent rounded-2xl border-0 shadow-none overflow-hidden hover:-translate-y-1 transition-all duration-300 ${className}`}>
                {/* 썸네일 */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                    {activity.thumbnail && !imageError ? (
                        <Image
                            src={activity.thumbnail}
                            alt={activity.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center rounded-2xl">
                            <span className="text-blue-400 text-4xl font-bold">
                                A
                            </span>
                        </div>
                    )}

                    {/* 배지들 */}
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                        {/* 카테고리 태그 */}
                        {activity.category && (
                            <span
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm"
                                style={{
                                    backgroundColor: `${activity.category.color}E6`,
                                    color: 'white',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }}
                            >
                                {activity.category.name}
                            </span>
                        )}

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

                    {/* 활동 상태 */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${StatusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {StatusInfo.label}
                        </span>
                    </div>
                </div>

                {/* 내용 */}
                <div className="p-4 bg-transparent">
                    {/* 작성일자 */}
                    <div className="text-xs text-slate-500 mb-3">
                        <span className="truncate">{formatDate(activity.created_at)}</span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {activity.title}
                    </h3>

                    {/* 부제목 */}
                    {activity.subtitle && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {activity.subtitle}
                        </p>
                    )}

                    {/* 태그들 */}
                    {activity.tags && activity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
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

                    {/* 활동 정보 */}
                    {activity.activity_data && (
                        <div className="space-y-1 mb-3">
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

                            {activity.activity_data?.has_voting && activity.activity_data?.vote_options && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Vote className="w-4 h-4" />
                                    <span>{activity.activity_data.vote_options.length}개 옵션</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 작성자 정보 */}
                    {activity.author && (
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = `/profile/${activity.author?.nickname}`;
                                }}
                            >
                                {activity.author.profile_image ? (
                                    <Image
                                        src={activity.author.profile_image}
                                        alt={activity.author.nickname}
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-bold">
                                        {activity.author.nickname.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <span
                                    className="text-xs font-medium text-slate-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.location.href = `/profile/${activity.author?.nickname}`;
                                    }}
                                >
                                    {activity.author.nickname}
                                </span>
                                <p className="text-xs text-slate-500">{activity.author.name}</p>
                            </div>
                        </div>
                    )}

                    {/* 구분선 */}
                    <div className="border-t border-slate-200 mb-3"></div>

                    {/* 메타 정보 - 우측 정렬 */}
                    <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 flex-shrink-0" />
                            <span>{activity.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 flex-shrink-0" />
                            <span>{activity.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{activity.comments_count}</span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
