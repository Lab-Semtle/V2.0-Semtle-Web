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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    // 데이터 로드
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError(null); // 이전 오류 상태 초기화

                const response = await fetch('/api/projects');
                const data = await response.json();

                if (!response.ok) {
                    console.warn('프로젝트 데이터 로드 실패, 빈 배열로 처리:', data.error);
                    // API 오류 시에도 빈 배열로 처리하여 정상 렌더링
                    setProjects([]);
                } else {
                    // 데이터가 없어도 정상적으로 처리
                    setProjects(data.projects || []);
                }
            } catch (err) {
                console.warn('프로젝트 데이터 로드 오류, 빈 배열로 처리:', err);
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
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.subtitle && project.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (sortBy === "latest") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "popular") {
            return b.views - a.views;
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

    const categories = ["전체", "웹개발", "모바일앱", "AI/ML", "게임개발", "해커톤", "공모전", "연구프로젝트", "사이드프로젝트"];

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
                        <div className="w-full">
                            <FilterButtons
                                filters={categories}
                                selectedFilter={selectedCategory}
                                onFilterChange={setSelectedCategory}
                            />
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
                                    { value: "popular", label: "인기순" }
                                ]}
                                selectedValue={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>
                    </div>

                    {/* Pinned Posts Section */}
                    {pinnedPosts.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">주요 프로젝트</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {pinnedPosts.map(project => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Posts Section */}
                    {sortedPosts.length === 0 ? (
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
                                searchQuery || selectedCategory !== "전체"
                                    ? {
                                        label: "필터 초기화",
                                        onClick: () => {
                                            setSearchQuery("");
                                            setSelectedCategory("전체");
                                        }
                                    }
                                    : undefined
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentItems.map(project => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={paginate}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}