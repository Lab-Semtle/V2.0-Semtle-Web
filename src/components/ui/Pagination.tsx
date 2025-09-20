import React from 'react';
import { ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = ""
}: PaginationProps) {
    const getVisiblePages = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, start + maxVisible - 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className={`flex justify-center items-center gap-2 ${className}`}>
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ChevronRight className="w-5 h-5 rotate-180 text-slate-600" />
            </button>

            {visiblePages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${page === currentPage
                            ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg'
                            : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-100 hover:shadow-md border border-slate-200/60'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
        </div>
    );
}
