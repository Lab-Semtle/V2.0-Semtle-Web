'use client';

import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
    category: string;
    className?: string;
}

export const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
    // 카테고리별 색상 매핑
    const getCategoryColor = (categoryName: string) => {
        const colors: Record<string, string> = {
            '활동': 'bg-blue-500/20 text-blue-300 border-blue-400/30',
            '프로젝트': 'bg-purple-500/20 text-purple-300 border-purple-400/30',
            '자료실': 'bg-green-500/20 text-green-300 border-green-400/30',
            '공지사항': 'bg-red-500/20 text-red-300 border-red-400/30',
            '기타': 'bg-gray-500/20 text-gray-300 border-gray-400/30',
        };

        return colors[categoryName] || colors['기타'];
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm',
                getCategoryColor(category),
                className
            )}
        >
            {category}
        </span>
    );
};
