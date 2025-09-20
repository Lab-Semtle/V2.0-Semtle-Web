import React from 'react';

interface FilterButtonsProps {
    filters: string[];
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
    activeColor?: string;
    className?: string;
}

export default function FilterButtons({
    filters,
    selectedFilter,
    onFilterChange,
    activeColor = "slate-900",
    className = ""
}: FilterButtonsProps) {
    return (
        <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`group relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${selectedFilter === filter
                            ? `bg-gradient-to-r from-${activeColor} to-slate-700 text-white shadow-lg hover:shadow-xl`
                            : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-100 hover:shadow-md border border-slate-200/60'
                        }`}
                >
                    <span className="relative z-10">{filter}</span>
                    {selectedFilter === filter && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                </button>
            ))}
        </div>
    );
}
