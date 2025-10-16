import { useState, useEffect, useRef, useCallback } from 'react';

interface UseViewCountProps {
    postType: 'project' | 'activity' | 'resource';
    postId: number;
    initialViews?: number;
}

export function useViewCount({ postType, postId, initialViews = 0 }: UseViewCountProps) {
    const [views, setViews] = useState(initialViews);
    const [isIncrementing, setIsIncrementing] = useState(false);
    const hasIncremented = useRef(false);
    const incrementTime = useRef<number>(0);

    // 조회수 증가 함수 (더 엄격한 조건)
    const incrementView = useCallback(async () => {
        // 이미 증가했거나 증가 중이면 무시
        if (isIncrementing || hasIncremented.current) return;

        // 최소 5분 간격으로만 증가 허용
        const now = Date.now();
        if (now - incrementTime.current < 5 * 60 * 1000) {
            return;
        }

        setIsIncrementing(true);
        try {
            const response = await fetch(`/api/posts/${postId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postType,
                    postId
                })
            });

            if (response.ok) {
                const data = await response.json();
                setViews(data.views);
                hasIncremented.current = true;
                incrementTime.current = now;
            } else {
            }
        } catch {
        } finally {
            setIsIncrementing(false);
        }
    }, [postId, postType, isIncrementing]);

    // 초기 조회수 설정
    useEffect(() => {
        setViews(initialViews);
    }, [initialViews]);

    // 세션 스토리지에서 조회 기록 확인
    useEffect(() => {
        const viewKey = `viewed_${postType}_${postId}`;
        const hasViewed = sessionStorage.getItem(viewKey);

        if (!hasViewed) {
            // 조회 기록이 없으면 증가
            incrementView();
            // 조회 기록 저장 (세션 동안 유지)
            sessionStorage.setItem(viewKey, 'true');
        }
    }, [postType, postId, incrementView]);

    return {
        views,
        incrementView,
        isIncrementing
    };
}
