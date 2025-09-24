// =============================================
// 자료실 게시판 관련 타입 정의
// =============================================

import { Post } from './post';

export interface ResourcePost extends Post {
    resource_data?: ResourceData;
}

export interface ResourceData {
    post_id: number;
    file_type: 'document' | 'code' | 'presentation' | 'image' | 'video' | 'other';
    file_extension?: string;
    file_size?: number;
    file_url?: string;
    file_name?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    version: string;
    language?: string;
    license: string;
    resource_status: 'active' | 'outdated' | 'removed';
    is_verified: boolean;
    verified_by?: string;
    verified_at?: string;
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
    file_type: 'document' | 'code' | 'presentation' | 'image' | 'video' | 'other';
    file_extension?: string;
    file_size?: number;
    file_url?: string;
    file_name?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    version?: string;
    language?: string;
    license?: string;
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
    file_type?: 'document' | 'code' | 'presentation' | 'image' | 'video' | 'other';
    file_extension?: string;
    file_size?: number;
    file_url?: string;
    file_name?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    version?: string;
    language?: string;
    license?: string;
    resource_status?: 'active' | 'outdated' | 'removed';
}

export interface ResourceFilters {
    file_type?: string;
    subject?: string;
    professor?: string;
    semester?: string;
    year?: number;
    language?: string;
    is_verified?: boolean;
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
