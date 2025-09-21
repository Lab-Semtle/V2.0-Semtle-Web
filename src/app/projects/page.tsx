'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Filter, Calendar, Users, MessageCircle, Eye, Heart, Share2, ChevronRight, X, ArrowUpDown, UserPlus, Clock, MapPin, Code, Palette, Database, Smartphone, Globe, Plus, Pin } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/common/HeroSection';
import SearchBar from '@/components/ui/SearchBar';
import FilterButtons from '@/components/ui/FilterButtons';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import ProjectCard from '@/components/cards/ProjectCard';

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
        isPinned: true,
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
    const router = useRouter();
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
            <HeroSection
                badge="프로젝트"
                badgeColor="bg-green-100 text-green-800"
                title="프로젝트 팀원 모집"
                description="함께 성장할 팀원을 찾아보세요. 다양한 기술 스택과 아이디어로 멋진 프로젝트를 만들어가요"
            />

            {/* Main Content */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-8">
                        <SearchBar
                            placeholder="프로젝트명, 기술스택, 태그로 검색..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            focusColor="green-500"
                        />
                    </div>

                    {/* Filter Section */}
                    <div className="mb-12">
                        <FilterButtons
                            filters={categories}
                            selectedFilter={selectedCategory}
                            onFilterChange={setSelectedCategory}
                            activeColor="green-500"
                        />
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
                            <SortDropdown
                                options={[
                                    { value: "latest", label: "최신순" },
                                    { value: "popular", label: "인기순" },
                                    { value: "deadline", label: "마감임박순" }
                                ]}
                                selectedValue={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sortedProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                {...project}
                                onClick={() => {
                                    router.push(`/projects/${project.id}`);
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