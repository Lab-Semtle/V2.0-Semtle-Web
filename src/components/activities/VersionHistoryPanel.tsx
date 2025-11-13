'use client';

import { useState } from 'react';
import { History, Eye, RotateCcw, Trash2, CheckCircle2, MoreVertical, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Version {
    id: number;
    version_number: number;
    created_at: string;
    updated_at: string;
    title?: string;
    subtitle?: string;
    is_published: boolean;
    is_current: boolean;
    version_type?: 'draft' | 'published' | 'snapshot';
    version_label?: string;
}

interface VersionHistoryPanelProps {
    activityId: number;
    selectedVersionId: number | null;
    versions: Version[];
    loading?: boolean;
    onVersionSelect: (versionId: number) => void;
    onVersionRestore?: (versionId: number) => Promise<void>;
    onVersionDelete?: (versionId: number) => Promise<void>;
    onVersionPublish?: (versionId: number) => Promise<void>;
    onRefresh?: () => void;
    className?: string;
}

export default function VersionHistoryPanel({
    selectedVersionId,
    versions,
    loading = false,
    onVersionSelect,
    onVersionRestore,
    onVersionDelete,
    onVersionPublish,
    onRefresh,
    className
}: VersionHistoryPanelProps) {
    const [expanded, setExpanded] = useState(true);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${String(date.getFullYear()).slice(-2)}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const handleRestore = async (versionId: number) => {
        if (!onVersionRestore) return;
        try {
            await onVersionRestore(versionId);
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('버전 복원 오류:', error);
        }
    };

    const handleDelete = async (versionId: number) => {
        if (!onVersionDelete || !confirm('이 버전을 삭제하시겠습니까?')) return;
        try {
            await onVersionDelete(versionId);
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('버전 삭제 오류:', error);
            alert('버전 삭제에 실패했습니다.');
        }
    };

    const handlePublish = async (versionId: number) => {
        if (!onVersionPublish) return;
        try {
            await onVersionPublish(versionId);
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('버전 출판 오류:', error);
        }
    };

    return (
        <div className={cn('bg-white border border-slate-200 rounded-lg shadow-sm', className)}>
            {/* 헤더 */}
            <div
                className="flex items-center justify-between p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-500" />
                    <h3 className="font-semibold text-slate-900">버전 히스토리</h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {versions.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRefresh();
                            }}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title="새로고침"
                        >
                            <RotateCw className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                    <button className="text-slate-400 hover:text-slate-600">
                        {expanded ? '접기' : '펼치기'}
                    </button>
                </div>
            </div>

            {/* 버전 목록 */}
            {expanded && (
                <div className="max-h-[600px] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-slate-500">로딩 중...</div>
                    ) : versions.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">버전이 없습니다.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className={cn(
                                        'p-3 hover:bg-slate-50 transition-colors',
                                        selectedVersionId === version.id && 'bg-blue-50 border-l-2 border-l-blue-500'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => onVersionSelect(version.id)}
                                        >
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-xs font-medium text-slate-600">
                                                    v{version.version_number}
                                                </span>
                                                {version.version_type && (
                                                    <span className={cn(
                                                        "text-xs px-1.5 py-0.5 rounded font-medium",
                                                        version.version_type === 'published' && "bg-blue-100 text-blue-700",
                                                        version.version_type === 'draft' && "bg-yellow-100 text-yellow-700",
                                                        version.version_type === 'snapshot' && "bg-gray-100 text-gray-700"
                                                    )}>
                                                        {version.version_type === 'published' ? '출판' : 
                                                         version.version_type === 'draft' ? '임시저장' : 
                                                         '스냅샷'}
                                                    </span>
                                                )}
                                                {version.version_label && (
                                                    <span className="text-xs text-slate-500 italic">
                                                        {version.version_label}
                                                    </span>
                                                )}
                                                {version.is_published && (
                                                    <StatusBadge status="published" size="sm" />
                                                )}
                                                {version.is_current && (
                                                    <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                                        현재
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 mb-1">
                                                {formatDate(version.updated_at || version.created_at)}
                                            </div>
                                            {version.title && (
                                                <div className="text-sm font-medium text-slate-900 truncate">
                                                    {version.title}
                                                </div>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onVersionSelect(version.id)}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    이 버전 보기
                                                </DropdownMenuItem>
                                                {!version.is_published && onVersionPublish && (
                                                    <DropdownMenuItem onClick={() => handlePublish(version.id)}>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        이 버전 출판
                                                    </DropdownMenuItem>
                                                )}
                                                {!version.is_current && onVersionRestore && (
                                                    <DropdownMenuItem onClick={() => handleRestore(version.id)}>
                                                        <RotateCcw className="w-4 h-4 mr-2" />
                                                        이 버전으로 복원
                                                    </DropdownMenuItem>
                                                )}
                                                {!version.is_published && !version.is_current && onVersionDelete && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(version.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        삭제
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
