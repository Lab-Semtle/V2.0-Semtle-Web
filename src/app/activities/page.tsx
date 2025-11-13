'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import FilterButtons from '@/components/ui/FilterButtons';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import ActivityCard from '@/components/activities/ActivityCard';
import EmptyState from '@/components/common/EmptyState';
import { ActivityPost } from '@/types/activity';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Edit, X } from 'lucide-react';
import { AnimatedTabs } from '@/components/layout/AnimatedTabs';


export default function ActivitiesPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [activities, setActivities] = useState<ActivityPost[]>([]);
    const [categories, setCategories] = useState<{ name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [unpublishedActivities, setUnpublishedActivities] = useState<ActivityPost[]>([]);
    const [loadingUnpublished, setLoadingUnpublished] = useState(false);
    const [unpublishedCurrentPage, setUnpublishedCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<'published' | 'unpublished'>('published');

    // 데이터 로드
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/activities');
                const data = await response.json();

                if (!response.ok) {
                    // API 오류 시에도 빈 배열로 처리하여 정상 렌더링
                    setActivities([]);
                } else {
                    // 데이터가 없어도 정상적으로 처리
                    setActivities(data.activities || []);
                    setCategories(data.categories || []);
                }
            } catch {
                // 네트워크 오류 등도 빈 배열로 처리하여 정상 렌더링
                setActivities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    // 화면 크기에 따른 itemsPerPage 동적 계산
    useEffect(() => {
        const updateItemsPerPage = () => {
            const windowWidth = window.innerWidth;

            // 브레이크포인트 기반으로 카드 개수 결정 (Tailwind 기준)
            let cardsPerRow = 1; // 기본값 (모바일, < 640px)

            if (windowWidth >= 1024) {
                // lg 이상 (≥ 1024px): 4열
                cardsPerRow = 4;
            } else if (windowWidth >= 640) {
                // sm 이상 (≥ 640px): 2열
                cardsPerRow = 2;
            }

            // itemsPerPage = 카드 개수 × 4
            setItemsPerPage(cardsPerRow * 4);
        };

        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    // 출판되지 않은 활동 목록 로드 (관리자 전용, 탭이 unpublished일 때만)
    useEffect(() => {
        const fetchUnpublishedActivities = async () => {
            if (!isAdmin() || activeTab !== 'unpublished') return;

            try {
                setLoadingUnpublished(true);
                const response = await fetch('/api/activities/unpublished');
                const data = await response.json();

                if (response.ok) {
                    setUnpublishedActivities(data.activities || []);
                    // 데이터 로드 후 첫 페이지로 리셋
                    setUnpublishedCurrentPage(1);
                } else {
                    setUnpublishedActivities([]);
                }
            } catch {
                setUnpublishedActivities([]);
            } finally {
                setLoadingUnpublished(false);
            }
        };

        fetchUnpublishedActivities();
    }, [activeTab, isAdmin]);

    // 출판된 게시물 필터링
    const filteredPublishedPosts = activities.filter(activity => {
        const matchesCategory = selectedCategory === "전체" || activity.category?.name === selectedCategory;
        const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (activity.subtitle && activity.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (((activity as unknown as { tags?: string[] }).tags ?? []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    // 출판되지 않은 게시물 필터링
    const filteredUnpublishedPosts = unpublishedActivities.filter(activity => {
        const matchesCategory = selectedCategory === "전체" || activity.category?.name === selectedCategory;
        const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (activity.subtitle && activity.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (((activity as unknown as { tags?: string[] }).tags ?? []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    // 출판된 게시물 정렬
    const sortedPublishedPosts = [...filteredPublishedPosts].sort((a, b) => {
        if (sortBy === "latest") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "likes") {
            return (b.likes_count || 0) - (a.likes_count || 0);
        }
        if (sortBy === "comments") {
            return (b.comments_count || 0) - (a.comments_count || 0);
        }
        return 0;
    });

    // 출판되지 않은 게시물 정렬
    const sortedUnpublishedPosts = [...filteredUnpublishedPosts].sort((a, b) => {
        if (sortBy === "latest") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "likes") {
            return (b.likes_count || 0) - (a.likes_count || 0);
        }
        if (sortBy === "comments") {
            return (b.comments_count || 0) - (a.comments_count || 0);
        }
        return 0;
    });

    // 출판된 게시물의 고정/일반 분리
    const publishedPinnedPosts = sortedPublishedPosts.filter(post => ((post as unknown as { is_pinned?: boolean }).is_pinned === true));
    const publishedRegularPosts = sortedPublishedPosts.filter(post => !((post as unknown as { is_pinned?: boolean }).is_pinned === true));

    // 출판되지 않은 게시물의 고정/일반 분리
    const unpublishedPinnedPosts = sortedUnpublishedPosts.filter(post => ((post as unknown as { is_pinned?: boolean }).is_pinned === true));
    const unpublishedRegularPosts = sortedUnpublishedPosts.filter(post => !((post as unknown as { is_pinned?: boolean }).is_pinned === true));

    // 현재 활성 탭에 따른 게시물 선택 (통계용)
    const currentPosts = activeTab === 'published' ? sortedPublishedPosts : sortedUnpublishedPosts;

    // 출판된 게시물 페이지네이션
    const publishedIndexOfLastItem = currentPage * itemsPerPage;
    const publishedIndexOfFirstItem = publishedIndexOfLastItem - itemsPerPage;
    const currentPublishedItems = publishedRegularPosts.slice(publishedIndexOfFirstItem, publishedIndexOfLastItem);
    const publishedTotalPages = Math.ceil(publishedRegularPosts.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // 페이지 변경 시 선택 해제
        setSelectedActivities(new Set());
    };

    // 출판되지 않은 게시물 페이지네이션
    const unpublishedIndexOfLastItem = unpublishedCurrentPage * itemsPerPage;
    const unpublishedIndexOfFirstItem = unpublishedIndexOfLastItem - itemsPerPage;
    const currentUnpublishedItems = unpublishedRegularPosts.slice(unpublishedIndexOfFirstItem, unpublishedIndexOfLastItem);
    const unpublishedTotalPages = Math.ceil(unpublishedRegularPosts.length / itemsPerPage);

    const paginateUnpublished = (pageNumber: number) => {
        setUnpublishedCurrentPage(pageNumber);
        // 페이지 변경 시 선택 해제
        setSelectedActivities(new Set());
    };

    // 게시물 선택 토글
    const handleSelectActivity = (activityId: number) => {
        setSelectedActivities(prev => {
            const newSet = new Set(prev);
            if (newSet.has(activityId)) {
                newSet.delete(activityId);
            } else {
                newSet.add(activityId);
            }
            return newSet;
        });
    };

    // 전체 선택/해제
    // const handleSelectAll = () => {
    //     if (selectedActivities.size === currentItems.length) {
    //         setSelectedActivities(new Set());
    //     } else {
    //         setSelectedActivities(new Set(currentItems.map(a => a.id)));
    //     }
    // };

    // 선택된 게시물 삭제
    const handleDeleteSelected = async () => {
        if (selectedActivities.size === 0) return;

        const confirmMessage = selectedActivities.size === 1
            ? '선택한 게시물을 삭제하시겠습니까?'
            : `${selectedActivities.size}개의 게시물을 삭제하시겠습니까?`;

        if (!confirm(confirmMessage)) return;

        setIsDeleting(true);
        try {
            const deletePromises = Array.from(selectedActivities).map(activityId =>
                fetch(`/api/activities/${activityId}/delete`, {
                    method: 'DELETE',
                })
            );

            const results = await Promise.all(deletePromises);
            const failed = results.filter(r => !r.ok);

            if (failed.length > 0) {
                alert(`일부 게시물 삭제에 실패했습니다. (${failed.length}개 실패)`);
            } else {
                // 성공적으로 삭제된 경우 목록 새로고침
                const response = await fetch('/api/activities');
                const data = await response.json();
                if (response.ok) {
                    setActivities(data.activities || []);
                    setSelectedActivities(new Set());
                    alert('게시물이 성공적으로 삭제되었습니다.');
                }

                // 출판되지 않은 탭이 활성화되어 있으면 목록 새로고침
                if (activeTab === 'unpublished') {
                    const unpublishedResponse = await fetch('/api/activities/unpublished');
                    const unpublishedData = await unpublishedResponse.json();
                    if (unpublishedResponse.ok) {
                        setUnpublishedActivities(unpublishedData.activities || []);
                        setUnpublishedCurrentPage(1);
                    }
                }
            }
        } catch {
            alert('게시물 삭제 중 오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    // 선택된 게시물 수정 (단일 선택일 때만)
    const handleEditSelected = () => {
        if (selectedActivities.size === 1) {
            const activityId = Array.from(selectedActivities)[0];
            router.push(`/activities/edit/${activityId}`);
        }
    };

    // 검색/필터 변경 시 선택 해제
    useEffect(() => {
        setSelectedActivities(new Set());
    }, [searchQuery, selectedCategory, activeTab]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    // 에러 상태 렌더링 제거 - API 오류 시에도 정상 화면 표시

    return (
        <div className="min-h-screen bg-white">

            {/* Main Content */}
            <main className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search and Filter Section */}
                    <div className="flex flex-col gap-6 mb-10">
                        {/* Search Bar */}
                        <div className="w-full">
                            <SearchBar
                                placeholder="활동 검색..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="w-full flex justify-center">
                            <FilterButtons
                                filters={["전체", ...categories.map(cat => cat.name)]}
                                selectedFilter={selectedCategory}
                                onFilterChange={setSelectedCategory}
                            />
                        </div>
                    </div>

                    {/* 헤더 영역: 탭, 게시물 개수, 버튼들 */}
                    <div className="flex flex-col gap-4 mb-8">
                        {/* 데스크톱 레이아웃 (lg 이상) */}
                        <div className="hidden lg:block">
                            {/* 첫 번째 줄: 탭 + 게시물 개수 + 정렬 + 새 게시물 추가 */}
                            <div className="flex items-center justify-between gap-4 mb-3">
                                <div className="flex items-center gap-4">
                                    {/* 탭 */}
                                    {isAdmin() && (
                                        <AnimatedTabs
                                            tabs={[
                                                { label: "공개된 게시물", value: "published" },
                                                { label: "비공개된 게시물", value: "unpublished" }
                                            ]}
                                            value={activeTab}
                                            onValueChange={(value) => {
                                                setActiveTab(value as 'published' | 'unpublished');
                                                setCurrentPage(1);
                                                setUnpublishedCurrentPage(1);
                                                setSelectedActivities(new Set());
                                            }}
                                        />
                                    )}
                                    {/* 게시물 개수 */}
                                    {selectedActivities.size === 0 ? (
                                        <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                            총 <span className="text-slate-700 font-semibold">{currentPosts.length}</span>개의 게시물
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg whitespace-nowrap">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                            {selectedActivities.size}개 선택됨
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* 선택 시 액션 버튼들 또는 새 게시물 추가하기 */}
                                    {selectedActivities.size > 0 && isAdmin() ? (
                                        <>
                                            <button
                                                onClick={handleEditSelected}
                                                disabled={selectedActivities.size !== 1 || isDeleting}
                                                className={`flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${selectedActivities.size === 1
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span>수정하기</span>
                                            </button>
                                            <button
                                                onClick={handleDeleteSelected}
                                                disabled={isDeleting}
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>삭제하기</span>
                                            </button>
                                            <button
                                                onClick={() => setSelectedActivities(new Set())}
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 whitespace-nowrap"
                                            >
                                                <X className="w-4 h-4" />
                                                <span>취소</span>
                                            </button>
                                        </>
                                    ) : (
                                        selectedActivities.size === 0 && isAdmin() && (
                                            <button
                                                onClick={() => router.push('/activities/write')}
                                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 whitespace-nowrap"
                                            >
                                                <span className="text-base leading-none">+</span>
                                                <span>새 게시물 작성하기</span>
                                            </button>
                                        )
                                    )}
                                    {/* 정렬 */}
                                    <SortDropdown
                                        options={[
                                            { value: "latest", label: "최신순" },
                                            { value: "likes", label: "좋아요순" },
                                            { value: "comments", label: "댓글순" }
                                        ]}
                                        selectedValue={sortBy}
                                        onSortChange={setSortBy}
                                        className="min-w-[120px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 태블릿 레이아웃 (md 이상, lg 미만) */}
                        <div className="hidden md:flex lg:hidden flex-col gap-3">
                            {/* 첫 번째 줄: 탭 + 게시물 개수/선택 개수 + 버튼들 + 정렬 */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    {isAdmin() && (
                                        <AnimatedTabs
                                            tabs={[
                                                { label: "공개", value: "published" },
                                                { label: "비공개", value: "unpublished" }
                                            ]}
                                            value={activeTab}
                                            onValueChange={(value) => {
                                                setActiveTab(value as 'published' | 'unpublished');
                                                setCurrentPage(1);
                                                setUnpublishedCurrentPage(1);
                                                setSelectedActivities(new Set());
                                            }}
                                        />
                                    )}
                                    {selectedActivities.size === 0 ? (
                                        <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                            총 <span className="text-slate-700 font-semibold">{currentPosts.length}</span>개
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg whitespace-nowrap">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                            {selectedActivities.size}개 선택됨
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* 선택 시 액션 버튼들 또는 새 게시물 추가하기 */}
                                    {selectedActivities.size > 0 && isAdmin() ? (
                                        <>
                                            <button
                                                onClick={handleEditSelected}
                                                disabled={selectedActivities.size !== 1 || isDeleting}
                                                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${selectedActivities.size === 1
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span>수정하기</span>
                                            </button>
                                            <button
                                                onClick={handleDeleteSelected}
                                                disabled={isDeleting}
                                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>삭제하기</span>
                                            </button>
                                            <button
                                                onClick={() => setSelectedActivities(new Set())}
                                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 whitespace-nowrap flex-shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                                <span>취소</span>
                                            </button>
                                        </>
                                    ) : (
                                        selectedActivities.size === 0 && isAdmin() && (
                                            <button
                                                onClick={() => router.push('/activities/write')}
                                                className="flex items-center justify-center gap-2 px-4 py-2 md:px-3 md:py-1.5 lg:px-4 lg:py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 whitespace-nowrap"
                                            >
                                                <span className="text-base leading-none">+</span>
                                                <span>새 게시물 작성하기</span>
                                            </button>
                                        )
                                    )}
                                    {/* 정렬 */}
                                    <SortDropdown
                                        options={[
                                            { value: "latest", label: "최신순" },
                                            { value: "likes", label: "좋아요순" },
                                            { value: "comments", label: "댓글순" }
                                        ]}
                                        selectedValue={sortBy}
                                        onSortChange={setSortBy}
                                        className="min-w-[120px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 모바일 레이아웃 (md 미만) */}
                        <div className="flex flex-col gap-3 md:hidden">
                            {/* 첫 번째 줄: 탭 */}
                            {isAdmin() && (
                                <div className="w-full">
                                    <AnimatedTabs
                                        tabs={[
                                            { label: "공개된 게시물", value: "published" },
                                            { label: "비공개된 게시물", value: "unpublished" }
                                        ]}
                                        value={activeTab}
                                        onValueChange={(value) => {
                                            setActiveTab(value as 'published' | 'unpublished');
                                            setCurrentPage(1);
                                            setUnpublishedCurrentPage(1);
                                            setSelectedActivities(new Set());
                                        }}
                                    />
                                </div>
                            )}
                            {/* 두 번째 줄: 게시물 개수 또는 선택 개수 + 정렬 */}
                            <div className="flex items-center justify-between gap-3">
                                {selectedActivities.size === 0 ? (
                                    <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                        총 <span className="text-slate-700 font-semibold">{currentPosts.length}</span>개의 게시물
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg w-fit">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        {selectedActivities.size}개 선택됨
                                    </div>
                                )}
                                <SortDropdown
                                    options={[
                                        { value: "latest", label: "최신순" },
                                        { value: "likes", label: "좋아요순" },
                                        { value: "comments", label: "댓글순" }
                                    ]}
                                    selectedValue={sortBy}
                                    onSortChange={setSortBy}
                                    className="min-w-[120px]"
                                />
                            </div>
                            {/* 세 번째 줄: 버튼들 */}
                            {selectedActivities.size === 0 ? (
                                isAdmin() && (
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => router.push('/activities/write')}
                                            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 whitespace-nowrap w-full"
                                        >
                                            <span className="text-base leading-none">+</span>
                                            <span>새 게시물 작성하기</span>
                                        </button>
                                    </div>
                                )
                            ) : (
                                isAdmin() && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={handleEditSelected}
                                            disabled={selectedActivities.size !== 1 || isDeleting}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-1 min-w-0 ${selectedActivities.size === 1
                                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md'
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <Edit className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>수정하기</span>
                                        </button>
                                        <button
                                            onClick={handleDeleteSelected}
                                            disabled={isDeleting}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-1 min-w-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>삭제하기</span>
                                        </button>
                                        <button
                                            onClick={() => setSelectedActivities(new Set())}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 whitespace-nowrap flex-1 min-w-0"
                                        >
                                            <X className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>취소</span>
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>


                    {/* 출판되지 않은 게시물 탭 컨텐츠 */}
                    {isAdmin() && activeTab === 'unpublished' && (
                        <>
                                                {loadingUnpublished ? (
                                                    <div className="flex items-center justify-center py-12">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                    </div>
                            ) : filteredUnpublishedPosts.length === 0 ? (
                                                    <EmptyState
                                                        title="출판되지 않은 게시물이 없습니다"
                                                        description="임시저장된 게시물이나 비공개 게시물이 여기에 표시됩니다."
                                                    />
                                                ) : (
                                                    <>
                                    {/* Pinned Posts Section (출판되지 않은) */}
                                    {unpublishedPinnedPosts.length > 0 && (
                                        <div className="mb-12">
                                            <h2 className="text-2xl font-bold text-slate-900 mb-6">주요 활동</h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                                {unpublishedPinnedPosts.map((activity, index) => (
                                                    <ActivityCard
                                                        key={activity.id}
                                                        activity={activity}
                                                        isSelectable={isAdmin()}
                                                        isSelected={selectedActivities.has(activity.id)}
                                                        onSelect={handleSelectActivity}
                                                        priority={index === 0}
                                                    />
                                                ))}
                                                            </div>
                                                            </div>
                                                        )}

                                    {/* Regular Posts Section (출판되지 않은) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                        {currentUnpublishedItems.map((activity, index) => (
                                                                    <ActivityCard
                                                                        key={activity.id}
                                                                        activity={activity}
                                                                        isSelectable={isAdmin()}
                                                                        isSelected={selectedActivities.has(activity.id)}
                                                                        onSelect={handleSelectActivity}
                                                priority={unpublishedPinnedPosts.length === 0 && index === 0}
                                                                    />
                                                                ))}
                                                        </div>
                                                        
                                    {/* Pagination (출판되지 않은) */}
                                                        {unpublishedTotalPages > 0 && (
                                        <div className="mt-12 mb-16">
                                                                <Pagination
                                                                    currentPage={unpublishedCurrentPage}
                                                                    totalPages={unpublishedTotalPages}
                                                                    onPageChange={paginateUnpublished}
                                                                />
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                        </>
                            )}

                    {/* 출판된 게시물 탭 컨텐츠 (기본 또는 관리자일 때 published 탭) */}
                    {(!isAdmin() || activeTab === 'published') && (
                        <>
                    {/* Pinned Posts Section */}
                            {publishedPinnedPosts.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">주요 활동</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                        {publishedPinnedPosts.map((activity, index) => (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                        isSelectable={isAdmin()}
                                        isSelected={selectedActivities.has(activity.id)}
                                        onSelect={handleSelectActivity}
                                        priority={index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Posts Section */}
                            {sortedPublishedPosts.length === 0 ? (
                        <EmptyState
                            title="활동이 없습니다"
                            description={
                                searchQuery
                                    ? `"${searchQuery}"에 대한 검색 결과가 없습니다. 다른 검색어를 시도해보세요.`
                                    : selectedCategory !== "전체"
                                        ? `${selectedCategory} 카테고리에 등록된 활동이 없습니다.`
                                        : "아직 등록된 활동이 없습니다. 첫 번째 활동을 등록해보세요!"
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                    {currentPublishedItems.map((activity, index) => (
                                <ActivityCard
                                    key={activity.id}
                                    activity={activity}
                                    isSelectable={isAdmin()}
                                    isSelected={selectedActivities.has(activity.id)}
                                    onSelect={handleSelectActivity}
                                            priority={publishedPinnedPosts.length === 0 && index === 0}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                            {publishedTotalPages > 0 && (
                        <div className="mt-12 mb-16">
                            <Pagination
                                currentPage={currentPage}
                                        totalPages={publishedTotalPages}
                                onPageChange={paginate}
                            />
                        </div>
                            )}
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}