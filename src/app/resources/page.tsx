'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Calendar, Users, MessageCircle, Eye, Heart, Share2, ChevronRight, X, ArrowUpDown, Download, FileText, Image as ImageIcon, Video, Music, Archive, Code, Presentation, BookOpen, FileSpreadsheet, File, Palette, Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// 임시 데이터
const mockResources = [
    {
        id: 1,
        title: "React Native 개발 가이드북",
        description: "React Native를 활용한 모바일 앱 개발의 모든 것을 담은 종합 가이드입니다. 초보자부터 고급 개발자까지 활용할 수 있습니다.",
        category: "문서",
        fileType: "PDF",
        fileSize: "15.2 MB",
        downloads: 1247,
        views: 2156,
        likes: 89,
        comments: 23,
        author: "김개발",
        authorRole: "시니어 개발자",
        date: "2024-02-15",
        isPinned: true,
        tags: ["React Native", "모바일앱", "가이드", "개발"],
        version: "v2.1",
        language: "한국어"
    },
    {
        id: 2,
        title: "AI/ML 프로젝트 템플릿 모음",
        description: "머신러닝 프로젝트를 위한 Jupyter Notebook 템플릿과 데이터 전처리 스크립트 모음입니다.",
        category: "코드",
        fileType: "ZIP",
        fileSize: "45.8 MB",
        downloads: 892,
        views: 1456,
        likes: 67,
        comments: 15,
        author: "이데이터",
        authorRole: "AI 엔지니어",
        date: "2024-02-14",
        isPinned: false,
        tags: ["AI", "Machine Learning", "Python", "Jupyter"],
        version: "v1.3",
        language: "Python"
    },
    {
        id: 3,
        title: "웹 개발 세미나 발표 자료",
        description: "2024년 1월 웹 개발 세미나 발표 자료입니다. 최신 웹 기술 트렌드와 실무 경험을 공유합니다.",
        category: "프레젠테이션",
        fileType: "PPTX",
        fileSize: "8.7 MB",
        downloads: 456,
        views: 789,
        likes: 34,
        comments: 8,
        author: "박웹",
        authorRole: "풀스택 개발자",
        date: "2024-02-13",
        isPinned: false,
        tags: ["웹개발", "세미나", "발표", "트렌드"],
        version: "v1.0",
        language: "한국어"
    },
    {
        id: 4,
        title: "UI/UX 디자인 시스템 가이드",
        description: "일관된 사용자 경험을 위한 디자인 시스템 가이드입니다. 컴포넌트 라이브러리와 사용법이 포함되어 있습니다.",
        category: "디자인",
        fileType: "Figma",
        fileSize: "12.3 MB",
        downloads: 678,
        views: 1234,
        likes: 56,
        comments: 12,
        author: "최디자인",
        authorRole: "UI/UX 디자이너",
        date: "2024-02-12",
        isPinned: true,
        tags: ["UI/UX", "디자인시스템", "Figma", "컴포넌트"],
        version: "v3.2",
        language: "한국어"
    },
    {
        id: 5,
        title: "데이터베이스 설계 모범 사례",
        description: "효율적인 데이터베이스 설계를 위한 모범 사례와 패턴 모음입니다. MySQL, PostgreSQL 예제가 포함되어 있습니다.",
        category: "문서",
        fileType: "PDF",
        fileSize: "22.1 MB",
        downloads: 523,
        views: 987,
        likes: 41,
        comments: 9,
        author: "정데이터",
        authorRole: "데이터베이스 전문가",
        date: "2024-02-11",
        isPinned: false,
        tags: ["데이터베이스", "설계", "MySQL", "PostgreSQL"],
        version: "v1.5",
        language: "한국어"
    },
    {
        id: 6,
        title: "게임 개발 에셋 팩",
        description: "2D 게임 개발을 위한 스프라이트, 사운드, 애니메이션 에셋 모음입니다. Unity 프로젝트에 바로 사용 가능합니다.",
        category: "에셋",
        fileType: "Unity Package",
        fileSize: "156.7 MB",
        downloads: 234,
        views: 456,
        likes: 28,
        comments: 6,
        author: "한게임",
        authorRole: "게임 개발자",
        date: "2024-02-10",
        isPinned: false,
        tags: ["게임개발", "에셋", "Unity", "2D게임"],
        version: "v2.0",
        language: "영어"
    },
    {
        id: 7,
        title: "블록체인 스마트 컨트랙트 예제",
        description: "Solidity를 사용한 스마트 컨트랙트 개발 예제와 테스트 코드 모음입니다.",
        category: "코드",
        fileType: "ZIP",
        fileSize: "5.2 MB",
        downloads: 345,
        views: 678,
        likes: 19,
        comments: 4,
        author: "김블록",
        authorRole: "블록체인 개발자",
        date: "2024-02-09",
        isPinned: false,
        tags: ["블록체인", "Solidity", "스마트컨트랙트", "Web3"],
        version: "v1.1",
        language: "Solidity"
    },
    {
        id: 8,
        title: "프로젝트 관리 템플릿",
        description: "효율적인 프로젝트 관리를 위한 Excel 템플릿과 Notion 데이터베이스 템플릿입니다.",
        category: "템플릿",
        fileType: "XLSX",
        fileSize: "3.8 MB",
        downloads: 789,
        views: 1234,
        likes: 45,
        comments: 11,
        author: "박관리",
        authorRole: "프로젝트 매니저",
        date: "2024-02-08",
        isPinned: false,
        tags: ["프로젝트관리", "템플릿", "Excel", "Notion"],
        version: "v2.3",
        language: "한국어"
    }
];

const categories = ["전체", "문서", "코드", "디자인", "프레젠테이션", "에셋", "템플릿", "기타"];
const fileTypes = ["전체", "PDF", "ZIP", "PPTX", "Figma", "Unity Package", "XLSX", "기타"];
const languages = ["전체", "한국어", "영어", "Python", "Solidity", "JavaScript"];

export default function ResourcesPage() {
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [selectedFileType, setSelectedFileType] = useState("전체");
    const [selectedLanguage, setSelectedLanguage] = useState("전체");
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

    const filteredResources = mockResources.filter(resource => {
        const matchesCategory = selectedCategory === "전체" || resource.category === selectedCategory;
        const matchesFileType = selectedFileType === "전체" || resource.fileType === selectedFileType;
        const matchesLanguage = selectedLanguage === "전체" || resource.language === selectedLanguage;
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesFileType && matchesLanguage && matchesSearch;
    });

    // 정렬된 자료
    const sortedResources = [...filteredResources].sort((a, b) => {
        if (sortBy === "latest") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === "popular") {
            return (b.views + b.likes + b.comments) - (a.views + a.likes + a.comments);
        } else if (sortBy === "downloads") {
            return b.downloads - a.downloads;
        }
        return 0;
    });

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
        const icons: { [key: string]: any } = {
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
                        <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            자료실
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                            개발 자료실
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
                            개발에 필요한 다양한 자료들을 공유하고 함께 성장해요. 문서, 코드, 디자인 에셋까지 모든 것을 찾아보세요
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
                                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                            </div>
                            <input
                                type="text"
                                placeholder="자료명, 설명, 태그로 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
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
                                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200/60 hover:border-purple-200/60 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    <span className="relative z-10">{category}</span>
                                    {selectedCategory === category && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Filters */}
                    <div className="mb-8">
                        <div className="flex flex-wrap justify-center gap-4">
                            {/* File Type Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">파일형식:</span>
                                <div className="flex gap-2">
                                    {fileTypes.map((fileType) => (
                                        <button
                                            key={fileType}
                                            onClick={() => setSelectedFileType(fileType)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedFileType === fileType
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {fileType}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">언어:</span>
                                <div className="flex gap-2">
                                    {languages.map((language) => (
                                        <button
                                            key={language}
                                            onClick={() => setSelectedLanguage(language)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedLanguage === language
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {language}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resources Grid Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-sm text-slate-600">
                            총 {sortedResources.length}개의 자료
                        </div>

                        <div className="flex items-center gap-4">
                            {/* New Resource Button */}
                            <Link
                                href="/resources/write"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                새 자료
                            </Link>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortOptions(!showSortOptions)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <ArrowUpDown className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {sortBy === "latest" ? "최신순" : sortBy === "popular" ? "인기순" : "다운로드순"}
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
                                                setSortBy("downloads");
                                                setShowSortOptions(false);
                                            }}
                                            className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200 last:rounded-b-xl ${sortBy === "downloads"
                                                ? "bg-slate-100 text-slate-900"
                                                : "text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            다운로드순
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedResources.map((resource) => {
                            const FileTypeIcon = getFileTypeIcon(resource.fileType);
                            return (
                                <article
                                    key={resource.id}
                                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/25 transform hover:-translate-y-3 hover:scale-[1.02] ${resource.isPinned ? 'ring-2 ring-amber-400/40 shadow-amber-200/20' : ''
                                        }`}
                                >
                                    {/* Card Background with enhanced gradients */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 rounded-3xl"></div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-fuchsia-500/5 rounded-3xl"></div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-200/10 rounded-3xl group-hover:to-slate-200/20 transition-all duration-500"></div>

                                    {/* Featured Image Area with enhanced design */}
                                    <div className="relative mb-5 aspect-video overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400">
                                        {/* Dynamic gradient based on category */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${resource.category === '문서' ? 'from-blue-500/20 via-indigo-500/20 to-purple-500/20' :
                                            resource.category === '코드' ? 'from-green-500/20 via-emerald-500/20 to-teal-500/20' :
                                                resource.category === '디자인' ? 'from-purple-500/20 via-violet-500/20 to-fuchsia-500/20' :
                                                    resource.category === '프레젠테이션' ? 'from-orange-500/20 via-amber-500/20 to-yellow-500/20' :
                                                        resource.category === '에셋' ? 'from-pink-500/20 via-rose-500/20 to-red-500/20' :
                                                            resource.category === '템플릿' ? 'from-indigo-500/20 via-blue-500/20 to-purple-500/20' :
                                                                'from-gray-500/20 via-slate-500/20 to-zinc-500/20'
                                            }`}></div>

                                        {/* Category Badge with enhanced styling */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <div className={`rounded-2xl px-4 py-2 text-xs font-bold backdrop-blur-md border-0 shadow-xl transition-all duration-300 group-hover:scale-105 ${getCategoryColor(resource.category)}`}>
                                                {resource.category}
                                            </div>
                                        </div>

                                        {/* File Type Badge */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className={`rounded-2xl px-3 py-2 text-xs font-bold backdrop-blur-md border-0 shadow-xl transition-all duration-300 group-hover:scale-105 ${getFileTypeColor(resource.fileType)}`}>
                                                <div className="flex items-center gap-2">
                                                    <FileTypeIcon className="w-3 h-3" />
                                                    {resource.fileType}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pin Badge */}
                                        {resource.isPinned && (
                                            <div className="absolute top-16 right-4 z-10">
                                                <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 backdrop-blur-md px-3 py-2 text-xs font-bold text-white shadow-xl group-hover:scale-105 transition-all duration-300">
                                                    📌 고정
                                                </div>
                                            </div>
                                        )}

                                        {/* File Info Overlay */}
                                        <div className="absolute bottom-4 left-4 z-10">
                                            <div className="flex items-center gap-2 text-white text-xs font-semibold">
                                                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    {resource.fileSize}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                    <span className="text-xs font-bold">{resource.version}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats Overlay */}
                                        <div className="absolute bottom-4 right-4 z-10">
                                            <div className="flex items-center gap-2 text-white text-xs font-semibold">
                                                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                    <Download className="w-3.5 h-3.5" />
                                                    {resource.downloads}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {resource.views}
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
                                        <h2 className="mb-4 text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2 leading-tight tracking-tight">
                                            {resource.title}
                                        </h2>

                                        {/* Summary with enhanced readability */}
                                        <p className="mb-5 flex-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                            {resource.description}
                                        </p>

                                        {/* Resource Info */}
                                        <div className="mb-5 space-y-3">
                                            {/* Language and Version */}
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold">
                                                    {resource.language}
                                                </div>
                                                <div className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg font-semibold">
                                                    {resource.version}
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {resource.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-semibold hover:bg-slate-200 transition-colors duration-200"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {resource.tags.length > 3 && (
                                                    <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs rounded-lg font-semibold">
                                                        +{resource.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer with enhanced design */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                                    {resource.author.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{resource.author}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{resource.authorRole}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <Calendar className="w-4 h-4" />
                                                <span>{resource.date}</span>
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
                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
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
