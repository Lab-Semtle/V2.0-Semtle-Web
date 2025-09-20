import React from 'react';

interface HeroSectionProps {
    badge: string;
    badgeColor: string;
    title: string;
    description: string;
    className?: string;
}

export default function HeroSection({
    badge,
    badgeColor,
    title,
    description,
    className = ""
}: HeroSectionProps) {
    return (
        <section className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${className}`}>
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center space-y-6">
                    <div className={`inline-flex items-center px-4 py-2 ${badgeColor} text-sm font-semibold rounded-full`}>
                        <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                        {badge}
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                        {title}
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
                        {description}
                    </p>
                </div>
            </div>
        </section>
    );
}
