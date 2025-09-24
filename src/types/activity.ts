// =============================================
// 활동 게시판 관련 타입 정의
// =============================================

import { Post } from './post';

export interface ActivityPost extends Post {
    activity_data?: ActivityData;
}

export interface ActivityData {
    post_id: number;
    activity_type: 'announcement' | 'event' | 'seminar' | 'workshop' | 'vote' | 'record';
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    current_participants: number;
    vote_options?: VoteOption[];
    vote_deadline?: string;
    allow_multiple_votes: boolean;
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
    thumbnail?: string;
    category_id: number;
    status?: 'draft' | 'published';
    tags?: string[];

    // 활동 특화 정보
    activity_type: 'announcement' | 'event' | 'seminar' | 'workshop' | 'vote' | 'record';
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    vote_options?: VoteOption[];
    vote_deadline?: string;
    allow_multiple_votes?: boolean;
}

export interface ActivityUpdateData {
    // 기본 게시물 정보
    title?: string;
    subtitle?: string;
    content?: unknown;
    thumbnail?: string;
    category_id?: number;
    status?: 'draft' | 'published' | 'hidden';
    tags?: string[];

    // 활동 특화 정보
    activity_type?: 'announcement' | 'event' | 'seminar' | 'workshop' | 'vote' | 'record';
    location?: string;
    start_date?: string;
    end_date?: string;
    max_participants?: number;
    vote_options?: VoteOption[];
    vote_deadline?: string;
    allow_multiple_votes?: boolean;
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
    activity_type?: string;
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
