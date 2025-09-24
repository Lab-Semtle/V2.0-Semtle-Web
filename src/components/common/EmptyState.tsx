import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
    className = ""
}: EmptyStateProps) {
    const isDark = className.includes('text-white');

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mb-6">
                    {icon || (
                        <div className={`mx-auto w-16 h-16 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                            <svg
                                className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    {title}
                </h3>

                {/* Description */}
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                    {description}
                </p>

                {/* Action Button */}
                {action && (
                    <button
                        onClick={action.onClick}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${isDark
                                ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
}
