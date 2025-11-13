'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import ProjectCard from '@/components/projects/ProjectCard';
import EmptyState from '@/components/common/EmptyState';
import { ProjectPost } from '@/types/project';
import { SlidersHorizontal, FolderOpen, CheckCircle2, X, ChevronDown, Trash2, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedTabs } from '@/components/layout/AnimatedTabs';

export default function ProjectsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [projects, setProjects] = useState<ProjectPost[]>([]);
    const [categories, setCategories] = useState<{ name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [selectedStatus, setSelectedStatus] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // 프로젝트 게시판은 1열이므로 항상 10개 고정
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
    const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    // 데이터 로드
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);

                // activeTab에 따라 쿼리 파라미터 추가
                let apiUrl = `/api/projects?t=${Date.now()}`;
                if (activeTab === 'my' && user?.id) {
                    apiUrl += `&author_id=${user.id}`;
                }

                const [projectsRes, categoriesRes] = await Promise.all([
                    fetch(apiUrl),
                    fetch('/api/categories')
                ]);

                if (projectsRes.ok) {
                    const projectsData = await projectsRes.json();
                    setProjects(projectsData.projects || []);
                }

                if (categoriesRes.ok) {
                    const categoriesData = await categoriesRes.json();
                    setCategories(categoriesData.categories || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [activeTab, user?.id]);

    // 필터/정렬 변경 시 페이지 1로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedStatus, searchQuery, sortBy, activeTab]);

    const filteredPosts = Array.isArray(projects) ? projects.filter(project => {
        const matchesCategory = selectedCategory === "전체" || project.category?.name === selectedCategory;
        const matchesStatus = selectedStatus === "전체" || project.project_data?.project_status === selectedStatus;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.subtitle && project.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (((project as unknown as { tags?: string[] }).tags ?? []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesStatus && matchesSearch;
    }) : [];

    const sortedPosts = [...filteredPosts].sort((a, b) => {
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

    // 고정된 게시물과 일반 게시물 분리
    const pinnedPosts = sortedPosts.filter(post => ((post as unknown as { is_pinned?: boolean }).is_pinned === true));
    const regularPosts = sortedPosts.filter(post => !((post as unknown as { is_pinned?: boolean }).is_pinned === true));

    // 페이지네이션 (고정된 게시물은 항상 최상단에 표시)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRegularItems = regularPosts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(regularPosts.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        setSelectedProjects(new Set());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 게시물 선택 토글
    const handleSelectProject = (projectId: number) => {
        setSelectedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    // 선택된 게시물 삭제
    const handleDeleteSelected = async () => {
        if (selectedProjects.size === 0) return;

        const confirmMessage = selectedProjects.size === 1
            ? '선택한 프로젝트를 삭제하시겠습니까?'
            : `${selectedProjects.size}개의 프로젝트를 삭제하시겠습니까?`;

        if (!confirm(confirmMessage)) return;

        setIsDeleting(true);
        try {
            const deletePromises = Array.from(selectedProjects).map(projectId =>
                fetch(`/api/projects/${projectId}`, {
                    method: 'DELETE',
                })
            );

            const results = await Promise.all(deletePromises);
            const failed = results.filter(r => !r.ok);

            if (failed.length > 0) {
                alert(`일부 프로젝트 삭제에 실패했습니다. (${failed.length}개 실패)`);
            } else {
                // 성공적으로 삭제된 경우 목록 새로고침
                let apiUrl = `/api/projects?t=${Date.now()}`;
                if (activeTab === 'my' && user?.id) {
                    apiUrl += `&author_id=${user.id}`;
                }
                const response = await fetch(apiUrl);
                const data = await response.json();
                if (response.ok) {
                    setProjects(data.projects || []);
                    setSelectedProjects(new Set());
                    alert('프로젝트가 성공적으로 삭제되었습니다.');
                }
            }
        } catch {
            alert('프로젝트 삭제 중 오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    // 선택된 게시물 수정 (단일 선택일 때만)
    const handleEditSelected = () => {
        if (selectedProjects.size === 1) {
            const projectId = Array.from(selectedProjects)[0];
            router.push(`/projects/edit/${projectId}`);
        }
    };

    // 검색/필터 변경 시 선택 해제
    useEffect(() => {
        setSelectedProjects(new Set());
    }, [searchQuery, selectedCategory, selectedStatus, activeTab]);

    // 선택된 필터가 "전체"가 아닌 것들만 반환
    const activeFilters = [
        selectedCategory !== "전체" && { type: "카테고리", value: selectedCategory, onRemove: () => setSelectedCategory("전체") },
        selectedStatus !== "전체" && { type: "상태", value: selectedStatus === "recruiting" ? "모집중" : selectedStatus === "active" ? "진행중" : selectedStatus === "completed" ? "완료됨" : selectedStatus, onRemove: () => setSelectedStatus("전체") },
    ].filter(Boolean) as Array<{ type: string; value: string; onRemove: () => void }>;

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

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
                                            placeholder="프로젝트 검색 (제목, 설명 등)..."
                                            value={searchQuery}
                                            onChange={setSearchQuery}
                                            className="max-w-full mx-0"
                                        />
                                    </div>
                                    <Separator orientation="vertical" className="h-8 bg-slate-200/40" />
                                    <div className="flex items-center gap-2.5 flex-shrink-0">
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger className="w-[160px] h-9 bg-white/60 hover:bg-white/90 border-slate-200/50 text-sm font-medium transition-all duration-150">
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
                                        <Select value={selectedStatus === "전체" ? "전체" : selectedStatus === "recruiting" ? "모집중" : selectedStatus === "active" ? "진행중" : selectedStatus === "completed" ? "완료됨" : "전체"} onValueChange={(value) => {
                                            const statusMap: { [key: string]: string } = {
                                                "전체": "전체",
                                                "모집중": "recruiting",
                                                "진행중": "active",
                                                "완료됨": "completed"
                                            };
                                            setSelectedStatus(statusMap[value]);
                                        }}>
                                            <SelectTrigger className="w-[140px] h-9 bg-white/60 hover:bg-white/90 border-slate-200/50 text-sm font-medium transition-all duration-150">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                                    <SelectValue placeholder="상태" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="전체">전체</SelectItem>
                                                <SelectItem value="모집중">모집중</SelectItem>
                                                <SelectItem value="진행중">진행중</SelectItem>
                                                <SelectItem value="완료됨">완료됨</SelectItem>
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
                                                    setSelectedStatus("전체");
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
                                            placeholder="프로젝트 검색 (제목, 설명 등)..."
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
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        프로젝트 상태
                                                    </label>
                                                    <Select value={selectedStatus === "전체" ? "전체" : selectedStatus === "recruiting" ? "모집중" : selectedStatus === "active" ? "진행중" : selectedStatus === "completed" ? "완료됨" : "전체"} onValueChange={(value) => {
                                                        const statusMap: { [key: string]: string } = {
                                                            "전체": "전체",
                                                            "모집중": "recruiting",
                                                            "진행중": "active",
                                                            "완료됨": "completed"
                                                        };
                                                        setSelectedStatus(statusMap[value]);
                                                    }}>
                                                        <SelectTrigger className="h-9 bg-white/60 hover:bg-white/90 border-slate-200/50 text-sm">
                                                            <SelectValue placeholder="상태 선택" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="전체">전체</SelectItem>
                                                            <SelectItem value="모집중">모집중</SelectItem>
                                                            <SelectItem value="진행중">진행중</SelectItem>
                                                            <SelectItem value="완료됨">완료됨</SelectItem>
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
                                                            setSelectedStatus("전체");
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

                    {/* Projects Content */}
                    <div className="flex-1">
                        {/* 헤더 영역: 게시물 개수, 버튼들 */}
                        <div className="flex flex-col gap-4 mb-8">
                            {/* 데스크톱 레이아웃 (lg 이상) */}
                            <div className="hidden lg:block">
                                {/* 첫 번째 줄: 탭 + 게시물 개수 + 정렬 + 새 프로젝트 추가 */}
                                <div className="flex items-center justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-4">
                                        {/* 탭 */}
                                        {user && (
                                            <AnimatedTabs
                                                tabs={[
                                                    { label: "전체 프로젝트", value: "all" },
                                                    { label: "내 프로젝트", value: "my" }
                                                ]}
                                                value={activeTab}
                                                onValueChange={(value) => {
                                                    setActiveTab(value as 'all' | 'my');
                                                    setCurrentPage(1);
                                                }}
                                            />
                                        )}
                                        {/* 게시물 개수 */}
                                        {selectedProjects.size === 0 ? (
                                            <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                                총 <span className="text-slate-700 font-semibold">{sortedPosts.length}</span>개의 프로젝트
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg whitespace-nowrap">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                {selectedProjects.size}개 선택됨
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* 선택 시 액션 버튼들 또는 새 프로젝트 추가하기 */}
                                        {selectedProjects.size > 0 ? (
                                            <>
                                                <button
                                                    onClick={handleEditSelected}
                                                    disabled={selectedProjects.size !== 1 || isDeleting}
                                                    className={`flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${selectedProjects.size === 1
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
                                                    onClick={() => setSelectedProjects(new Set())}
                                                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 whitespace-nowrap"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>취소</span>
                                                </button>
                                            </>
                                        ) : (
                                            selectedProjects.size === 0 && user && (
                                                <button
                                                    onClick={() => router.push('/projects/write')}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 whitespace-nowrap"
                                                >
                                                    <span className="text-base leading-none">+</span>
                                                    <span>새 프로젝트 추가하기</span>
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
                                        {user && (
                                            <AnimatedTabs
                                                tabs={[
                                                    { label: "전체", value: "all" },
                                                    { label: "내 프로젝트", value: "my" }
                                                ]}
                                                value={activeTab}
                                                onValueChange={(value) => {
                                                    setActiveTab(value as 'all' | 'my');
                                                    setCurrentPage(1);
                                                }}
                                            />
                                        )}
                                        {selectedProjects.size === 0 ? (
                                            <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                                총 <span className="text-slate-700 font-semibold">{sortedPosts.length}</span>개
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg whitespace-nowrap">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                {selectedProjects.size}개 선택됨
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* 선택 시 액션 버튼들 또는 새 프로젝트 추가하기 */}
                                        {selectedProjects.size > 0 ? (
                                            <>
                                                <button
                                                    onClick={handleEditSelected}
                                                    disabled={selectedProjects.size !== 1 || isDeleting}
                                                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${selectedProjects.size === 1
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
                                                    onClick={() => setSelectedProjects(new Set())}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 whitespace-nowrap flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>취소</span>
                                                </button>
                                            </>
                                        ) : (
                                            selectedProjects.size === 0 && user && (
                                                <button
                                                    onClick={() => router.push('/projects/write')}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 md:px-3 md:py-1.5 lg:px-4 lg:py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 whitespace-nowrap"
                                                >
                                                    <span className="text-base leading-none">+</span>
                                                    <span>새 프로젝트 추가하기</span>
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
                                {user && (
                                    <div className="w-full">
                                        <AnimatedTabs
                                            tabs={[
                                                { label: "전체 프로젝트", value: "all" },
                                                { label: "내 프로젝트", value: "my" }
                                            ]}
                                            value={activeTab}
                                            onValueChange={(value) => {
                                                setActiveTab(value as 'all' | 'my');
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                )}
                                {/* 두 번째 줄: 게시물 개수 또는 선택 개수 + 정렬 */}
                                <div className="flex items-center justify-between gap-3">
                                    {selectedProjects.size === 0 ? (
                                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                            총 <span className="text-slate-700 font-semibold">{sortedPosts.length}</span>개의 프로젝트
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg w-fit whitespace-nowrap">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                            {selectedProjects.size}개 선택됨
                                        </div>
                                    )}
                                    <SortDropdown
                                        options={[
                                            { value: "latest", label: "최신순" },
                                            { value: "likes", label: "좋아요순" },
                                            { value: "comments", label: "댓글순" },
                                            { value: "deadline", label: "마감일순" }
                                        ]}
                                        selectedValue={sortBy}
                                        onSortChange={setSortBy}
                                        className="min-w-[120px]"
                                    />
                                </div>
                                {/* 세 번째 줄: 버튼들 */}
                                {selectedProjects.size === 0 ? (
                                    user && (
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => router.push('/projects/write')}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 whitespace-nowrap w-full"
                                            >
                                                <span className="text-base leading-none">+</span>
                                                <span>새 프로젝트 추가하기</span>
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={handleEditSelected}
                                            disabled={selectedProjects.size !== 1 || isDeleting}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-1 min-w-0 ${selectedProjects.size === 1
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
                                            onClick={() => setSelectedProjects(new Set())}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 whitespace-nowrap flex-1 min-w-0"
                                        >
                                            <X className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>취소</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 로딩 스피너 */}
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
                                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">주요 프로젝트</h2>
                                            <span className="text-xs sm:text-sm text-slate-500">({pinnedPosts.length}개)</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-8 sm:gap-6">
                                            {pinnedPosts.map((project) => (
                                                <div key={project.id} className="w-full min-w-0">
                                                    <ProjectCard
                                                        project={project}
                                                        isSelectable={activeTab === 'my'}
                                                        isSelected={selectedProjects.has(project.id)}
                                                        onSelect={handleSelectProject}
                                                    />
                                                </div>
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
                                                : selectedCategory !== "전체" || selectedStatus !== "전체"
                                                    ? `선택한 필터 조건에 맞는 프로젝트가 없습니다.`
                                                    : activeTab === 'my'
                                                        ? "아직 작성한 프로젝트가 없습니다. 첫 번째 프로젝트를 등록해보세요!"
                                                        : "아직 등록된 프로젝트가 없습니다. 첫 번째 프로젝트를 등록해보세요!"
                                        }
                                        action={
                                            searchQuery || selectedCategory !== "전체" || selectedStatus !== "전체"
                                                ? {
                                                    label: "필터 초기화",
                                                    onClick: () => {
                                                        setSearchQuery("");
                                                        setSelectedCategory("전체");
                                                        setSelectedStatus("전체");
                                                    }
                                                }
                                                : undefined
                                        }
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 gap-8 sm:gap-6">
                                        {currentRegularItems.map((project) => (
                                            <div key={project.id} className="w-full min-w-0">
                                                <ProjectCard
                                                    project={project}
                                                    isSelectable={activeTab === 'my'}
                                                    isSelected={selectedProjects.has(project.id)}
                                                    onSelect={handleSelectProject}
                                                />
                                            </div>
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