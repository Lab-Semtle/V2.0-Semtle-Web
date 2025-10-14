'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';
import HeroSection from '@/components/common/HeroSection';
import SearchBar from '@/components/ui/SearchBar';
import FilterButtons from '@/components/ui/FilterButtons';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import ResourceCard from '@/components/resources/ResourceCard';
import EmptyState from '@/components/common/EmptyState';
import { ResourcePost } from '@/types/resource';

export default function ResourcesPage() {
    const [resources, setResources] = useState<ResourcePost[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [selectedYear, setSelectedYear] = useState("전체");
    const [selectedSemester, setSelectedSemester] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);

    // 데이터 로드
    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true);
                setError(null); // 이전 오류 상태 초기화

                // 캐시 무효화를 위해 timestamp 추가
                const response = await fetch(`/api/resources?t=${Date.now()}`);
                const data = await response.json();

                console.log('자료실 페이지 API 응답:', data);

                if (!response.ok) {
                    console.error('자료실 API 오류:', response.status, data);
                    // API 오류 시에도 빈 배열로 처리하여 정상 렌더링
                    setResources([]);
                } else {
                    // 데이터가 없어도 정상적으로 처리
                    setResources(data.resources || []);
                    setCategories(data.categories || []);
                    setTypes(data.types || []);
                }
            } catch (err) {
                // 네트워크 오류 등도 빈 배열로 처리하여 정상 렌더링
                setResources([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    // 필터 변경 시 페이지를 1로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedYear, selectedSemester, searchQuery, sortBy]);

    const filteredPosts = resources.filter(resource => {
        const matchesCategory = selectedCategory === "전체" || resource.category?.name === selectedCategory;
        const matchesYear = selectedYear === "전체" || resource.year?.toString() === selectedYear;
        const matchesSemester = selectedSemester === "전체" || resource.semester === selectedSemester;
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.subtitle && resource.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (resource.subject && resource.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (resource.professor && resource.professor.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesYear && matchesSemester && matchesSearch;
    });

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (sortBy === "latest") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "popular") {
            return (b.views || 0) - (a.views || 0);
        }
        if (sortBy === "likes") {
            return (b.likes_count || 0) - (a.likes_count || 0);
        }
        if (sortBy === "downloads") {
            return (b.downloads_count || 0) - (a.downloads_count || 0);
        }
        if (sortBy === "rating") {
            return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
    });

    // 고정된 게시물과 일반 게시물 분리
    const pinnedPosts = sortedPosts.filter(post => post.is_pinned);
    const regularPosts = sortedPosts.filter(post => !post.is_pinned);

    // 페이지네이션
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = regularPosts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(regularPosts.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // 페이지 변경 시 스크롤을 맨 위로 이동
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
                <Navigation />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    // 에러 상태 렌더링 제거 - API 오류 시에도 정상 화면 표시

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <Navigation />

            {/* Hero Section */}
            <HeroSection
                badge="자료실"
                badgeColor="bg-purple-100 text-purple-800"
                title="자료실"
                description="다양한 학습 자료와 파일을 공유하고 다운로드하세요"
            />

            {/* Main Content */}
            <main className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search and Filter Section */}
                    <div className="flex flex-col gap-6 mb-10">
                        {/* Search Bar */}
                        <div className="w-full">
                            <SearchBar
                                placeholder="자료 검색 (제목, 과목, 교수명 등)..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="bg-gradient-to-br from-slate-50/50 to-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-200/60 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* 카테고리 필터 */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-700">카테고리</h3>
                                    </div>
                                    <FilterButtons
                                        filters={["전체", ...categories.map(cat => cat.name)]}
                                        selectedFilter={selectedCategory}
                                        onFilterChange={setSelectedCategory}
                                        activeColor="blue-500"
                                        icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                                        compact={true}
                                    />
                                </div>

                                {/* 연도 필터 */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-700">연도</h3>
                                    </div>
                                    <FilterButtons
                                        filters={["전체", "2024", "2023", "2022", "2021", "2020"]}
                                        selectedFilter={selectedYear}
                                        onFilterChange={setSelectedYear}
                                        activeColor="green-500"
                                        icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                        compact={true}
                                    />
                                </div>

                                {/* 학기 필터 */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-700">학기</h3>
                                    </div>
                                    <FilterButtons
                                        filters={["전체", "1학기", "2학기", "여름학기", "겨울학기"]}
                                        selectedFilter={selectedSemester}
                                        onFilterChange={setSelectedSemester}
                                        activeColor="orange-500"
                                        icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                                        compact={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sort and Stats */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="text-sm text-slate-600">
                            총 {sortedPosts.length}개의 자료
                        </div>

                        <div className="flex items-center gap-4">
                            {/* 새 자료 추가 버튼 */}
                            <button
                                onClick={() => window.location.href = '/resources/write'}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                새 자료 추가
                            </button>

                            {/* Sort Dropdown */}
                            <SortDropdown
                                options={[
                                    { value: "latest", label: "최신순" },
                                    { value: "popular", label: "조회순" },
                                    { value: "likes", label: "좋아요순" },
                                    { value: "downloads", label: "다운로드순" },
                                    { value: "rating", label: "평점순" }
                                ]}
                                selectedValue={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>
                    </div>

                    {/* Pinned Posts Section */}
                    {pinnedPosts.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">주요 자료</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {pinnedPosts.map(resource => (
                                    <ResourceCard key={resource.id} resource={resource} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Posts Section */}
                    {sortedPosts.length === 0 ? (
                        <EmptyState
                            title="자료가 없습니다"
                            description={
                                searchQuery
                                    ? `"${searchQuery}"에 대한 검색 결과가 없습니다. 다른 검색어를 시도해보세요.`
                                    : selectedCategory !== "전체" || selectedYear !== "전체" || selectedSemester !== "전체"
                                        ? `선택한 필터 조건에 맞는 자료가 없습니다.`
                                        : "아직 등록된 자료가 없습니다. 첫 번째 자료를 업로드해보세요!"
                            }
                            action={
                                searchQuery || selectedCategory !== "전체" || selectedYear !== "전체" || selectedSemester !== "전체"
                                    ? {
                                        label: "필터 초기화",
                                        onClick: () => {
                                            setSearchQuery("");
                                            setSelectedCategory("전체");
                                            setSelectedYear("전체");
                                            setSelectedSemester("전체");
                                        }
                                    }
                                    : undefined
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {currentItems.map(resource => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="mt-12 mb-16">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={paginate}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}