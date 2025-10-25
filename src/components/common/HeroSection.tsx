import React from 'react';

interface HeroSectionProps {
    badge: string;
    badgeColor: string;
    title: string;
    description: string;
    className?: string;
    pageType?: 'activities' | 'projects' | 'resources';
}

export default function HeroSection({
    badge,
    badgeColor,
    title,
    description,
    className = "",
    pageType = 'activities'
}: HeroSectionProps) {
    return (
        <section className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${className}`}>
            {/* Background */}
            {!className.includes('bg-gradient') && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
            )}

            {/* Decorative Elements */}
            <div className="absolute inset-0">
                {/* Gradient Overlay - Page Type Based */}
                {pageType === 'activities' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-600/10"></div>
                )}
                {pageType === 'projects' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-400/5 to-green-600/10"></div>
                )}
                {pageType === 'resources' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-purple-600/10"></div>
                )}

                {/* Floating Circles - Page Type Based */}
                {pageType === 'activities' && (
                    <>
                        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
                    </>
                )}
                {pageType === 'projects' && (
                    <>
                        <div className="absolute top-20 left-10 w-32 h-32 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute top-40 right-20 w-24 h-24 bg-green-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
                    </>
                )}
                {pageType === 'resources' && (
                    <>
                        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
                    </>
                )}

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)`,
                        backgroundSize: '20px 20px'
                    }}></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center space-y-6">
                    {badge && (
                        <div className={`inline-flex items-center px-4 py-2 ${badgeColor} text-sm font-semibold rounded-full backdrop-blur-sm bg-white/20 border border-white/30`}>
                            <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                            {badge}
                        </div>
                    )}
                    <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${className.includes('bg-gradient') ? 'text-white drop-shadow-lg' : 'text-slate-900'}`}>
                        {title}
                    </h1>
                    <p className={`text-base sm:text-lg max-w-3xl mx-auto ${className.includes('bg-gradient') ? 'text-blue-100 drop-shadow-md' : 'text-slate-600'} ${pageType === 'activities' ? 'whitespace-pre-line' : ''}`}>
                        {description}
                    </p>
                </div>
            </div>
        </section>
    );
}
