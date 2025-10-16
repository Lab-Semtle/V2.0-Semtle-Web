// =============================================
// 자료실 게시판 관련 타입 정의
// =============================================

import { Post } from './post';

export interface ResourcePost extends Post {
    resource_data?: ResourceData;
    files?: ResourceFile[];
}

export interface ResourceFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    file_path: string;
    original_filename?: string;
    file_extension?: string;
}

export interface ResourceData {
    post_id: number;
    resource_type_id: number;
    resource_type?: {
        id: number;
        name: string;
        description?: string;
        icon?: string;
        color?: string;
        file_extensions?: string[];
    };
    file_extension?: string;
    original_filename?: string;
    file_size?: number;
    file_url?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    rating: number;
    rating_count: number;
    downloads_count: number;
    last_downloaded?: string;
}

export interface ResourceDownload {
    id: number;
    resource_id: number;
    user_id: string;
    downloaded_at: string;
    ip_address?: string;
    user_agent?: string;
}

export interface ResourceCreateData {
    // 기본 게시물 정보
    title: string;
    subtitle?: string;
    content: unknown;
    thumbnail?: string;
    category_id: number;
    status?: 'draft' | 'published';
    tags?: string[];

    // 자료 특화 정보
    resource_type_id: number;
    file_extension?: string;
    original_filename?: string;
    file_size?: number;
    file_url?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    rating: number;
    rating_count: number;
}

export interface ResourceUpdateData {
    // 기본 게시물 정보
    title?: string;
    subtitle?: string;
    content?: unknown;
    thumbnail?: string;
    category_id?: number;
    status?: 'draft' | 'published' | 'hidden';
    tags?: string[];

    // 자료 특화 정보
    resource_type_id?: number;
    file_extension?: string;
    original_filename?: string;
    file_size?: number;
    file_url?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
    rating?: number;
    rating_count?: number;
}

export interface ResourceFilters {
    resource_type_id?: number;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    difficulty_level?: string;
    file_extension?: string;
    downloads_min?: number;
    downloads_max?: number;
    uploaded_from?: string;
    uploaded_to?: string;
}

export interface ResourceStats {
    total_resources: number;
    total_downloads: number;
    file_types: Record<string, number>;
    subjects: Record<string, number>;
    verified_resources: number;
}

export interface FileUploadResponse {
    url: string;
    path: string;
    size: number;
    type: string;
}
