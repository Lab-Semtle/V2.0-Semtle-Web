// =============================================
// 사용자 관련 타입 정의
// =============================================

export interface UserProfile {
    id: string;
    student_id: string;
    nickname: string;
    name: string;
    email: string;
    birth_date?: string;

    // 프로필 정보
    profile_image?: string;
    bio?: string;
    github_url?: string;
    portfolio_url?: string;
    linkedin_url?: string;

    // 학과/전공 정보
    major?: string;
    grade?: number;
    student_status: 'active' | 'graduated' | 'on_leave';

    // 권한 및 상태
    role: 'user' | 'admin' | 'super_admin';
    status: 'active' | 'suspended' | 'banned';
    email_verified: boolean;

    // 통계
    total_posts: number;
    total_likes_received: number;
    total_comments: number;

    // 타임스탬프
    created_at: string;
    updated_at: string;
    last_login?: string;
    suspended_until?: string;
    suspension_reason?: string;
}

export interface UserProfileUpdate {
    nickname?: string;
    name?: string;
    birth_date?: string;
    profile_image?: string;
    bio?: string;
    github_url?: string;
    portfolio_url?: string;
    linkedin_url?: string;
    major?: string;
    grade?: number;
    student_status?: 'active' | 'graduated' | 'on_leave';
}

export interface UserRegistrationData {
    student_id: string;
    nickname: string;
    name: string;
    email: string;
    password: string;
    birth_date?: string;
    major?: string;
    grade?: number;
}

export interface UserSuspensionData {
    user_id: string;
    suspended_until: string;
    reason: string;
}

export interface UserStats {
    total_posts: number;
    total_likes_received: number;
    total_comments: number;
    total_bookmarks: number;
    total_downloads: number;
    join_date: string;
    last_activity?: string;
}
