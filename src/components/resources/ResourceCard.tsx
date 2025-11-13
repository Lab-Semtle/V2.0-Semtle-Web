'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ResourcePost } from '@/types/resource';
import { Heart, MessageCircle, Download, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ResourceCardProps {
    resource: ResourcePost;
    className?: string;
    isSelectable?: boolean;
    isSelected?: boolean;
    onSelect?: (resourceId: number) => void;
    priority?: boolean;
}

export default function ResourceCard({
    resource,
    className = '',
    isSelectable = false,
    isSelected = false,
    onSelect,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    priority = false
}: ResourceCardProps) {
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    // 소유자 여부 확인
    const isOwner = user?.id === resource.author_id;
    const showCheckbox = isOwner && isSelectable && onSelect;

    // 카테고리 색상 가져오기 (폴더 색상)
    const getResourceCategoryColor = () => {
        if (resource.category?.color) {
            return resource.category.color;
        }
        const resourceType = (resource as unknown as Record<string, unknown>).resource_type as { name: string; color: string } | undefined;
        return resourceType?.color || '#40C0F0';
    };

    const categoryColor = getResourceCategoryColor();

    // 학기/연도 정보 포맷팅
    const getYearSemesterBadge = () => {
        interface ResourceWithVersion extends ResourcePost {
            year?: number | null;
            semester?: string | null;
        }
        const resourceWithVersion = resource as ResourceWithVersion;
        const year = resourceWithVersion.year;
        const semester = resourceWithVersion.semester;

        if (year && semester) {
            return `${year}-${semester.replace('학기', '')}`;
        } else if (year) {
            return `${year}`;
        } else if (semester) {
            return semester.replace('학기', '');
        }
        return null;
    };

    const handleCheckboxClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSelect) {
            onSelect(resource.id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = `/resources/${resource.id}`;
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('ko-KR');
    };

    // 비율 기반 토큰 (4:3 비율 기준, viewBox 0 0 400 300)
    const W = 400;
    const H = 300;
    const R = 28; // 본체 모서리 라운드 (조금만 더 둥글게)
    const TW = 112; // 탭 상단 평선 길이 (카드 폭의 28%)
    const TH = 34; // 하강 후 본체 상단 y
    const DL = 72; // 하강 길이 (길게/완만)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const PY = 112; // 포켓 상단 y (H*0.373)
    const PR_TOP = 16; // 포켓 상단 라운드 (조금만 더 둥글게)
    const PR_BOT = 20; // 포켓 하단 라운드 (하단만 덜 둥글게)
    const LIP = 3; // 뒤표지 상단 립 두께

    // Hover/Pressed 효과 계산
    const frontPocketTransform = isPressed
        ? 'translateY(1px)'
        : isHovered
            ? 'translateY(-2px)'
            : 'translateY(0)';

    // 그림자 효과 제거

    // Back Cover + Tab 통합 SVG Path (viewBox 0 0 400 300 기준)
    // 정확한 경로 순서: 좌상단 라운드 종점 → 탭 상단 평선 → 탭 하강 곡선(부드러운 대각선) → 본체 상단 평선 → 우상단 라운드 → 우측/하단/좌측 외곽 라운드 → 폐합
    // 이미지 기준: 오른쪽 약 2/3 지점부터 기울어지기 시작, 긴 S자 형태 (아래로 볼록 → 오목하게 휘어짐)
    // 매우 부드럽고 매끄러운 곡면, 점진적으로 높이가 낮아짐
    const backCoverPath = `
        M ${R},0
        L ${TW},0
        C ${TW + DL * 0.25},${TH * 0.05}  ${TW + DL * 0.75},${TH * 0.95}  ${TW + DL},${TH}
        L ${W - R},${TH}
        Q ${W},${TH}  ${W},${TH + R}
        L ${W},${H - R}
        Q ${W},${H}   ${W - R},${H}
        L ${R},${H}
        Q 0,${H}      0,${H - R}
        L 0,${R}
        Q 0,0         ${R},0
        Z
    `;

    const cardContent = (
        <div
            className={`relative transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 outline-none w-full rounded-[28px] ${className} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-[28px]' : ''}`}
            style={{
                aspectRatio: '4/3',
                backgroundColor: 'transparent',
                border: 'none',
                maxWidth: '100%',
            }}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsPressed(false);
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            tabIndex={0}
            role="button"
            aria-label={`${resource.title} 자료 보기`}
        >
            {/* Back Cover + Tab 통합 SVG (후면 레이어) - 선명한 경계 */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMid meet"
                style={{
                    zIndex: 1,
                    top: `${-LIP}px`,
                    boxShadow: 'none',
                    outline: 'none',
                }}
            >
                <defs>
                    {/* 색상 그라디언트(왼상단 밝음 → 오른하단 아주 미세히 어두움) - 미묘하게만 */}
                    <linearGradient id={`bg-grad-${resource.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={categoryColor} stopOpacity="1" />
                        <stop offset="100%" stopColor={categoryColor} stopOpacity="0.95" />
                    </linearGradient>
                    {/* Back lip 마스크: 상단 LIP px만 보이게 */}
                    <mask id={`lip-mask-${resource.id}`}>
                        <rect x="0" y="0" width={W} height={H} fill="black" />
                        <rect x="0" y="0" width={W} height={LIP} fill="white" />
                    </mask>
                </defs>
                {/* 메인 BackCover */}
                <path d={backCoverPath} fill={`url(#bg-grad-${resource.id})`} />
                {/* Back lip (연속 노출) - 일관된 두께로 */}
                <g mask={`url(#lip-mask-${resource.id})`}>
                    <path d={backCoverPath} fill={categoryColor} />
                </g>
            </svg>

            {/* Front Pocket (전면 레이어) - 상단 입구 형성 */}
            <div
                className="absolute overflow-hidden"
                style={{
                    top: '18%',
                    bottom: '-3px',
                    left: 0,
                    right: 0,
                    borderTopLeftRadius: `${PR_TOP}px`,
                    borderTopRightRadius: `${PR_TOP}px`,
                    borderBottomLeftRadius: `${PR_BOT}px`,
                    borderBottomRightRadius: `${PR_BOT}px`,
                    backgroundColor: '#ffffff',
                    transform: frontPocketTransform,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.15)',
                    outline: 'none',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    zIndex: 2,
                }}
            >
                {/* Front Pocket 내용 */}
                <div className="h-full flex flex-col pt-2.5 sm:pt-3 px-2.5 sm:px-3 pb-2 sm:pb-2.5 relative z-10 min-h-0 overflow-hidden">
                    {/* 체크박스 (소유자일 때만 표시) */}
                    {showCheckbox && (
                        <div
                            onClick={handleCheckboxClick}
                            className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-30 cursor-pointer"
                            role="checkbox"
                            aria-checked={isSelected}
                            aria-label={`${resource.title} 선택`}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCheckboxClick(e);
                                }
                            }}
                        >
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all shadow-sm ${isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white/95 border-slate-300'
                                }`}>
                                {isSelected && (
                                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* 학년도 + 학기 태그 */}
                    {getYearSemesterBadge() && (
                        <div className="mb-1.5 sm:mb-2 flex-shrink-0">
                            <Badge
                                variant="outline"
                                className="text-[9px] sm:text-[10px] font-medium bg-white/90 text-slate-700 border-slate-200/60 px-1.5 sm:px-2 py-0.5"
                            >
                                {getYearSemesterBadge()}
                            </Badge>
                        </div>
                    )}

                    {/* 제목 */}
                    <h3 className="text-xs sm:text-sm font-semibold leading-tight line-clamp-2 mb-1 text-slate-900 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0">
                        {resource.title}
                    </h3>

                    {/* 부제 */}
                    {resource.subtitle && (
                        <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-3 flex-shrink-0 min-h-0">
                            {resource.subtitle}
                        </p>
                    )}

                    {/* 하단: 작성자 + 메타 통계 - 항상 보이도록 고정 */}
                    <div className="mt-auto pt-1.5 sm:pt-2 flex items-center justify-between border-t border-slate-100 flex-shrink-0 gap-1.5 sm:gap-2 min-h-[32px] sm:min-h-[36px]">
                        {/* 작성자 프로필 */}
                        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                            <Avatar className="w-4 h-4 sm:w-5 sm:h-6 flex-shrink-0">
                                {resource.author?.profile_image ? (
                                    <AvatarImage
                                        src={resource.author.profile_image}
                                        alt={resource.author.nickname || ''}
                                    />
                                ) : null}
                                <AvatarFallback className="text-[8px] sm:text-[9px] bg-slate-200 text-slate-600">
                                    {resource.author?.nickname?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-[9px] sm:text-[10px] font-medium text-slate-700 truncate">
                                {resource.author?.nickname || '익명'}
                            </span>
                        </div>

                        {/* 메타 통계 */}
                        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                            <div className="flex items-center gap-0.5 text-slate-500">
                                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                <span className="text-[8px] sm:text-[9px] font-medium">{formatNumber(resource.likes_count || 0)}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-slate-500">
                                <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                <span className="text-[8px] sm:text-[9px] font-medium">{formatNumber(resource.comments_count || 0)}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-slate-500">
                                <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                <span className="text-[8px] sm:text-[9px] font-medium">{formatNumber(resource.downloads_count || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // 선택 모드일 때도 카드 클릭은 상세 페이지로 이동
    if (isSelectable) {
        return (
            <Link href={`/resources/${resource.id}`} className="block" style={{ backgroundColor: 'transparent', border: 'none' }}>
                {cardContent}
            </Link>
        );
    }

    return (
        <Link href={`/resources/${resource.id}`} style={{ backgroundColor: 'transparent', border: 'none' }}>
            {cardContent}
        </Link>
    );
}
