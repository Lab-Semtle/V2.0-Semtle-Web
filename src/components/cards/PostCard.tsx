import React from 'react';
import { Calendar, Users, MessageCircle, Eye, Heart, ChevronRight, Pin } from 'lucide-react';

interface PostCardProps {
    id: number;
    title: string;
    content: string;
    author: string;
    authorRole: string;
    date: string;
    views: number;
    likes: number;
    comments: number;
    category: string;
    isPinned: boolean;
    tags: string[];
    onClick?: () => void;
}

export default function PostCard({
    id,
    title,
    content,
    author,
    authorRole,
    date,
    views,
    likes,
    comments,
    category,
    isPinned,
    tags,
    onClick
}: PostCardProps) {
    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            "공지": "bg-red-100 text-red-800 border-red-200",
            "세미나": "bg-blue-100 text-blue-800 border-blue-200",
            "프로젝트": "bg-green-100 text-green-800 border-green-200",
            "스터디": "bg-purple-100 text-purple-800 border-purple-200",
            "해커톤": "bg-orange-100 text-orange-800 border-orange-200",
            "후기": "bg-pink-100 text-pink-800 border-pink-200"
        };
        return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getCategoryGradient = (category: string) => {
        const gradients: { [key: string]: string } = {
            "공지": "from-red-500/20 via-pink-500/20 to-rose-500/20",
            "세미나": "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
            "프로젝트": "from-green-500/20 via-emerald-500/20 to-teal-500/20",
            "스터디": "from-purple-500/20 via-violet-500/20 to-fuchsia-500/20",
            "해커톤": "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
            "후기": "from-pink-500/20 via-rose-500/20 to-red-500/20"
        };
        return gradients[category] || "from-gray-500/20 via-slate-500/20 to-zinc-500/20";
    };

    return (
        <article
            onClick={onClick}
            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/25 transform hover:-translate-y-3 hover:scale-[1.02] ${isPinned ? 'ring-2 ring-amber-400/40 shadow-amber-200/20' : ''
                }`}
        >
            {/* Card Background with enhanced gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
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


                {/* Stats Overlay with enhanced design */}
                <div className="absolute bottom-4 right-4 z-10">
                    <div className="flex items-center gap-2 text-white text-xs font-semibold">
                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                            <Eye className="w-3.5 h-3.5" />
                            {views}
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                            <Heart className="w-3.5 h-3.5" />
                            {likes}
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {comments}
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
                    <h2 className="flex-1 text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight tracking-tight">
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
                    {content}
                </p>

                {/* Tags with enhanced design */}
                <div className="flex flex-wrap gap-2 mb-5">
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

                {/* Footer with enhanced design */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
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
