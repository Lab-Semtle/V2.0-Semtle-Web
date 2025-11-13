// =============================================
// 활동 게시판 관련 타입 정의
// =============================================

import { Post } from './post';

export interface ActivityPost extends Post {
    activity_data?: ActivityData;
    start_date?: string;
    end_date?: string;
    location?: string;
    max_participants?: number;
    current_participants?: number;
    participation_fee?: number;
    contact_info?: string;
    has_voting?: boolean;
    vote_options?: VoteOption[];
    vote_deadline?: string;
    published_version_id?: number;
    republished_at?: string;
}

export interface ActivityVersion {
    id: number;
    activity_id: number;
    author_id: string;
    version_number: number;
    version_code: string;
    parent_version_id?: number;
    version_label?: string;
    title: string;
    subtitle?: string;
    content: unknown;
    thumbnail?: string[];
    category_id?: number;
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    participation_fee?: number;
    contact_info?: string;
    tags?: string[];
    has_voting?: boolean;
    vote_options?: VoteOption[];
    vote_deadline?: string;
    created_at: string;
    updated_at: string;
}

export interface ActivityData {
    post_id: number;
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    current_participants: number;
    participation_fee?: number;
    contact_info?: string;
    has_voting: boolean;
    vote_options?: VoteOption[];
    vote_deadline?: string;
    event_photos?: string[];
    event_summary?: string;
    participants_list?: ActivityParticipant[];
}

export interface VoteOption {
    id: string;
    text: string;
    votes: number;
}

export interface ActivityParticipant {
    id: number;
    activity_id: number;
    user_id: string;
    user?: {
        id: string;
        nickname: string;
        name: string;
        profile_image?: string;
    };
    joined_at: string;
    status: 'registered' | 'attended' | 'cancelled';
    notes?: string;
}

export interface ActivityVote {
    id: number;
    activity_id: number;
    user_id: string;
    vote_option: string;
    voted_at: string;
}

export interface ActivityCreateData {
    // 기본 게시물 정보
    title: string;
    subtitle?: string;
    content: unknown;
    thumbnail?: string | string[];
    category_id: number;
    status?: 'draft' | 'public' | 'private';  // 새 스키마: draft, public, private
    tags?: string[];

    // 활동 특화 정보
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    participation_fee?: number;
    contact_info?: string;
    has_voting?: boolean;
    vote_options?: VoteOption[];
    vote_deadline?: string;
}

export interface ActivityUpdateData {
    // 기본 게시물 정보
    title?: string;
    subtitle?: string;
    content?: unknown;
    thumbnail?: string | string[];
    category_id?: number;
    status?: 'draft' | 'public' | 'private';  // 새 스키마
    tags?: string[];

    // 활동 특화 정보
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    participation_fee?: number;
    contact_info?: string;
    has_voting?: boolean;
    vote_options?: VoteOption[];
    vote_deadline?: string;
    event_photos?: string[];
    event_summary?: string;
}

export interface ActivityParticipationData {
    activity_id: number;
    notes?: string;
}

export interface ActivityVoteData {
    activity_id: number;
    vote_option: string;
}

export interface ActivityFilters {
    location?: string;
    start_date_from?: string;
    start_date_to?: string;
    max_participants_min?: number;
    max_participants_max?: number;
    has_voting?: boolean;
    is_participating?: boolean;
}

export interface ActivityStats {
    total_activities: number;
    upcoming_activities: number;
    completed_activities: number;
    total_participants: number;
    total_votes: number;
}
