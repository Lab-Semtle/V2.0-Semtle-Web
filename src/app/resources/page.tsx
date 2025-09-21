'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Filter, Calendar, Users, MessageCircle, Eye, Heart, Share2, ChevronRight, X, ArrowUpDown, Download, FileText, Image as ImageIcon, Video, Music, Archive, Code, Presentation, BookOpen, FileSpreadsheet, File, Palette, Plus, Pin } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/common/HeroSection';
import SearchBar from '@/components/ui/SearchBar';
import FilterButtons from '@/components/ui/FilterButtons';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import ResourceCard from '@/components/cards/ResourceCard';

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
        isPinned: true,
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
    const router = useRouter();
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
        // 고정된 게시물을 최상단에 표시
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // 고정된 게시물들끼리는 날짜순으로 정렬
        if (a.isPinned && b.isPinned) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }

        // 일반 게시물은 선택된 정렬 기준에 따라 정렬
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
            <HeroSection
                badge="자료실"
                badgeColor="bg-purple-100 text-purple-800"
                title="개발 자료실"
                description="개발에 필요한 다양한 자료들을 공유하고 함께 성장해요. 문서, 코드, 디자인 에셋까지 모든 것을 찾아보세요"
            />

            {/* Main Content */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-8">
                        <SearchBar
                            placeholder="자료명, 설명, 태그로 검색..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            focusColor="purple-500"
                        />
                    </div>

                    {/* Filter Section */}
                    <div className="mb-12">
                        <FilterButtons
                            filters={categories}
                            selectedFilter={selectedCategory}
                            onFilterChange={setSelectedCategory}
                            activeColor="purple-500"
                        />
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
                            <SortDropdown
                                options={[
                                    { value: "latest", label: "최신순" },
                                    { value: "popular", label: "인기순" },
                                    { value: "downloads", label: "다운로드순" }
                                ]}
                                selectedValue={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sortedResources.map((resource) => (
                            <ResourceCard
                                key={resource.id}
                                {...resource}
                                onClick={() => {
                                    router.push(`/resources/${resource.id}`);
                                }}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={1}
                        totalPages={5}
                        onPageChange={(page) => console.log('Page changed:', page)}
                        className="mt-16"
                    />
                </div>
            </section>

            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
}
