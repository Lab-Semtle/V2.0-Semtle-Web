import React from 'react';
import { Calendar, Eye, ChevronRight, Download, FileText, File, Archive, Presentation, Palette, Code, FileSpreadsheet, Pin, LucideIcon } from 'lucide-react';

interface ResourceCardProps {
    id: number;
    title: string;
    description: string;
    category: string;
    fileType: string;
    fileSize: string;
    downloads: number;
    views: number;
    likes: number;
    comments: number;
    author: string;
    authorRole: string;
    date: string;
    isPinned: boolean;
    tags: string[];
    version: string;
    language: string;
    onClick?: () => void;
}

export default function ResourceCard({
    title,
    description,
    category,
    fileType,
    fileSize,
    downloads,
    views,
    author,
    authorRole,
    date,
    isPinned,
    tags,
    version,
    language,
    onClick
}: ResourceCardProps) {
    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            "문서": "bg-blue-100 text-blue-800 border-blue-200",
            "코드": "bg-green-100 text-green-800 border-green-200",
            "디자인": "bg-purple-100 text-purple-800 border-purple-200",
            "프레젠테이션": "bg-orange-100 text-orange-800 border-orange-200",
            "에셋": "bg-pink-100 text-pink-800 border-pink-200",
            "템플릿": "bg-indigo-100 text-indigo-800 border-indigo-200",
            "기타": "bg-gray-100 text-gray-800 border-gray-200"
        };
        return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getFileTypeIcon = (fileType: string) => {
        const icons: { [key: string]: LucideIcon } = {
            "PDF": File,
            "ZIP": Archive,
            "PPTX": Presentation,
            "Figma": Palette,
            "Unity Package": Code,
            "XLSX": FileSpreadsheet,
            "기타": FileText
        };
        return icons[fileType] || FileText;
    };

    const getFileTypeColor = (fileType: string) => {
        const colors: { [key: string]: string } = {
            "PDF": "bg-red-100 text-red-800 border-red-200",
            "ZIP": "bg-yellow-100 text-yellow-800 border-yellow-200",
            "PPTX": "bg-orange-100 text-orange-800 border-orange-200",
            "Figma": "bg-purple-100 text-purple-800 border-purple-200",
            "Unity Package": "bg-blue-100 text-blue-800 border-blue-200",
            "XLSX": "bg-green-100 text-green-800 border-green-200",
            "기타": "bg-gray-100 text-gray-800 border-gray-200"
        };
        return colors[fileType] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getCategoryGradient = (category: string) => {
        const gradients: { [key: string]: string } = {
            "문서": "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
            "코드": "from-green-500/20 via-emerald-500/20 to-teal-500/20",
            "디자인": "from-purple-500/20 via-violet-500/20 to-fuchsia-500/20",
            "프레젠테이션": "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
            "에셋": "from-pink-500/20 via-rose-500/20 to-red-500/20",
            "템플릿": "from-indigo-500/20 via-blue-500/20 to-purple-500/20",
            "기타": "from-gray-500/20 via-slate-500/20 to-zinc-500/20"
        };
        return gradients[category] || "from-gray-500/20 via-slate-500/20 to-zinc-500/20";
    };

    const FileTypeIcon = getFileTypeIcon(fileType);

    return (
        <article
            onClick={onClick}
            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/25 transform hover:-translate-y-3 hover:scale-[1.02] ${isPinned ? 'ring-2 ring-amber-400/40 shadow-amber-200/20' : ''
                }`}
        >
            {/* Card Background with enhanced gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-fuchsia-500/5 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-200/10 rounded-3xl group-hover:to-slate-200/20 transition-all duration-500"></div>

            {/* Featured Image Area with enhanced design */}
            <div className="relative mb-5 aspect-video overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400">
                {/* Dynamic gradient based on category */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(category)}`}></div>

                {/* Category Badge with enhanced styling */}
                <div className="absolute top-4 left-4 z-10">
                    <div className={`rounded-2xl px-4 py-2 text-xs font-bold backdrop-blur-md border-0 shadow-xl transition-all duration-300 group-hover:scale-105 ${getCategoryColor(category)}`}>
                        {category}
                    </div>
                </div>

                {/* File Type Badge */}
                <div className="absolute top-4 right-4 z-10">
                    <div className={`rounded-2xl px-3 py-2 text-xs font-bold backdrop-blur-md border-0 shadow-xl transition-all duration-300 group-hover:scale-105 ${getFileTypeColor(fileType)}`}>
                        <div className="flex items-center gap-2">
                            <FileTypeIcon className="w-3 h-3" />
                            {fileType}
                        </div>
                    </div>
                </div>


                {/* File Info Overlay - Responsive Layout */}
                <div className="absolute bottom-4 left-4 z-10">
                    <div className="flex flex-col gap-2 text-white text-xs font-semibold">
                        {/* First row: File size and version */}
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                <FileText className="w-3.5 h-3.5" />
                                {fileSize}
                            </span>
                            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                <span className="text-xs font-bold">{version}</span>
                            </span>
                        </div>
                        {/* Second row: Downloads and views - Desktop only */}
                        <div className="hidden lg:flex items-center gap-2">
                            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                <Download className="w-3.5 h-3.5" />
                                {downloads}
                            </span>
                            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                <Eye className="w-3.5 h-3.5" />
                                {views}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Overlay - Mobile only */}
                <div className="absolute bottom-4 right-4 z-10 lg:hidden">
                    <div className="flex items-center gap-2 text-white text-xs font-semibold">
                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                            <Download className="w-3.5 h-3.5" />
                            {downloads}
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                            <Eye className="w-3.5 h-3.5" />
                            {views}
                        </span>
                    </div>
                </div>

                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>

                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{
                    backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)`
                }}></div>
            </div>

            {/* Content with enhanced spacing and typography */}
            <div className="relative flex-1 flex flex-col p-6">
                {/* Title with enhanced typography */}
                <div className="flex items-start gap-2 mb-4">
                    <h2 className="flex-1 text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2 leading-tight tracking-tight">
                        {title}
                    </h2>
                    {isPinned && (
                        <div className="flex-shrink-0 mt-1">
                            <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </div>
                    )}
                </div>

                {/* Summary with enhanced readability */}
                <p className="mb-5 flex-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {description}
                </p>

                {/* Resource Info */}
                <div className="mb-5 space-y-3">
                    {/* Language and Version */}
                    <div className="flex items-center gap-4 text-xs">
                        <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold">
                            {language}
                        </div>
                        <div className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg font-semibold">
                            {version}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-semibold hover:bg-slate-200 transition-colors duration-200"
                            >
                                #{tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs rounded-lg font-semibold">
                                +{tags.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer with enhanced design */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            {author.charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-900">{author}</div>
                            <div className="text-xs text-slate-500 font-medium">{authorRole}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                </div>
            </div>

            {/* Subtle border on hover */}
            <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-slate-200/50 transition-all duration-500"></div>
        </article>
    );
}
