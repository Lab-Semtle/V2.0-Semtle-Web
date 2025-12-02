'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import ResourceCard from '@/components/resources/ResourceCard';
import EmptyState from '@/components/common/EmptyState';
import { ResourcePost } from '@/types/resource';
import { SlidersHorizontal, FolderOpen, CalendarDays, BookOpen, Trash2, Edit, X, ChevronDown } from 'lucide-react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedTabs } from '@/components/layout/AnimatedTabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function ResourcesPageContent() {
    const router = useRouter();
    const { isAdmin, user } = useAuth();
    const searchParams = useSearchParams();
    const [resources, setResources] = useState<ResourcePost[]>([]);
    const [categories, setCategories] = useState<{ name: string }[]>([]);
    const [availableYears, setAvailableYears] = useState<string[]>(["전체"]);
    const [availableSemesters, setAvailableSemesters] = useState<string[]>(["전체", "1학기", "2학기", "여름학기", "겨울학기"]);
    const [loading, setLoading] = useState(true);

    // URL 파라미터에서 초기값 읽기
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "전체");
    const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || "전체");
    const [selectedSemester, setSelectedSemester] = useState(searchParams.get('semester') || "전체");
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || "latest");
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [itemsPerPage, setItemsPerPage] = useState(4);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedResources, setSelectedResources] = useState<Set<number>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
    const [totalResourcesCount, setTotalResourcesCount] = useState<number>(0);

    // 데이터 로드
    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true);

                // activeTab에 따라 쿼리 파라미터 추가
                // 전체 개수를 가져오기 위해 limit을 매우 큰 값으로 설정
                let apiUrl = `/api/resources?t=${Date.now()}&limit=10000`;
                if (activeTab === 'my' && user?.id) {
                    apiUrl += `&author_id=${user.id}`;
                }

                const response = await fetch(apiUrl);
                const data = await response.json();

                if (!response.ok) {
                    // API 오류 시에도 빈 배열로 처리하여 정상 렌더링
                    setResources([]);
                } else {
                    // 데이터가 없어도 정상적으로 처리
                    setResources(data.resources || []);
                    setCategories(data.categories || []);
                    
                    // 전체 개수 설정 (공개된 게시물만)
                    if (activeTab === 'all') {
                        // 공개된 게시물의 전체 개수
                        setTotalResourcesCount(data.resources?.length || 0);
                    } else {
                        // 내 자료의 경우 전체 개수
                        setTotalResourcesCount(data.resources?.length || 0);
                    }

                    // 실제 데이터에서 연도 추출 (버전 데이터가 평탄화되어 있음)
                    interface ResourceWithVersion extends Omit<ResourcePost, 'created_at'> {
                        year?: number | null;
                        semester?: string | null;
                        subject?: string | null;
                        professor?: string | null;
                        created_at?: string;
                    }

                    const years: string[] = Array.from(new Set(
                        (data.resources || [])
                            .map((resource: ResourcePost) => (resource as ResourceWithVersion).year)
                            .filter((year: number | null | undefined) => year != null)
                            .map((year: number) => year.toString())
                            .sort((a: string, b: string) => parseInt(b) - parseInt(a)) // 내림차순 정렬 (최신 연도가 앞)
                    ));

                    // 연도가 있으면 "전체"와 함께 표시, 없으면 "전체"만 표시
                    setAvailableYears(years.length > 0 ? ["전체", ...years] : ["전체"]);

                    // 학기는 하드코딩으로 고정
                    setAvailableSemesters(["전체", "1학기", "2학기", "여름학기", "겨울학기"]);
                }
            } catch {
                // 네트워크 오류 등도 빈 배열로 처리하여 정상 렌더링
                setResources([]);
                // 오류 시에도 기본값 설정
                setAvailableYears(["전체"]);
                setAvailableSemesters(["전체", "1학기", "2학기", "여름학기", "겨울학기"]);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [activeTab, user?.id]);

    // 브라우저 사이즈에 따라 한 행에 표시되는 카드 개수를 계산하고, itemsPerPage를 (카드 개수 × 3)으로 설정
    useEffect(() => {
        const updateItemsPerPage = () => {
            const windowWidth = window.innerWidth;

            // 브레이크포인트 기반으로 카드 개수 결정 (Tailwind 기준)
            let cardsPerRow = 1; // 기본값 (모바일, < 640px)

            if (windowWidth >= 1024) {
                // lg 이상 (≥ 1024px): 4열
                cardsPerRow = 4;
            } else if (windowWidth >= 768) {
                // md 이상 (≥ 768px): 3열
                cardsPerRow = 3;
            } else if (windowWidth >= 640) {
                // sm 이상 (≥ 640px): 2열
                cardsPerRow = 2;
            }

            // itemsPerPage = 카드 개수 × 3
            setItemsPerPage(cardsPerRow * 3);
        };

        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    // 필터/정렬 변경 시 URL 업데이트 및 페이지 1로 리셋
    useEffect(() => {
        setCurrentPage(1);

        // URL 업데이트 (히스토리 추가하지 않음)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams();
            if (selectedCategory !== '전체') params.set('category', selectedCategory);
            if (selectedYear !== '전체') params.set('year', selectedYear);
            if (selectedSemester !== '전체') params.set('semester', selectedSemester);
            if (searchQuery) params.set('search', searchQuery);
            if (sortBy !== 'latest') params.set('sort', sortBy);

            const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, [selectedCategory, selectedYear, selectedSemester, searchQuery, sortBy]);

    // 선택된 필터가 "전체"가 아닌 것들만 반환
    const activeFilters = [
        selectedCategory !== "전체" && { type: "카테고리", value: selectedCategory, onRemove: () => setSelectedCategory("전체") },
        selectedYear !== "전체" && { type: "연도", value: selectedYear, onRemove: () => setSelectedYear("전체") },
        selectedSemester !== "전체" && { type: "학기", value: selectedSemester, onRemove: () => setSelectedSemester("전체") },
    ].filter(Boolean) as Array<{ type: string; value: string; onRemove: () => void }>;

    // 게시물 필터링 (전체 자료 또는 내 자료)
    interface ResourceWithVersion extends Omit<ResourcePost, 'created_at'> {
        year?: number | null;
        semester?: string | null;
        subject?: string | null;
        professor?: string | null;
        created_at?: string;
    }

    const filteredPosts = resources.filter(resource => {
        const resourceWithVersion = resource as ResourceWithVersion;
        const matchesCategory = selectedCategory === "전체" || resource.category?.name === selectedCategory;
        // 버전 데이터가 평탄화되어 있으므로 버전 필드에 직접 접근
        const resourceYear = resourceWithVersion.year;
        const matchesYear = selectedYear === "전체" || (resourceYear !== null && resourceYear !== undefined && resourceYear.toString() === selectedYear);

        // 학기 필터: "전체" 선택 시 모든 게시물, 아니면 semester 필드가 정확히 일치하는지 확인
        const resourceSemester = resourceWithVersion.semester;
        const matchesSemester = selectedSemester === "전체" ||
            (resourceSemester !== null &&
                resourceSemester !== undefined &&
                resourceSemester !== '' &&
                resourceSemester === selectedSemester);

        const resourceSubject = resourceWithVersion.subject;
        const resourceProfessor = resourceWithVersion.professor;
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.subtitle && resource.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (resourceSubject && resourceSubject.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (resourceProfessor && resourceProfessor.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (((resource as unknown as { tags?: string[] }).tags ?? []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesYear && matchesSemester && matchesSearch;
    });

    // 게시물 정렬
    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (sortBy === "latest") {
            const resourceA = a as ResourceWithVersion;
            const resourceB = b as ResourceWithVersion;
            const dateA = a.published_at || resourceA.created_at;
            const dateB = b.published_at || resourceB.created_at;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        }
        if (sortBy === "likes") {
            return (b.likes_count || 0) - (a.likes_count || 0);
        }
        if (sortBy === "downloads") {
            return (b.downloads_count || 0) - (a.downloads_count || 0);
        }
        return 0;
    });

    // 게시물의 고정/일반 분리
    const pinnedPosts = sortedPosts.filter(post => ((post as unknown as { is_pinned?: boolean }).is_pinned === true));
    const regularPosts = sortedPosts.filter(post => !((post as unknown as { is_pinned?: boolean }).is_pinned === true));

    // 현재 활성 탭에 따른 게시물 선택 (통계용)
    const currentPosts = sortedPosts;

    // 게시물 페이지네이션
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = regularPosts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(regularPosts.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        setSelectedResources(new Set());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 게시물 선택 토글
    const handleSelectResource = (resourceId: number) => {
        setSelectedResources(prev => {
            const newSet = new Set(prev);
            if (newSet.has(resourceId)) {
                newSet.delete(resourceId);
            } else {
                newSet.add(resourceId);
            }
            return newSet;
        });
    };

    // 선택된 게시물 삭제
    const handleDeleteSelected = async () => {
        if (selectedResources.size === 0) return;

        const confirmMessage = selectedResources.size === 1
            ? '선택한 게시물을 삭제하시겠습니까?'
            : `${selectedResources.size}개의 게시물을 삭제하시겠습니까?`;

        if (!confirm(confirmMessage)) return;

        setIsDeleting(true);
        try {
            const deletePromises = Array.from(selectedResources).map(resourceId =>
                fetch(`/api/resources/${resourceId}/delete`, {
                    method: 'DELETE',
                })
            );

            const results = await Promise.all(deletePromises);
            const failed = results.filter(r => !r.ok);

            if (failed.length > 0) {
                alert(`일부 게시물 삭제에 실패했습니다. (${failed.length}개 실패)`);
            } else {
                // 성공적으로 삭제된 경우 목록 새로고침
                const response = await fetch('/api/resources');
                const data = await response.json();
                if (response.ok) {
                    setResources(data.resources || []);
                    setSelectedResources(new Set());
                    alert('게시물이 성공적으로 삭제되었습니다.');
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
        if (selectedResources.size === 1) {
            const resourceId = Array.from(selectedResources)[0];
            router.push(`/resources/edit/${resourceId}`);
        }
    };

    // 검색/필터 변경 시 선택 해제
    useEffect(() => {
        setSelectedResources(new Set());
    }, [searchQuery, selectedCategory, activeTab]);

    // 에러 상태 렌더링 제거 - API 오류 시에도 정상 화면 표시

    return (
        <div className="min-h-screen bg-white">
            {/* Main Content */}
            <main className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* 필터 영역 */}
                    <div className="mb-6 lg:mb-8">
                        <div className="relative bg-white/20 backdrop-blur-md border border-slate-200/20 rounded-2xl p-5 lg:p-6 transition-all duration-200">
                            {/* 검색창 + 필터 Select들 (데스크톱) */}
                            <div className="hidden lg:flex flex-col gap-4 relative z-10">
                                {/* 첫 번째 줄: 검색창 + 필터 Select들 */}
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <SearchBar
                                            placeholder="자료 검색 (제목, 과목, 교수명 등)..."
                                            value={searchQuery}
                                            onChange={setSearchQuery}
                                            className="max-w-full mx-0"
                                        />
                                    </div>
                                    <Separator orientation="vertical" className="h-8 bg-slate-200/40" />
                                    <div className="flex items-center gap-2.5 flex-shrink-0">
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger className="w-[140px] h-9 bg-white/60 hover:bg-white/90 border-slate-200/50 text-sm font-medium transition-all duration-150">
                                                <div className="flex items-center gap-2">
                                                    <FolderOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                                    <SelectValue placeholder="카테고리" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="전체">전체</SelectItem>
                                                {Array.isArray(categories) && categories.map((cat) => (
                                                    <SelectItem key={cat.name} value={cat.name}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger className="w-[120px] h-9 bg-white/60 hover:bg-white/90 border-slate-200/50 text-sm font-medium transition-all duration-150">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                                    <SelectValue placeholder="연도" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableYears.map((year) => (
                                                    <SelectItem key={year} value={year}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                            <SelectTrigger className="w-[120px] h-9 bg-white/60 hover:bg-white/90 border-slate-200/50 text-sm font-medium transition-all duration-150">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                                    <SelectValue placeholder="학기" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSemesters.map((semester) => (
                                                    <SelectItem key={semester} value={semester}>
                                                        {semester}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {/* 두 번째 줄: 선택된 필터 Badge들 */}
                                {activeFilters.length > 0 && (
                                    <div className="flex items-center gap-2.5 flex-wrap pt-3.5 border-t border-slate-100">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {activeFilters.map((filter, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-50/80 border border-slate-200/40 text-slate-700 hover:bg-slate-100/80 transition-colors"
                                                >
                                                    <span>{filter.type}: <span className="font-semibold text-slate-900">{filter.value}</span></span>
                                                    <button
                                                        onClick={filter.onRemove}
                                                        className="ml-0.5 hover:bg-slate-200/60 rounded-full p-0.5 transition-colors"
                                                        aria-label="필터 제거"
                                                    >
                                                        <X className="w-3 h-3 text-slate-400" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setSelectedCategory("전체");
                                                    setSelectedYear("전체");
                                                    setSelectedSemester("전체");
                                                }}
                                                className="text-xs text-slate-500 hover:text-red-600 font-medium px-2 py-1 rounded-md hover:bg-red-50/60 transition-colors"
                                            >
                                                모두 초기화
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 모바일/태블릿: Collapsible 필터 */}
                            <div className="lg:hidden relative z-10">
                                <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                    <div className="flex flex-col gap-3.5">
                                        {/* 검색창 */}
                                        <SearchBar
                                            placeholder="자료 검색 (제목, 과목, 교수명 등)..."
                                            value={searchQuery}
                                            onChange={setSearchQuery}
                                            className="max-w-full mx-0"
                                        />
                                        {/* 필터 토글 버튼 */}
                                        <CollapsibleTrigger asChild>
                                            <button className="inline-flex items-center justify-between px-4 py-2.5 bg-slate-50/60 border border-slate-200/40 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100/60 hover:border-slate-300/50 transition-all duration-150">
                                                <div className="flex items-center gap-2">
                                                    <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                                                    <span>필터</span>
                                                    {activeFilters.length > 0 && (
                                                        <Badge variant="secondary" className="ml-1.5 bg-blue-100/80 text-blue-700 border-blue-200/60 font-medium text-[10px] px-1.5 py-0">
                                                            {activeFilters.length}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                        </CollapsibleTrigger>
                                        {/* 필터 콘텐츠 */}
                                        <CollapsibleContent className="space-y-3.5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 duration-200">
                                            <div className="pt-3.5 border-t border-slate-100 space-y-3.5">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                                        <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                                                        카테고리
                                                    </label>
                                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                        <SelectTrigger className="h-9 bg-white/60 hover:bg-white/90 border-slate-200/50 text-sm">
                                                            <SelectValue placeholder="카테고리 선택" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="전체">전체</SelectItem>
                                                            {Array.isArray(categories) && categories.map((cat) => (
                                                                <SelectItem key={cat.name} value={cat.name}>
                                                                    {cat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                                        <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
                                                        연도
                                                    </label>
                                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                        <SelectTrigger className="h-9 bg-white/60 hover:bg-white/90 border-slate-200/50 text-sm">
                                                            <SelectValue placeholder="연도 선택" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableYears.map((year) => (
                                                                <SelectItem key={year} value={year}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                                                        학기
                                                    </label>
                                                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                                        <SelectTrigger className="h-9 bg-white/60 hover:bg-white/90 border-slate-200/50 text-sm">
                                                            <SelectValue placeholder="학기 선택" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableSemesters.map((semester) => (
                                                                <SelectItem key={semester} value={semester}>
                                                                    {semester}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                        {/* 선택된 필터 Badge들 (모바일) */}
                                        {activeFilters.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap pt-3.5 border-t border-slate-100">
                                                <div className="flex items-center gap-2 flex-wrap w-full">
                                                    {activeFilters.map((filter, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-50/80 border border-slate-200/40 text-slate-700 hover:bg-slate-100/80 transition-colors"
                                                        >
                                                            <span>{filter.type}: <span className="font-semibold text-slate-900">{filter.value}</span></span>
                                                            <button
                                                                onClick={filter.onRemove}
                                                                className="ml-0.5 hover:bg-slate-200/60 rounded-full p-0.5 transition-colors"
                                                                aria-label="필터 제거"
                                                            >
                                                                <X className="w-3 h-3 text-slate-400" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCategory("전체");
                                                            setSelectedYear("전체");
                                                            setSelectedSemester("전체");
                                                        }}
                                                        className="text-xs text-slate-500 hover:text-red-600 font-medium px-2 py-1 rounded-md hover:bg-red-50/60 transition-colors"
                                                    >
                                                        모두 초기화
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Collapsible>
                            </div>
                        </div>
                    </div>

                    {/* Resources Content */}
                    <div className="flex-1">

                        {/* 헤더 영역: 탭, 자료 개수, 버튼들 */}
                        <div className="flex flex-col gap-4 mb-8">
                            {/* 데스크톱 레이아웃 (lg 이상) */}
                            <div className="hidden lg:block">
                                {/* 첫 번째 줄: 탭 + 자료 개수 + 정렬 + 새 자료 추가 */}
                                <div className="flex items-center justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-4">
                                        {/* 탭 */}
                                        {user && (
                                            <AnimatedTabs
                                                tabs={[
                                                    { label: "전체 자료", value: "all" },
                                                    { label: "내 자료", value: "my" }
                                                ]}
                                                value={activeTab}
                                                onValueChange={(value) => {
                                                    setActiveTab(value as 'all' | 'my');
                                                    setCurrentPage(1);
                                                    setSelectedResources(new Set());
                                                }}
                                            />
                                        )}
                                        {/* 자료 개수 */}
                                        {selectedResources.size === 0 ? (
                                            <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                                총 <span className="text-slate-700 font-semibold">{activeTab === 'all' ? totalResourcesCount : currentPosts.length}</span>개의 자료
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg whitespace-nowrap">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                {selectedResources.size}개 선택됨
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* 선택 시 액션 버튼들 또는 새 자료 추가하기 */}
                                        {selectedResources.size > 0 && isAdmin() ? (
                                            <>
                                                <button
                                                    onClick={handleEditSelected}
                                                    disabled={selectedResources.size !== 1 || isDeleting}
                                                    className={`flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${selectedResources.size === 1
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
                                                    onClick={() => setSelectedResources(new Set())}
                                                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 whitespace-nowrap"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>취소</span>
                                                </button>
                                            </>
                                        ) : (
                                            selectedResources.size === 0 && isAdmin() && (
                                                <button
                                                    onClick={() => router.push('/resources/write')}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 whitespace-nowrap"
                                                >
                                                    <span className="text-base leading-none">+</span>
                                                    <span>새 자료 추가하기</span>
                                                </button>
                                            )
                                        )}
                                        {/* 정렬 */}
                                        <SortDropdown
                                            options={[
                                                { value: "latest", label: "최신순" },
                                                { value: "likes", label: "좋아요순" },
                                                { value: "downloads", label: "다운로드순" }
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
                                {/* 첫 번째 줄: 탭 + 자료 개수/선택 개수 + 버튼들 + 정렬 */}
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {user && (
                                            <AnimatedTabs
                                                tabs={[
                                                    { label: "전체 자료", value: "all" },
                                                    { label: "내 자료", value: "my" }
                                                ]}
                                                value={activeTab}
                                                onValueChange={(value) => {
                                                    setActiveTab(value as 'all' | 'my');
                                                    setCurrentPage(1);
                                                    setSelectedResources(new Set());
                                                }}
                                            />
                                        )}
                                        {selectedResources.size === 0 ? (
                                            <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                                총 <span className="text-slate-700 font-semibold">{activeTab === 'all' ? totalResourcesCount : currentPosts.length}</span>개
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg whitespace-nowrap">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                {selectedResources.size}개 선택됨
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* 선택 시 액션 버튼들 또는 새 자료 추가하기 */}
                                        {selectedResources.size > 0 && isAdmin() ? (
                                            <>
                                                <button
                                                    onClick={handleEditSelected}
                                                    disabled={selectedResources.size !== 1 || isDeleting}
                                                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${selectedResources.size === 1
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
                                                    onClick={() => setSelectedResources(new Set())}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 whitespace-nowrap flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>취소</span>
                                                </button>
                                            </>
                                        ) : (
                                            selectedResources.size === 0 && isAdmin() && (
                                                <button
                                                    onClick={() => router.push('/resources/write')}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 md:px-3 md:py-1.5 lg:px-4 lg:py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 whitespace-nowrap"
                                                >
                                                    <span className="text-base leading-none">+</span>
                                                    <span>새 자료 추가하기</span>
                                                </button>
                                            )
                                        )}
                                        {/* 정렬 */}
                                        <SortDropdown
                                            options={[
                                                { value: "latest", label: "최신순" },
                                                { value: "likes", label: "좋아요순" },
                                                { value: "downloads", label: "다운로드순" }
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
                                {user && (
                                    <div className="w-full">
                                        <AnimatedTabs
                                            tabs={[
                                                { label: "전체 자료", value: "all" },
                                                { label: "내 자료", value: "my" }
                                            ]}
                                            value={activeTab}
                                            onValueChange={(value) => {
                                                setActiveTab(value as 'all' | 'my');
                                                setCurrentPage(1);
                                                setSelectedResources(new Set());
                                            }}
                                        />
                                    </div>
                                )}
                                {/* 두 번째 줄: 자료 개수 또는 선택 개수 + 정렬 */}
                                <div className="flex items-center justify-between gap-3">
                                    {selectedResources.size === 0 ? (
                                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                            총 <span className="text-slate-700 font-semibold">{activeTab === 'all' ? totalResourcesCount : currentPosts.length}</span>개의 자료
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg w-fit whitespace-nowrap">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                            {selectedResources.size}개 선택됨
                                        </div>
                                    )}
                                    <SortDropdown
                                        options={[
                                            { value: "latest", label: "최신순" },
                                            { value: "likes", label: "좋아요순" },
                                            { value: "downloads", label: "다운로드순" }
                                        ]}
                                        selectedValue={sortBy}
                                        onSortChange={setSortBy}
                                        className="min-w-[120px]"
                                    />
                                </div>
                                {/* 네 번째 줄: 버튼들 */}
                                {selectedResources.size === 0 ? (
                                    isAdmin() && (
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => router.push('/resources/write')}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 whitespace-nowrap w-full"
                                            >
                                                <span className="text-base leading-none">+</span>
                                                <span>새 자료 추가하기</span>
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    isAdmin() && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                onClick={handleEditSelected}
                                                disabled={selectedResources.size !== 1 || isDeleting}
                                                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-1 min-w-0 ${selectedResources.size === 1
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
                                                onClick={() => setSelectedResources(new Set())}
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

                        {/* 로딩 스피너 (탭 내부에만 표시) */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                {/* Pinned Posts Section */}
                                {pinnedPosts.length > 0 && (
                                    <div className="mb-8 sm:mb-12">
                                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">주요 자료</h2>
                                            <span className="text-xs sm:text-sm text-slate-500">({pinnedPosts.length}개)</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-5 md:gap-x-6 gap-y-6 sm:gap-y-7 md:gap-y-8">
                                            {pinnedPosts.map((resource, index) => (
                                                <ResourceCard
                                                    key={resource.id}
                                                    resource={resource}
                                                    isSelectable={activeTab === 'my'}
                                                    isSelected={selectedResources.has(resource.id)}
                                                    onSelect={handleSelectResource}
                                                    priority={index === 0}
                                                />
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
                                                    : activeTab === 'my'
                                                        ? "아직 작성한 자료가 없습니다. 첫 번째 자료를 업로드해보세요!"
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
                                    <div
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-5 md:gap-x-6 gap-y-6 sm:gap-y-7 md:gap-y-8"
                                    >
                                        {currentItems.map((resource, index) => (
                                            <ResourceCard
                                                key={resource.id}
                                                resource={resource}
                                                isSelectable={activeTab === 'my'}
                                                isSelected={selectedResources.has(resource.id)}
                                                onSelect={handleSelectResource}
                                                priority={pinnedPosts.length === 0 && index === 0}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 0 && (
                                    <div className="mt-12">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={paginate}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ResourcesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50"><div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div></div>}>
            <ResourcesPageContent />
        </Suspense>
    );
}