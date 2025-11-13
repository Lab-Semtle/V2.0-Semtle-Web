'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ActivityPost } from '@/types/activity';
import { Calendar, MapPin, Users, Clock, Vote, Pin, CheckCircle, ArrowRight } from 'lucide-react';

interface ActivityCardProps {
    activity: ActivityPost;
    className?: string;
}

export default function ActivityCard({ activity, className = '' }: ActivityCardProps) {
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };


    const getStatusInfo = (activity: ActivityPost) => {
        // 실제 API에서 가져오는 데이터 구조에 맞게 수정
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
            <article className={`group bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-2 hover:bg-blue-50/30 ${className}`}>
                {/* 썸네일 */}
                <div className="relative aspect-video w-full overflow-hidden">
                    {(() => {
                        // thumbnail을 배열로 변환하고 첫 번째 이미지 사용
                        const thumbnails = Array.isArray(activity.thumbnail)
                            ? activity.thumbnail
                            : (activity.thumbnail ? [activity.thumbnail] : []);
                        const firstThumbnail = thumbnails.length > 0 ? thumbnails[0] : null;

                        return firstThumbnail && !imageError ? (
                            <Image
                                src={firstThumbnail}
                                alt={activity.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                                <span className="text-blue-400 text-4xl font-bold group-hover:text-blue-500 transition-colors duration-300">
                                    A
                                </span>
                            </div>
                        );
                    })()}

                    {/* 배지들 */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {((activity as unknown as { is_pinned?: boolean }).is_pinned === true) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-md">
                                <Pin className="w-3 h-3 mr-1" />
                                고정
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
                    <div className="space-y-2 mb-4">
                        {/* 시작일자와 종료일자가 모두 있는 경우에만 표시, 없으면 게시물 작성일자 표시 */}
                        {activity.activity_data?.start_date && activity.activity_data?.end_date ? (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(activity.activity_data.start_date)}</span>
                                <span>~ {formatDate(activity.activity_data.end_date)}</span>
                            </div>
                        ) : (
                            (() => {
                                // 게시물 작성일자: published_at 우선, 없으면 activity_versions의 created_at, 마지막으로 activity의 id 기준 추정
                                interface ActivityWithDates extends Omit<ActivityPost, 'created_at'> {
                                    published_at?: string;
                                    created_at?: string;
                                }
                                const activityWithDates = activity as ActivityWithDates;
                                const displayDate = activityWithDates.published_at
                                    || activityWithDates.created_at  // activity_versions의 created_at
                                    || null;

                                if (!displayDate) {
                                    return null;
                                }

                                const formattedDate = formatDate(displayDate);
                                // 날짜가 포맷되었을 때만 표시
                                return formattedDate ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formattedDate}</span>
                                    </div>
                                ) : null;
                            })()
                        )}

                        {activity.activity_data?.location && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4" />
                                <span>{activity.activity_data.location}</span>
                            </div>
                        )}

                        {activity.activity_data?.max_participants && (
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

                    {/* 태그 - 하단 */}
                    {(((activity as unknown as { tags?: string[] }).tags ?? []).length > 0) && (
                        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
                            {(((activity as unknown as { tags?: string[] }).tags ?? []).slice(0, 3)).map((tag: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-black/70 text-white rounded-lg text-xs font-medium shadow-sm">
                                    {tag}
                                </span>
                            ))}
                            {(((activity as unknown as { tags?: string[] }).tags ?? []).length > 3) && (
                                <span className="px-2 py-1 bg-black/70 text-white rounded-lg text-xs font-medium shadow-sm">
                                    +{(((activity as unknown as { tags?: string[] }).tags ?? []).length - 3)}
                                </span>
                            )}
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

                    {/* 화살표 아이콘 */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}