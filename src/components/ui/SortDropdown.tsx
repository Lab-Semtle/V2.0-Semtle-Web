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

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showOptions) {
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

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-sm font-medium">
                    {selectedOption?.label || '정렬'}
                </span>
            </button>

            {showOptions && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl z-50">
                    {options.map((option, index) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onSortChange(option.value);
                                setShowOptions(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${index === 0 ? 'first:rounded-t-xl' : ''
                                } ${index === options.length - 1 ? 'last:rounded-b-xl' : ''
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
