// =============================================
// 프로젝트 게시판 관련 타입 정의
// =============================================

import { Post } from './post';

export interface ProjectPost extends Post {
    project_data?: ProjectData;
    approved_members?: number;
    applicant_count?: number;
    project_type?: {
        id: number;
        name: string;
        description?: string;
        icon?: string;
        color?: string;
    };
}

export interface ProjectData {
    post_id: number;
    project_type_id: number;
    project_type?: {
        id: number;
        name: string;
        description?: string;
        icon?: string;
    };
    team_size: number;
    current_members: number;
    needed_skills: string[];
    deadline: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    location: 'online' | 'offline' | 'hybrid';
    project_status: 'recruiting' | 'active' | 'completed' | 'cancelled';
    progress_percentage: number;
    tech_stack: string[];
    project_goals?: string;
    github_url?: string;
    demo_url?: string;
}

export interface ProjectApplication {
    id: number;
    project_id: number;
    applicant_id: string;
    applicant?: {
        id: string;
        nickname: string;
        name: string;
        profile_image?: string;
        major?: string;
        grade?: number;
    };
    motivation: string;
    relevant_experience?: string;
    available_time?: string;
    portfolio_url?: string;
    github_url?: string;
    additional_info?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    reviewed_by?: string;
    reviewed_at?: string;
    review_notes?: string;
    rejection_reason?: string;
    applied_at: string;
    updated_at: string;
}

export interface ProjectTeamMember {
    id: number;
    project_id: number;
    user_id: string;
    user?: {
        id: string;
        nickname: string;
        name: string;
        profile_image?: string;
    };
    role: 'leader' | 'member' | 'mentor';
    joined_at: string;
    status: 'active' | 'left' | 'removed';
}

export interface ProjectCreateData {
    // 기본 게시물 정보
    title: string;
    subtitle?: string;
    content: unknown;
    thumbnail?: string;
    category_id: number;
    status?: 'draft' | 'published';
    tags?: string[];

    // 프로젝트 특화 정보
    project_type_id: number;
    team_size: number;
    needed_skills: string[];
    deadline: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    location: 'online' | 'offline' | 'hybrid';
    tech_stack: string[];
    project_goals?: string;
    github_url?: string;
    demo_url?: string;
}

export interface ProjectUpdateData {
    // 기본 게시물 정보
    title?: string;
    subtitle?: string;
    content?: unknown;
    thumbnail?: string;
    category_id?: number;
    status?: 'draft' | 'published' | 'hidden';
    tags?: string[];

    // 프로젝트 특화 정보
    project_type_id?: number;
    team_size?: number;
    needed_skills?: string[];
    deadline?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    location?: 'online' | 'offline' | 'hybrid';
    project_status?: 'recruiting' | 'active' | 'completed' | 'cancelled';
    progress_percentage?: number;
    tech_stack?: string[];
    project_goals?: string;
    github_url?: string;
    demo_url?: string;
}

export interface ProjectApplicationData {
    project_id: number;
    motivation: string;
    relevant_experience?: string;
    available_time?: string;
    portfolio_url?: string;
    github_url?: string;
    additional_info?: string;
}

export interface ProjectApplicationUpdateData {
    status: 'accepted' | 'rejected';
    review_notes?: string;
    rejection_reason?: string;
}

export interface ProjectFilters {
    project_type_id?: number;
    difficulty?: string;
    location?: string;
    tech_stack?: string[];
    project_status?: string;
    deadline_from?: string;
    deadline_to?: string;
    team_size_min?: number;
    team_size_max?: number;
    has_applications?: boolean;
    is_applying?: boolean;
}

export interface ProjectStats {
    total_projects: number;
    recruiting_projects: number;
    in_progress_projects: number;
    completed_projects: number;
    total_applications: number;
    total_members: number;
}
