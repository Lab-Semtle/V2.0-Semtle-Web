'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ActivityPost } from '@/types/activity';
import { Pin, Heart, MessageCircle, CheckCircle2 } from 'lucide-react';

interface ActivityCardProps {
    activity: ActivityPost;
    className?: string;
    isSelectable?: boolean;
    isSelected?: boolean;
    onSelect?: (activityId: number) => void;
    priority?: boolean;
}

export default function ActivityCard({
    activity,
    className = '',
    isSelectable = false,
    isSelected = false,
    onSelect,
    priority = false
}: ActivityCardProps) {
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
        // 상세 페이지와 동일하게 start_date와 end_date를 직접 사용
        const startDate = activity.start_date;
        const endDate = activity.end_date;

        if (!startDate) {
            return { label: '상시', color: 'bg-gray-100 text-gray-800' };
        }

        const now = new Date();
        let start: Date;
        let end: Date | null = null;
        
        try {
            start = new Date(startDate);
            if (isNaN(start.getTime())) {
                // 잘못된 날짜 형식인 경우
                return { label: '상시', color: 'bg-gray-100 text-gray-800' };
            }
            if (endDate) {
                end = new Date(endDate);
                if (isNaN(end.getTime())) {
                    end = null;
                }
            }
        } catch {
            // 날짜 파싱 실패 시
            return { label: '상시', color: 'bg-gray-100 text-gray-800' };
        }

        if (end && now > end) {
            return { label: '종료됨', color: 'bg-gray-100 text-gray-800' };
        }

        if (now < start) {
            return { label: '예정', color: 'bg-blue-100 text-blue-800' };
        }

        if (end && now >= start && now <= end) {
            return { label: '진행중', color: 'bg-green-100 text-green-800' };
        }

        return { label: '진행중', color: 'bg-green-100 text-green-800' };
    };

    const StatusInfo = getStatusInfo(activity);

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSelect) {
            onSelect(activity.id);
        }
    };

    const CardContent = (
        <article className={`group relative bg-transparent rounded-2xl border-0 shadow-none overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''} ${className}`}>
            {/* 선택 체크박스 (관리자 모드일 때만) */}
            {isSelectable && (
                <div
                    className="absolute top-3 right-3 z-20"
                    onClick={handleCheckboxClick}
                >
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-md ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/95 border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                </div>
            )}

            {/* 썸네일 */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
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
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority={priority}
                            className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center rounded-2xl">
                            <span className="text-blue-400 text-4xl font-bold">
                                A
                            </span>
                        </div>
                    );
                })()}

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

                    {((activity as unknown as { is_pinned?: boolean }).is_pinned === true) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-md">
                            <Pin className="w-3 h-3 mr-1" />
                            고정
                        </span>
                    )}
                </div>

                {/* 활동 상태 */}
                {!isSelectable && (
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${StatusInfo.color}`}>
                            {StatusInfo.label}
                        </span>
                    </div>
                )}
                {/* 활동 상태 (선택 모드일 때는 체크박스 아래로) */}
                {isSelectable && (
                    <div className="absolute top-3 right-12 flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${StatusInfo.color}`}>
                            {StatusInfo.label}
                        </span>
                    </div>
                )}

                {/* 태그들 - 하단 */}
                {(((activity as unknown as { tags?: string[] }).tags ?? []).length > 0) && (
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
                        {(((activity as unknown as { tags?: string[] }).tags ?? []).slice(0, 3)).map((tag: string, index: number) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-black/70 text-white rounded-lg text-xs font-medium shadow-sm"
                            >
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
            </div>

            {/* 내용 */}
            <div className="p-4 bg-transparent">
                {/* 제목 */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {activity.title}
                </h3>

                {/* 부제목 */}
                {activity.subtitle && (
                    <p className="text-sm text-slate-600 mb-5 line-clamp-2">
                        {activity.subtitle}
                    </p>
                )}

                {/* 작성일자 */}
                <div className="text-xs text-slate-500 mb-3">
                    <span className="truncate">{formatDate(activity.created_at)}</span>
                </div>

                {/* 구분선 */}
                <div className="border-t border-slate-200 mb-3"></div>

                {/* 하단 정보: 메타 정보 */}
                <div className="flex items-center justify-end gap-3">
                    {/* 메타 정보 */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-shrink-0">
                        <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="font-medium">{activity.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="font-medium">{activity.comments_count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );

    // 선택 모드일 때도 카드 클릭은 상세 페이지로 이동
    if (isSelectable) {
        return (
            <Link href={`/activities/${activity.id}`} className="block">
                {CardContent}
            </Link>
        );
    }

    return (
        <Link href={`/activities/${activity.id}`}>
            {CardContent}
        </Link>
    );
}
