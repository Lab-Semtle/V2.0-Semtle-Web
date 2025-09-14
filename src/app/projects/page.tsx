'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Calendar, Users, MessageCircle, Eye, Heart, Share2, ChevronRight, X, ArrowUpDown, UserPlus, Clock, MapPin, Code, Palette, Database, Smartphone, Globe, Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// 임시 데이터
const mockProjects = [
    {
        id: 1,
        title: "AI 기반 스마트 캠퍼스 앱 개발",
        description: "머신러닝을 활용한 캠퍼스 생활 최적화 앱을 개발합니다. React Native와 Python을 사용하여 크로스 플랫폼 앱을 만들 예정입니다.",
        category: "모바일앱",
        status: "모집중",
        teamSize: 4,
        currentMembers: 2,
        neededSkills: ["React Native", "Python", "Machine Learning", "UI/UX"],
        duration: "3개월",
        startDate: "2024-03-01",
        deadline: "2024-02-20",
        views: 156,
        likes: 23,
        comments: 8,
        author: "김개발",
        authorRole: "프로젝트 리더",
        date: "2024-02-15",
        isPinned: true,
        tags: ["AI", "모바일앱", "React Native", "Python"],
        location: "온라인",
        difficulty: "중급"
    },
    {
        id: 2,
        title: "블록체인 기반 투표 시스템",
        description: "투명하고 안전한 온라인 투표 시스템을 블록체인 기술로 구현합니다. Solidity와 Web3.js를 활용합니다.",
        category: "웹개발",
        status: "모집중",
        teamSize: 5,
        currentMembers: 1,
        neededSkills: ["Solidity", "Web3.js", "React", "Node.js"],
        duration: "4개월",
        startDate: "2024-03-15",
        deadline: "2024-03-01",
        views: 89,
        likes: 15,
        comments: 5,
        author: "이블록",
        authorRole: "블록체인 개발자",
        date: "2024-02-14",
        isPinned: false,
        tags: ["블록체인", "웹개발", "Solidity", "Web3"],
        location: "오프라인",
        difficulty: "고급"
    },
    {
        id: 3,
        title: "IoT 스마트 농장 모니터링 시스템",
        description: "센서 데이터를 활용한 스마트 농장 관리 시스템을 개발합니다. Arduino와 Raspberry Pi를 사용합니다.",
        category: "IoT",
        status: "모집완료",
        teamSize: 6,
        currentMembers: 6,
        neededSkills: ["Arduino", "Raspberry Pi", "Python", "IoT"],
        duration: "5개월",
        startDate: "2024-02-01",
        deadline: "2024-01-25",
        views: 234,
        likes: 45,
        comments: 12,
        author: "박농업",
        authorRole: "IoT 엔지니어",
        date: "2024-02-10",
        isPinned: false,
        tags: ["IoT", "Arduino", "Python", "스마트팜"],
        location: "하이브리드",
        difficulty: "중급"
    },
    {
        id: 4,
        title: "게임 개발 - 2D 플랫포머",
        description: "Unity를 사용한 2D 플랫포머 게임을 개발합니다. 픽셀 아트와 게임 디자인에 관심 있는 분들을 찾습니다.",
        category: "게임개발",
        status: "모집중",
        teamSize: 4,
        currentMembers: 3,
        neededSkills: ["Unity", "C#", "Pixel Art", "Game Design"],
        duration: "6개월",
        startDate: "2024-04-01",
        deadline: "2024-03-15",
        views: 178,
        likes: 32,
        comments: 9,
        author: "최게임",
        authorRole: "게임 디자이너",
        date: "2024-02-12",
        isPinned: false,
        tags: ["게임개발", "Unity", "C#", "2D게임"],
        location: "오프라인",
        difficulty: "초급"
    },
    {
        id: 5,
        title: "데이터 시각화 대시보드",
        description: "대용량 데이터를 실시간으로 시각화하는 웹 대시보드를 개발합니다. D3.js와 Chart.js를 활용합니다.",
        category: "데이터분석",
        status: "모집중",
        teamSize: 3,
        currentMembers: 1,
        neededSkills: ["D3.js", "Chart.js", "React", "Python"],
        duration: "2개월",
        startDate: "2024-03-01",
        deadline: "2024-02-25",
        views: 67,
        likes: 12,
        comments: 3,
        author: "정데이터",
        authorRole: "데이터 분석가",
        date: "2024-02-13",
        isPinned: false,
        tags: ["데이터분석", "시각화", "D3.js", "React"],
        location: "온라인",
        difficulty: "중급"
    },
    {
        id: 6,
        title: "웹3.0 소셜 플랫폼",
        description: "NFT와 메타버스를 활용한 새로운 소셜 플랫폼을 개발합니다. Next.js와 Web3 기술을 사용합니다.",
        category: "웹개발",
        status: "모집중",
        teamSize: 7,
        currentMembers: 2,
        neededSkills: ["Next.js", "Web3", "Solidity", "NFT"],
        duration: "8개월",
        startDate: "2024-04-15",
        deadline: "2024-04-01",
        views: 312,
        likes: 67,
        comments: 18,
        author: "한웹3",
        authorRole: "풀스택 개발자",
        date: "2024-02-11",
        isPinned: true,
        tags: ["웹3.0", "NFT", "메타버스", "Next.js"],
        location: "하이브리드",
        difficulty: "고급"
    }
];

const categories = ["전체", "모바일앱", "웹개발", "게임개발", "IoT", "데이터분석", "AI/ML", "블록체인"];
const statuses = ["전체", "모집중", "모집완료"];
const difficulties = ["전체", "초급", "중급", "고급"];

export default function ProjectsPage() {
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [selectedStatus, setSelectedStatus] = useState("전체");
    const [selectedDifficulty, setSelectedDifficulty] = useState("전체");
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

    const filteredProjects = mockProjects.filter(project => {
        const matchesCategory = selectedCategory === "전체" || project.category === selectedCategory;
        const matchesStatus = selectedStatus === "전체" || project.status === selectedStatus;
        const matchesDifficulty = selectedDifficulty === "전체" || project.difficulty === selectedDifficulty;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesStatus && matchesDifficulty && matchesSearch;
    });

    // 정렬된 프로젝트
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortBy === "latest") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === "popular") {
            return (b.views + b.likes + b.comments) - (a.views + a.likes + a.comments);
        } else if (sortBy === "deadline") {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return 0;
    });

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            "모바일앱": "bg-blue-100 text-blue-800 border-blue-200",
            "웹개발": "bg-green-100 text-green-800 border-green-200",
            "게임개발": "bg-purple-100 text-purple-800 border-purple-200",
            "IoT": "bg-orange-100 text-orange-800 border-orange-200",
            "데이터분석": "bg-pink-100 text-pink-800 border-pink-200",
            "AI/ML": "bg-indigo-100 text-indigo-800 border-indigo-200",
            "블록체인": "bg-yellow-100 text-yellow-800 border-yellow-200"
        };
        return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            "모집중": "bg-green-100 text-green-800 border-green-200",
            "모집완료": "bg-gray-100 text-gray-800 border-gray-200"
        };
        return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getDifficultyColor = (difficulty: string) => {
        const colors: { [key: string]: string } = {
            "초급": "bg-green-100 text-green-800 border-green-200",
            "중급": "bg-yellow-100 text-yellow-800 border-yellow-200",
            "고급": "bg-red-100 text-red-800 border-red-200"
        };
        return colors[difficulty] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: any } = {
            "모바일앱": Smartphone,
            "웹개발": Globe,
            "게임개발": Palette,
            "IoT": Database,
            "데이터분석": Code,
            "AI/ML": Code,
            "블록체인": Database
        };
        return icons[category] || Code;
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
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            프로젝트
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                            프로젝트 팀원 모집
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
                            함께 성장할 팀원을 찾아보세요. 다양한 기술 스택과 아이디어로 멋진 프로젝트를 만들어가요
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
                                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors duration-200" />
                            </div>
                            <input
                                type="text"
                                placeholder="프로젝트명, 기술스택, 태그로 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
                            />
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="mb-12">
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`group relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${selectedCategory === category
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                        : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-green-50 hover:text-green-700 border border-slate-200/60 hover:border-green-200/60 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    <span className="relative z-10">{category}</span>
                                    {selectedCategory === category && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Filters */}
                    <div className="mb-8">
                        <div className="flex flex-wrap justify-center gap-4">
                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">상태:</span>
                                <div className="flex gap-2">
                                    {statuses.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setSelectedStatus(status)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStatus === status
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">난이도:</span>
                                <div className="flex gap-2">
                                    {difficulties.map((difficulty) => (
                                        <button
                                            key={difficulty}
                                            onClick={() => setSelectedDifficulty(difficulty)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedDifficulty === difficulty
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {difficulty}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projects Grid Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-sm text-slate-600">
                            총 {sortedProjects.length}개의 프로젝트
                        </div>

                        <div className="flex items-center gap-4">
                            {/* New Project Button */}
                            <Link
                                href="/projects/write"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                새 프로젝트
                            </Link>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortOptions(!showSortOptions)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <ArrowUpDown className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {sortBy === "latest" ? "최신순" : sortBy === "popular" ? "인기순" : "마감임박순"}
                                    </span>
                                </button>

                                {showSortOptions && (
                                    <div className="absolute right-0 top-full mt-2 w-36 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl z-10">
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
                                            className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${sortBy === "popular"
                                                ? "bg-slate-100 text-slate-900"
                                                : "text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            인기순
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSortBy("deadline");
                                                setShowSortOptions(false);
                                            }}
                                            className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200 last:rounded-b-xl ${sortBy === "deadline"
                                                ? "bg-slate-100 text-slate-900"
                                                : "text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            마감임박순
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedProjects.map((project) => {
                            const CategoryIcon = getCategoryIcon(project.category);
                            return (
                                <article
                                    key={project.id}
                                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/25 transform hover:-translate-y-3 hover:scale-[1.02] ${project.isPinned ? 'ring-2 ring-amber-400/40 shadow-amber-200/20' : ''
                                        }`}
                                >
                                    {/* Card Background with enhanced gradients */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 rounded-3xl"></div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-3xl"></div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-200/10 rounded-3xl group-hover:to-slate-200/20 transition-all duration-500"></div>

                                    {/* Featured Image Area with enhanced design */}
                                    <div className="relative mb-5 aspect-video overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400">
                                        {/* Dynamic gradient based on category */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${project.category === '모바일앱' ? 'from-blue-500/20 via-indigo-500/20 to-purple-500/20' :
                                            project.category === '웹개발' ? 'from-green-500/20 via-emerald-500/20 to-teal-500/20' :
                                                project.category === '게임개발' ? 'from-purple-500/20 via-violet-500/20 to-fuchsia-500/20' :
                                                    project.category === 'IoT' ? 'from-orange-500/20 via-amber-500/20 to-yellow-500/20' :
                                                        project.category === '데이터분석' ? 'from-pink-500/20 via-rose-500/20 to-red-500/20' :
                                                            project.category === 'AI/ML' ? 'from-indigo-500/20 via-blue-500/20 to-purple-500/20' :
                                                                'from-yellow-500/20 via-orange-500/20 to-red-500/20'
                                            }`}></div>

                                        {/* Category Badge with enhanced styling */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <div className={`rounded-2xl px-4 py-2 text-xs font-bold backdrop-blur-md border-0 shadow-xl transition-all duration-300 group-hover:scale-105 ${getCategoryColor(project.category)}`}>
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon className="w-3 h-3" />
                                                    {project.category}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className={`rounded-2xl px-3 py-2 text-xs font-bold backdrop-blur-md border-0 shadow-xl transition-all duration-300 group-hover:scale-105 ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </div>
                                        </div>

                                        {/* Pin Badge */}
                                        {project.isPinned && (
                                            <div className="absolute top-16 right-4 z-10">
                                                <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 backdrop-blur-md px-3 py-2 text-xs font-bold text-white shadow-xl group-hover:scale-105 transition-all duration-300">
                                                    📌 고정
                                                </div>
                                            </div>
                                        )}

                                        {/* Team Info Overlay */}
                                        <div className="absolute bottom-4 left-4 z-10">
                                            <div className="flex items-center gap-2 text-white text-xs font-semibold">
                                                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {project.currentMembers}/{project.teamSize}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {project.duration}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats Overlay */}
                                        <div className="absolute bottom-4 right-4 z-10">
                                            <div className="flex items-center gap-2 text-white text-xs font-semibold">
                                                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {project.views}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                    <Heart className="w-3.5 h-3.5" />
                                                    {project.likes}
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
                                        <h2 className="mb-4 text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors duration-300 line-clamp-2 leading-tight tracking-tight">
                                            {project.title}
                                        </h2>

                                        {/* Summary with enhanced readability */}
                                        <p className="mb-5 flex-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                            {project.description}
                                        </p>

                                        {/* Project Info */}
                                        <div className="mb-5 space-y-3">
                                            {/* Difficulty and Location */}
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className={`px-3 py-1.5 rounded-lg font-semibold ${getDifficultyColor(project.difficulty)}`}>
                                                    {project.difficulty}
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <MapPin className="w-3 h-3" />
                                                    {project.location}
                                                </div>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-2">
                                                {project.neededSkills.slice(0, 3).map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-semibold hover:bg-slate-200 transition-colors duration-200"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {project.neededSkills.length > 3 && (
                                                    <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs rounded-lg font-semibold">
                                                        +{project.neededSkills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer with enhanced design */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                                    {project.author.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{project.author}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{project.authorRole}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <Calendar className="w-4 h-4" />
                                                <span>{project.date}</span>
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtle border on hover */}
                                    <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-slate-200/50 transition-all duration-500"></div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-16">
                        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                            <ChevronRight className="w-5 h-5 rotate-180 text-slate-600" />
                        </button>

                        {[1, 2, 3, 4, 5].map((page) => (
                            <button
                                key={page}
                                className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 ${page === 1
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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