import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    focusColor?: string;
    className?: string;
}

export default function SearchBar({
    placeholder,
    value,
    onChange,
    focusColor = "blue-500",
    className = ""
}: SearchBarProps) {
    return (
        <div className={`relative group max-w-2xl ${className || 'mx-auto'}`}>
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                <Search className={`h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-${focusColor} transition-colors duration-200`} />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-4 bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-${focusColor}/30 focus:border-${focusColor} transition-all duration-300 text-xs sm:text-sm`}
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
            )}
        </div>
    );
}
