// =============================================
// 게시물 관련 타입 정의
// =============================================

import { JSONContent } from 'novel';

export interface BoardCategory {
    id: number;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    board_type: 'activities' | 'projects' | 'resources';
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

// Post 타입 정의 복사
export interface Post {
    id: number;
    title: string;
    subtitle?: string;
    thumbnail?: string;
  post_type: 'project' | 'resource' | 'activity';
  status: 'published' | 'draft' | 'hidden' | 'private';
  visibility?: 'public' | 'private' | 'unlisted';
    views: number;
    likes_count: number;
  comments_count: number;
    bookmarks_count: number;
    created_at: string;
    published_at?: string;
  author_id: string;
  category?: {
    name: string;
    color?: string;
  };
  project_type?: { name: string };
  resource_type?: { name: string };
  activity_type?: { name: string };
  project_data?: {
    needed_skills?: string[];
    team_size?: number;
    current_members?: number;
    difficulty?: string;
    location?: string;
    deadline?: string;
    project_status?: string;
    progress_percentage?: number;
  };
  project_status_info?: {
    name: string;
    display_name: string;
    color: string;
    icon: string;
  };
  author?: {
    profile_image?: string;
    nickname?: string;
    name?: string;
  };
}

export interface PostCreateData {
    title: string;
    subtitle?: string;
    content: JSONContent;
    thumbnail?: string;
    board_type: 'activities' | 'projects' | 'resources';
    category_id: number;
    status?: 'draft' | 'published';
    tags?: string[];
    attachments?: unknown[];
}

export interface PostUpdateData {
    title?: string;
    subtitle?: string;
    content?: JSONContent;
    thumbnail?: string;
    category_id?: number;
    status?: 'draft' | 'published' | 'hidden';
    tags?: string[];
    attachments?: unknown[];
}

export interface PostLike {
    id: number;
    post_id: number;
    user_id: string;
    created_at: string;
}

export interface PostBookmark {
    id: number;
    post_id: number;
    user_id: string;
    created_at: string;
}

export interface PostComment {
    id: number;
    post_id: number;
    user_id: string;
    user?: {
        id: string;
        nickname: string;
        profile_image?: string;
    };
    parent_id?: number;
    content: string;
    is_deleted: boolean;
    likes_count: number;
    created_at: string;
    updated_at: string;
    replies?: PostComment[];
}

export interface CommentCreateData {
    post_id: number;
    content: string;
    parent_id?: number;
}

export interface CommentUpdateData {
    content: string;
}

export interface PostFilters {
    board_type?: 'activities' | 'projects' | 'resources';
    category_id?: number;
    status?: string;
    author_id?: string;
    tags?: string[];
    search?: string;
    is_pinned?: boolean;
    is_featured?: boolean;
}

export interface PostSortOptions {
    field: 'created_at' | 'updated_at' | 'published_at' | 'views' | 'likes_count' | 'comments_count';
    order: 'asc' | 'desc';
}

export interface PostPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PostListResponse {
    posts: Post[];
    pagination: PostPagination;
    categories: BoardCategory[];
}
