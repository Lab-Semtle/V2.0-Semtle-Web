'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';
import HeroSection from '@/components/common/HeroSection';
import SearchBar from '@/components/ui/SearchBar';
import FilterButtons from '@/components/ui/FilterButtons';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import ProjectCard from '@/components/projects/ProjectCard';
import EmptyState from '@/components/common/EmptyState';
import { ProjectPost } from '@/types/project';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectPost[]>([]);
    const [categories, setCategories] = useState<{ name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [selectedStatus, setSelectedStatus] = useState("전체");
    const [selectedDifficulty, setSelectedDifficulty] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // 데이터 로드
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);

                // 캐시 무효화를 위해 timestamp 추가
                const response = await fetch(`/api/projects?t=${Date.now()}`);
                const data = await response.json();

                if (!response.ok) {
                    // API 오류 시에도 빈 배열로 처리하여 정상 렌더링
                    setProjects([]);
                } else {
                    // 데이터가 없어도 정상적으로 처리
                    setProjects(data.projects || []);
                    setCategories(data.categories || []);
                }
            } catch {
                // 네트워크 오류 등도 빈 배열로 처리하여 정상 렌더링
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const filteredPosts = projects.filter(project => {
        const matchesCategory = selectedCategory === "전체" || project.category?.name === selectedCategory;
        const matchesStatus = selectedStatus === "전체" || project.project_data?.project_status === selectedStatus;
        const matchesDifficulty = selectedDifficulty === "전체" || project.project_data?.difficulty === selectedDifficulty;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.subtitle && project.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesStatus && matchesDifficulty && matchesSearch;
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
        if (sortBy === "deadline") {
            return new Date(a.project_data?.deadline || a.created_at).getTime() - new Date(b.project_data?.deadline || b.created_at).getTime();
        }
        if (sortBy === "comments") {
            return (b.comments_count || 0) - (a.comments_count || 0);
        }
        return 0;
    });

    // 고정된 게시물과 일반 게시물 분리
    const pinnedPosts = sortedPosts.filter(post => post.is_pinned);
    const regularPosts = sortedPosts.filter(post => !post.is_pinned);

    // 페이지네이션 (고정된 게시물은 항상 최상단에 표시)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRegularItems = regularPosts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(regularPosts.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                badge="프로젝트"
                badgeColor="bg-green-100 text-green-800"
                title="프로젝트 게시판"
                description="다양한 프로젝트에 참여하고 팀원을 모집하세요"
            />

            {/* Main Content */}
            <main className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search and Filter Section */}
                    <div className="flex flex-col gap-6 mb-10">
                        {/* Search Bar */}
                        <div className="w-full">
                            <SearchBar
                                placeholder="프로젝트 검색..."
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

                                {/* 프로젝트 상태 필터 */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-700">프로젝트 상태</h3>
                                    </div>
                                    <FilterButtons
                                        filters={["전체", "모집중", "진행중", "완료됨"]}
                                        selectedFilter={selectedStatus === "전체" ? "전체" :
                                            selectedStatus === "recruiting" ? "모집중" :
                                                selectedStatus === "active" ? "진행중" : "완료됨"}
                                        onFilterChange={(filter) => {
                                            const statusMap: { [key: string]: string } = {
                                                "전체": "전체",
                                                "모집중": "recruiting",
                                                "진행중": "active",
                                                "완료됨": "completed"
                                            };
                                            setSelectedStatus(statusMap[filter]);
                                        }}
                                        activeColor={selectedStatus === "recruiting" ? "red-500" :
                                            selectedStatus === "active" ? "green-500" :
                                                selectedStatus === "completed" ? "purple-500" : "green-500"}
                                        icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                        compact={true}
                                    />
                                </div>

                                {/* 난이도 필터 */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-700">난이도</h3>
                                    </div>
                                    <FilterButtons
                                        filters={["전체", "초급", "중급", "고급"]}
                                        selectedFilter={selectedDifficulty === "전체" ? "전체" :
                                            selectedDifficulty === "beginner" ? "초급" :
                                                selectedDifficulty === "intermediate" ? "중급" : "고급"}
                                        onFilterChange={(filter) => {
                                            const difficultyMap: { [key: string]: string } = {
                                                "전체": "전체",
                                                "초급": "beginner",
                                                "중급": "intermediate",
                                                "고급": "advanced"
                                            };
                                            setSelectedDifficulty(difficultyMap[filter]);
                                        }}
                                        activeColor="orange-500"
                                        icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                        compact={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sort and Stats */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="text-sm text-slate-600">
                            총 {sortedPosts.length}개의 프로젝트
                        </div>

                        <div className="flex items-center gap-4">
                            {/* 새 프로젝트 추가 버튼 */}
                            <button
                                onClick={() => window.location.href = '/projects/write'}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                새 프로젝트 추가
                            </button>

                            {/* Sort Dropdown */}
                            <SortDropdown
                                options={[
                                    { value: "latest", label: "최신순" },
                                    { value: "popular", label: "조회순" },
                                    { value: "likes", label: "좋아요순" },
                                    { value: "comments", label: "댓글순" },
                                    { value: "deadline", label: "마감일순" }
                                ]}
                                selectedValue={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>
                    </div>

                    {/* Pinned Posts Section */}
                    {pinnedPosts.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">주요 프로젝트</h2>
                                <span className="text-sm text-slate-500">({pinnedPosts.length}개)</span>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {pinnedPosts.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Posts Section */}
                    {regularPosts.length === 0 ? (
                        <EmptyState
                            title="프로젝트가 없습니다"
                            description={
                                searchQuery
                                    ? `"${searchQuery}"에 대한 검색 결과가 없습니다. 다른 검색어를 시도해보세요.`
                                    : selectedCategory !== "전체"
                                        ? `${selectedCategory} 카테고리에 등록된 프로젝트가 없습니다.`
                                        : "아직 등록된 프로젝트가 없습니다. 첫 번째 프로젝트를 등록해보세요!"
                            }
                            action={
                                searchQuery || selectedCategory !== "전체" || selectedStatus !== "전체" || selectedDifficulty !== "전체"
                                    ? {
                                        label: "필터 초기화",
                                        onClick: () => {
                                            setSearchQuery("");
                                            setSelectedCategory("전체");
                                            setSelectedStatus("전체");
                                            setSelectedDifficulty("전체");
                                        }
                                    }
                                    : undefined
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {currentRegularItems.map(project => (
                                <ProjectCard key={project.id} project={project} />
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
