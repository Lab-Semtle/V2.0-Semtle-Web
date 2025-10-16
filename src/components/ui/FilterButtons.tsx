import React from 'react';

interface FilterButtonsProps {
    filters: string[];
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
    activeColor?: string;
    className?: string;
    icon?: React.ReactNode;
    compact?: boolean;
}

export default function FilterButtons({
    filters,
    selectedFilter,
    onFilterChange,
    activeColor = "blue-500",
    className = "",
    icon,
    compact = false
}: FilterButtonsProps) {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${selectedFilter === filter
                        ? `bg-${activeColor} text-white shadow-md hover:shadow-lg border border-${activeColor}/30`
                        : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200/60 hover:border-slate-300/60 hover:shadow-sm'
                        } ${compact ? 'px-3 py-2 text-xs' : ''}`}
                >
                    {icon && selectedFilter === filter && (
                        <span className="text-xs opacity-80">
                            {icon}
                        </span>
                    )}
                    <span className="relative z-10">{filter}</span>
                    {selectedFilter === filter && (
                        <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    )}
                </button>
            ))}
        </div>
    );
}
