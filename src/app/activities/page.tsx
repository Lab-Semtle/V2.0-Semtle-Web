'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pin } from 'lucide-react';
// Removed unused imports
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/common/HeroSection';
import SearchBar from '@/components/ui/SearchBar';
import FilterButtons from '@/components/ui/FilterButtons';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import PostCard from '@/components/cards/PostCard';

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
    const router = useRouter();
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
        }
        return 0;
    });

    // getCategoryColor function moved to PostCard component

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            {/* Hero Section */}
            <HeroSection
                badge="학회활동"
                badgeColor="bg-blue-100 text-blue-800"
                title="아치셈틀 활동 소식"
                description="세미나, 프로젝트, 스터디 등 다양한 학회 활동과 소식을 확인하고 참여해보세요"
            />

            {/* Main Content */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-8">
                        <SearchBar
                            placeholder="제목, 내용, 태그로 검색..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            focusColor="blue-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="mb-12">
                        <FilterButtons
                            filters={categories}
                            selectedFilter={selectedCategory}
                            onFilterChange={setSelectedCategory}
                            activeColor="slate-900"
                        />
                    </div>


                    {/* Posts Grid Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-sm text-slate-600">
                            총 {sortedPosts.length}개의 게시물
                        </div>

                        {/* Sort Dropdown */}
                        <SortDropdown
                            options={[
                                { value: "latest", label: "최신순" },
                                { value: "popular", label: "인기순" }
                            ]}
                            selectedValue={sortBy}
                            onSortChange={setSortBy}
                        />
                    </div>

                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sortedPosts.map((post) => (
                            <PostCard
                                key={post.id}
                                {...post}
                                onClick={() => {
                                    router.push(`/activities/${post.id}`);
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
