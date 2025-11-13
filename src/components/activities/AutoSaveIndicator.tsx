'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
    isSaving?: boolean;
    lastSaved?: Date | string;
    className?: string;
}

export default function AutoSaveIndicator({ isSaving = false, lastSaved, className }: AutoSaveIndicatorProps) {
    const [displayText, setDisplayText] = useState<string>('');

    useEffect(() => {
        if (!lastSaved) return;

        const updateDisplayText = () => {
            const now = new Date();
            const saved = typeof lastSaved === 'string' ? new Date(lastSaved) : lastSaved;
            const diff = Math.floor((now.getTime() - saved.getTime()) / 1000);

            if (diff < 60) {
                setDisplayText('방금 저장됨');
            } else if (diff < 3600) {
                const minutes = Math.floor(diff / 60);
                setDisplayText(`${minutes}분 전 저장됨`);
            } else {
                const hours = Math.floor(diff / 3600);
                setDisplayText(`${hours}시간 전 저장됨`);
            }
        };

        updateDisplayText();
        const interval = setInterval(updateDisplayText, 60000); // 1분마다 업데이트

        return () => clearInterval(interval);
    }, [lastSaved]);

    if (isSaving) {
        return (
            <div className={cn('flex items-center gap-1.5 text-xs text-slate-500', className)}>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>저장 중...</span>
            </div>
        );
    }

    if (lastSaved) {
        return (
            <div className={cn('flex items-center gap-1.5 text-xs text-slate-500', className)}>
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>{displayText}</span>
            </div>
        );
    }

    return null;
}

