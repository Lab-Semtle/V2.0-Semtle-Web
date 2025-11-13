'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: 'published' | 'draft' | 'private' | 'hidden' | 'restricted';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
    const statusConfig = {
        published: {
            label: '출판됨',
            bg: 'bg-green-100',
            text: 'text-green-700',
            border: 'border-green-200',
            icon: '✓'
        },
        draft: {
            label: '임시저장',
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            border: 'border-yellow-200',
            icon: '💾'
        },
        private: {
            label: '비공개',
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            border: 'border-gray-200',
            icon: '🔒'
        },
        hidden: {
            label: '숨김',
            bg: 'bg-red-100',
            text: 'text-red-700',
            border: 'border-red-200',
            icon: '👁️'
        },
        restricted: {
            label: '관리자 전용',
            bg: 'bg-purple-100',
            text: 'text-purple-700',
            border: 'border-purple-200',
            icon: '🔒'
        }
    };

    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    };

    const config = statusConfig[status];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-md font-medium border',
                config.bg,
                config.text,
                config.border,
                sizeClasses[size],
                className
            )}
        >
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}

