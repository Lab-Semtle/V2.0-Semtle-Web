import React, { useState, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortOption {
    value: string;
    label: string;
}

interface SortDropdownProps {
    options: SortOption[];
    selectedValue: string;
    onSortChange: (value: string) => void;
    className?: string;
}

export default function SortDropdown({
    options,
    selectedValue,
    onSortChange,
    className = ""
}: SortDropdownProps) {
    const [showOptions, setShowOptions] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showOptions && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowOptions(false);
            }
        };

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    const selectedOption = options.find(option => option.value === selectedValue);

    // className에서 min-w 추출
    const minWidthClass = className.split(' ').find(c => c.startsWith('min-w')) || '';

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={() => setShowOptions(!showOptions)}
                className={`flex items-center justify-start gap-1.5 sm:gap-2 px-3 py-1.5 md:px-3 md:py-1.5 lg:px-4 lg:py-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-200 w-full ${minWidthClass}`}
            >
                <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="flex-1 text-center text-xs sm:text-sm md:text-sm lg:text-sm font-medium">
                    {selectedOption?.label || '정렬'}
                </span>
            </button>

            {showOptions && (
                <div className="absolute right-0 top-full mt-2 w-full bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-lg shadow-md z-50">
                    {options.map((option, index) => (
                        <button
                            key={option.value}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSortChange(option.value);
                                setShowOptions(false);
                            }}
                            className={`w-full px-3 sm:px-4 lg:px-4 py-2 sm:py-3 lg:py-2.5 text-left text-xs sm:text-sm lg:text-sm font-medium transition-colors duration-200 ${index === 0 ? 'first:rounded-t-lg' : ''
                                } ${index === options.length - 1 ? 'last:rounded-b-lg' : ''
                                } ${selectedValue === option.value
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
