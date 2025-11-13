'use client';

import { useMemo } from 'react';

interface ContributionGraphProps {
    posts: Array<{ created_at: string }>;
    userCreatedAt?: string; // 사용자 가입 날짜
}

interface ContributionDay {
    date: Date;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export default function ContributionGraph({ posts, userCreatedAt }: ContributionGraphProps) {
    const contributionData = useMemo(() => {
        const data: ContributionDay[] = [];

        // 가입 날짜 기준으로 시작 날짜 설정
        let startDate: Date;
        if (userCreatedAt) {
            const joinDate = new Date(userCreatedAt);
            joinDate.setHours(0, 0, 0, 0);
            startDate = new Date(joinDate);
        } else {
            // 가입 날짜가 없으면 지난 1년으로 설정
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 364);
        }

        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        // 날짜별 게시물 개수 집계
        const postsByDate: Record<string, number> = {};
        posts.forEach(post => {
            const date = new Date(post.created_at);
            const dateKey = date.toISOString().split('T')[0];
            postsByDate[dateKey] = (postsByDate[dateKey] || 0) + 1;
        });

        // 가입일부터 오늘까지의 각 날짜에 대해 데이터 생성
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const count = postsByDate[dateKey] || 0;

            // 레벨 계산 (GitHub 스타일)
            let level: 0 | 1 | 2 | 3 | 4 = 0;
            if (count === 0) level = 0;
            else if (count === 1) level = 1;
            else if (count <= 3) level = 2;
            else if (count <= 5) level = 3;
            else level = 4;

            data.push({ date: new Date(currentDate), count, level });

            // 다음 날로 이동
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return data;
    }, [posts, userCreatedAt]);

    const getLevelColor = (level: 0 | 1 | 2 | 3 | 4) => {
        switch (level) {
            case 0: return 'bg-gray-100';
            case 1: return 'bg-green-200';
            case 2: return 'bg-green-400';
            case 3: return 'bg-green-600';
            case 4: return 'bg-green-800';
            default: return 'bg-gray-100';
        }
    };

    const { weeks, monthLabels } = useMemo(() => {
        const weeksData: ContributionDay[][] = [];

        if (contributionData.length === 0) {
            return { weeks: weeksData, monthLabels: [] };
        }

        // 첫 번째 날짜의 요일 확인 (0 = 일요일, 1 = 월요일, ...)
        const firstDate = new Date(contributionData[0].date);
        const firstDayOfWeek = firstDate.getDay();

        // 일주일 단위로 그룹화 (월요일부터 시작)
        let currentWeek: ContributionDay[] = [];

        // 첫 번째 날짜가 월요일이 아니면 월요일까지 빈 칸으로 채움
        if (firstDayOfWeek !== 1) {
            // 월요일(1)부터 첫 번째 날짜까지의 빈 칸 계산
            const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 일요일이면 6일, 그 외는 firstDayOfWeek - 1
            for (let i = 0; i < daysToAdd; i++) {
                const emptyDate = new Date(firstDate);
                emptyDate.setDate(emptyDate.getDate() - (firstDayOfWeek === 0 ? 6 - i : firstDayOfWeek - 1 - i));
                currentWeek.push({ date: emptyDate, count: 0, level: 0 });
            }
        }

        contributionData.forEach((day) => {
            currentWeek.push(day);

            // 일주일이 채워지면 주 배열에 추가
            if (currentWeek.length === 7) {
                weeksData.push([...currentWeek]);
                currentWeek = [];
            }
        });

        // 마지막 주가 7일이 안 되면 빈 칸으로 채움 (단, 오늘 이후 날짜는 제외)
        if (currentWeek.length > 0) {
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            while (currentWeek.length < 7) {
                const lastDate = currentWeek[currentWeek.length - 1]?.date || new Date();
                const nextDate = new Date(lastDate);
                nextDate.setDate(nextDate.getDate() + 1);

                // 오늘 이후 날짜는 추가하지 않음
                if (nextDate > today) {
                    break;
                }

                currentWeek.push({ date: nextDate, count: 0, level: 0 });
            }
            weeksData.push(currentWeek);
        }

        const labels: Array<{ weekIndex: number; label: string }> = [];
        const seenMonths = new Set<string>();

        // 각 주(열)를 확인하여 매 달의 1일이 포함된 주를 찾아 레이블 추가
        weeksData.forEach((week, weekIndex) => {
            // 첫 번째 열은 무조건 월 레이블 표시
            if (weekIndex === 0) {
                // 첫 번째 주의 첫 번째 실제 날짜 찾기
                const firstRealDay = week.find(day => {
                    const dateKey = new Date(day.date).toISOString().split('T')[0];
                    return contributionData.some(d => {
                        const dKey = new Date(d.date).toISOString().split('T')[0];
                        return dKey === dateKey;
                    });
                });

                if (firstRealDay) {
                    const date = new Date(firstRealDay.date);
                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                    if (!seenMonths.has(monthKey)) {
                        seenMonths.add(monthKey);
                        labels.push({
                            weekIndex,
                            label: date.toLocaleDateString('ko-KR', { month: 'short' })
                        });
                    }
                }
            } else {
                // 나머지 주는 1일이 포함된 경우에만 레이블 추가
                const firstDayInWeek = week.find(day => {
                    const date = new Date(day.date);
                    // 실제 날짜인지 확인 (빈 칸이 아닌 경우)
                    // contributionData에 포함된 날짜인지 확인
                    const dateKey = date.toISOString().split('T')[0];
                    const isRealDate = contributionData.some(d => {
                        const dKey = new Date(d.date).toISOString().split('T')[0];
                        return dKey === dateKey;
                    });
                    return date.getDate() === 1 && isRealDate;
                });

                if (firstDayInWeek) {
                    const date = new Date(firstDayInWeek.date);
                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

                    // 새로운 달이면 레이블 추가
                    if (!seenMonths.has(monthKey)) {
                        seenMonths.add(monthKey);
                        labels.push({
                            weekIndex,
                            label: date.toLocaleDateString('ko-KR', { month: 'short' })
                        });
                    }
                }
            }
        });

        return { weeks: weeksData, monthLabels: labels };
    }, [contributionData]);

    const totalContributions = posts.length;
    const daysWithContributions = useMemo(() => {
        // contributionData에서 실제로 게시물이 있는 날짜의 개수 계산
        return contributionData.filter(day => day.count > 0).length;
    }, [contributionData]);

    const displayYear = useMemo(() => {
        if (contributionData.length === 0) {
            return new Date().getFullYear();
        }
        // 첫 번째 날짜와 마지막 날짜의 연도 확인
        const firstDate = new Date(contributionData[0].date);
        const lastDate = new Date(contributionData[contributionData.length - 1].date);
        const firstYear = firstDate.getFullYear();
        const lastYear = lastDate.getFullYear();

        // 같은 연도면 하나만 표시, 다르면 범위로 표시
        if (firstYear === lastYear) {
            return `${firstYear}년`;
        } else {
            return `${firstYear}-${lastYear}년`;
        }
    }, [contributionData]);
    const longestStreak = useMemo(() => {
        let streak = 0;
        let maxStreak = 0;

        contributionData.forEach(day => {
            if (day.count > 0) {
                streak++;
                maxStreak = Math.max(streak, maxStreak);
            } else {
                streak = 0;
            }
        });

        return maxStreak;
    }, [contributionData]);

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {displayYear} 활동
                </h3>
                <div className="flex gap-6 text-xs text-gray-600">
                    <div>
                        <span className="font-semibold">{totalContributions}</span>개의 게시물
                    </div>
                    <div>
                        <span className="font-semibold">{daysWithContributions}</span>일 동안 활동
                    </div>
                    <div>
                        <span className="font-semibold">{longestStreak}</span>일 연속 활동
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="flex gap-1 items-start">
                    {/* 요일 레이블 */}
                    <div className="flex flex-col gap-1 mr-2 text-xs text-gray-500">
                        <div className="h-3">월</div>
                        <div className="h-3">화</div>
                        <div className="h-3">수</div>
                        <div className="h-3">목</div>
                        <div className="h-3">금</div>
                        <div className="h-3">토</div>
                        <div className="h-3">일</div>
                    </div>

                    {/* 그래프 */}
                    <div className="flex gap-1">
                        {weeks.map((week, weekIndex) => {
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);

                            return (
                                <div key={weekIndex} className="flex flex-col gap-1">
                                    {week.map((day, dayIndex) => {
                                        const dayDate = new Date(day.date);
                                        dayDate.setHours(23, 59, 59, 999);
                                        const isFuture = dayDate > today;

                                        return (
                                            <div
                                                key={`${weekIndex}-${dayIndex}`}
                                                className={`w-3 h-3 ${isFuture ? 'bg-transparent' : getLevelColor(day.level)} ${!isFuture ? 'hover:ring-2 hover:ring-green-400 cursor-pointer' : ''} transition-all`}
                                                title={isFuture ? '' : `${new Date(day.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}: ${day.count}개 게시물`}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 월 레이블 */}
                <div className="flex gap-1 mt-2 ml-7 relative" style={{ height: '16px' }}>
                    {monthLabels.map((label, index) => (
                        <div
                            key={index}
                            className="text-xs text-gray-500 whitespace-nowrap absolute"
                            style={{
                                left: `${label.weekIndex * 16}px` // 각 주(열)의 너비는 gap(4px) + 점 크기(12px) = 16px
                            }}
                        >
                            {label.label}
                        </div>
                    ))}
                </div>

                {/* 범례 */}
                <div className="flex items-center gap-2 mt-4 ml-7 text-xs text-gray-500">
                    <span>적게</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-gray-100"></div>
                        <div className="w-3 h-3 bg-green-200"></div>
                        <div className="w-3 h-3 bg-green-400"></div>
                        <div className="w-3 h-3 bg-green-600"></div>
                        <div className="w-3 h-3 bg-green-800"></div>
                    </div>
                    <span>많이</span>
                </div>
            </div>
        </div>
    );
}




