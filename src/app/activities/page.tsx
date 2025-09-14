'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Calendar, Users, MessageCircle, Eye, Heart, Share2, ChevronRight, X, ArrowUpDown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// 임시 데이터
const mockPosts = [
    {
        id: 1,
        title: "2024년 1학기 정기 세미나 - AI와 머신러닝의 최신 동향",
        content: "인공지능과 머신러닝 분야의 최신 연구 동향과 실제 적용 사례에 대해 함께 논의하는 시간을 가집니다.",
        author: "김아치",
        authorRole: "회장",
        date: "2024-03-15",
        views: 156,
        likes: 23,
        comments: 8,
        category: "세미나",
        isPinned: true,
        tags: ["AI", "머신러닝", "세미나"]
    },
    {
        id: 2,
        title: "프로젝트 팀 구성 및 주제 선정 안내",
        content: "2024년 1학기 프로젝트 팀 구성과 주제 선정에 대한 안내사항입니다. 관심 있는 분야의 프로젝트에 참여해보세요.",
        author: "박셈틀",
        authorRole: "부회장",
        date: "2024-03-12",
        views: 89,
        likes: 15,
        comments: 12,
        category: "공지",
        isPinned: true,
        tags: ["프로젝트", "팀구성", "공지"]
    },
    {
        id: 3,
        title: "데이터 사이언스 워크샵 참가 후기",
        content: "지난 주말에 참가한 데이터 사이언스 워크샵의 후기와 주요 인사이트를 공유합니다.",
        author: "이데이터",
        authorRole: "회원",
        date: "2024-03-10",
        views: 67,
        likes: 9,
        comments: 5,
        category: "후기",
        isPinned: false,
        tags: ["데이터사이언스", "워크샵", "후기"]
    },
    {
        id: 4,
        title: "코딩 테스트 스터디 그룹 모집",
        content: "취업을 준비하는 회원들을 위한 코딩 테스트 스터디 그룹을 모집합니다. 함께 준비해요!",
        author: "최코딩",
        authorRole: "회원",
        date: "2024-03-08",
        views: 134,
        likes: 18,
        comments: 7,
        category: "스터디",
        isPinned: false,
        tags: ["코딩테스트", "스터디", "취업준비"]
    },
    {
        id: 5,
        title: "AI 해커톤 참가팀 모집",
        content: "다가오는 AI 해커톤에 참가할 팀원을 모집합니다. 다양한 아이디어로 함께 도전해보세요.",
        author: "정해커",
        authorRole: "회원",
        date: "2024-03-05",
        views: 98,
        likes: 12,
        comments: 9,
        category: "해커톤",
        isPinned: false,
        tags: ["해커톤", "AI", "팀모집"]
    }
];

const categories = ["전체", "공지", "세미나", "프로젝트", "스터디", "해커톤", "후기"];

export default function ActivitiesPage() {
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [showSortOptions, setShowSortOptions] = useState(false);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showSortOptions) {
                setShowSortOptions(false);
            }
        };

        if (showSortOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSortOptions]);

    const filteredPosts = mockPosts.filter(post => {
        const matchesCategory = selectedCategory === "전체" || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // 정렬된 게시물
    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (sortBy === "latest") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === "popular") {
            return (b.views + b.likes + b.comments) - (a.views + a.likes + a.comments);
        }
        return 0;
    });

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

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            학회활동
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                            아치셈틀 활동 소식
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
                            세미나, 프로젝트, 스터디 등 다양한 학회 활동과 소식을 확인하고 참여해보세요
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-8">
                        <div className="relative group max-w-2xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                            </div>
                            <input
                                type="text"
                                placeholder="제목, 내용, 태그로 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-sm shadow-lg hover:shadow-xl"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-12">
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`group relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${selectedCategory === category
                                        ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg hover:shadow-xl'
                                        : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-100 hover:shadow-md border border-slate-200/60'
                                        }`}
                                >
                                    <span className="relative z-10">{category}</span>
                                    {selectedCategory === category && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Posts Grid Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-sm text-slate-600">
                            총 {sortedPosts.length}개의 게시물
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortOptions(!showSortOptions)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {sortBy === "latest" ? "최신순" : "인기순"}
                                </span>
                            </button>

                            {showSortOptions && (
                                <div className="absolute right-0 top-full mt-2 w-32 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl z-10">
                                    <button
                                        onClick={() => {
                                            setSortBy("latest");
                                            setShowSortOptions(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200 first:rounded-t-xl ${sortBy === "latest"
                                            ? "bg-slate-100 text-slate-900"
                                            : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                    >
                                        최신순
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortBy("popular");
                                            setShowSortOptions(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200 last:rounded-b-xl ${sortBy === "popular"
                                            ? "bg-slate-100 text-slate-900"
                                            : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                    >
                                        인기순
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedPosts.map((post) => (
                            <article
                                key={post.id}
                                className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/25 transform hover:-translate-y-3 hover:scale-[1.02] ${post.isPinned ? 'ring-2 ring-amber-400/40 shadow-amber-200/20' : ''
                                    }`}
                            >
                                {/* Card Background with enhanced gradients */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 rounded-3xl"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-200/10 rounded-3xl group-hover:to-slate-200/20 transition-all duration-500"></div>

                                {/* Featured Image Area with enhanced design */}
                                <div className="relative mb-5 aspect-video overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400">
                                    {/* Dynamic gradient based on category */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${post.category === '공지' ? 'from-red-500/20 via-pink-500/20 to-rose-500/20' :
                                        post.category === '세미나' ? 'from-blue-500/20 via-indigo-500/20 to-purple-500/20' :
                                            post.category === '프로젝트' ? 'from-green-500/20 via-emerald-500/20 to-teal-500/20' :
                                                post.category === '스터디' ? 'from-purple-500/20 via-violet-500/20 to-fuchsia-500/20' :
                                                    post.category === '해커톤' ? 'from-orange-500/20 via-amber-500/20 to-yellow-500/20' :
                                                        'from-pink-500/20 via-rose-500/20 to-red-500/20'
                                        }`}></div>

                                    {/* Category Badge with enhanced styling */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <div className={`rounded-2xl px-4 py-2 text-xs font-bold backdrop-blur-md border-0 shadow-xl transition-all duration-300 group-hover:scale-105 ${getCategoryColor(post.category)}`}>
                                            {post.category}
                                        </div>
                                    </div>

                                    {/* Pin Badge with enhanced styling */}
                                    {post.isPinned && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 backdrop-blur-md px-3 py-2 text-xs font-bold text-white shadow-xl group-hover:scale-105 transition-all duration-300">
                                                📌 고정
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats Overlay with enhanced design */}
                                    <div className="absolute bottom-4 right-4 z-10">
                                        <div className="flex items-center gap-2 text-white text-xs font-semibold">
                                            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                <Eye className="w-3.5 h-3.5" />
                                                {post.views}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                <Heart className="w-3.5 h-3.5" />
                                                {post.likes}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                {post.comments}
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
                                    <h2 className="mb-4 text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight tracking-tight">
                                        {post.title}
                                    </h2>

                                    {/* Summary with enhanced readability */}
                                    <p className="mb-5 flex-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                        {post.content}
                                    </p>

                                    {/* Tags with enhanced design */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {post.tags.slice(0, 3).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-semibold hover:bg-slate-200 transition-colors duration-200"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        {post.tags.length > 3 && (
                                            <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs rounded-lg font-semibold">
                                                +{post.tags.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Footer with enhanced design */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                                {post.author.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{post.author}</div>
                                                <div className="text-xs text-slate-500 font-medium">{post.authorRole}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            <span>{post.date}</span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>

                                {/* Subtle border on hover */}
                                <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-slate-200/50 transition-all duration-500"></div>
                            </article>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-16">
                        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                            <ChevronRight className="w-5 h-5 rotate-180 text-slate-600" />
                        </button>

                        {[1, 2, 3, 4, 5].map((page) => (
                            <button
                                key={page}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${page === 1
                                    ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg'
                                    : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-100 hover:shadow-md border border-slate-200/60'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200">
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </section>

            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
}
