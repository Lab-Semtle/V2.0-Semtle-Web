-- =============================================
-- SEMTLE 웹 시스템 완전한 데이터베이스 스키마
-- 생성일: 2025-01-01
-- 버전: 1.0 (최종 통합 버전)
-- 
-- 이 파일 하나만 Supabase에서 실행하면 전체 시스템이 초기화되고 설정됩니다.
-- 앞으로 SQL 관련 수정사항이 있으면 이 파일만 수정하면 됩니다.
-- =============================================

-- =============================================
-- 0. 완전 초기화 (개발 환경용)
-- =============================================

-- ⚠️ 주의: 이 섹션은 개발 환경에서만 사용하세요
-- 프로덕션 환경에서는 절대 실행하지 마세요
-- Supabase 대시보드에서 사용자를 먼저 삭제한 후 실행하세요

-- 모든 사용자 관련 데이터 삭제 (auth.users는 Supabase 대시보드에서 삭제)
DELETE FROM user_profiles;
DELETE FROM activities;
DELETE FROM projects;
DELETE FROM resources;
DELETE FROM activity_likes;
DELETE FROM project_likes;
DELETE FROM resource_likes;
DELETE FROM activity_bookmarks;
DELETE FROM project_bookmarks;
DELETE FROM resource_bookmarks;
DELETE FROM activity_comments;
DELETE FROM project_comments;
DELETE FROM resource_comments;
DELETE FROM activity_participants;
DELETE FROM activity_votes;
DELETE FROM project_applications;
DELETE FROM project_team_members;
DELETE FROM resource_downloads;
DELETE FROM notifications;

-- 카테고리 데이터만 유지 (선택사항)
-- DELETE FROM board_categories;

-- 시퀀스 리셋 (선택사항)
-- ALTER SEQUENCE board_categories_id_seq RESTART WITH 1;

-- 기존 테이블들 삭제 (초기화) - 외래키 제약조건 고려한 순서
DROP TABLE IF EXISTS activity_comment_likes CASCADE;
DROP TABLE IF EXISTS project_comment_likes CASCADE;
DROP TABLE IF EXISTS resource_comment_likes CASCADE;
DROP TABLE IF EXISTS activity_comments CASCADE;
DROP TABLE IF EXISTS project_comments CASCADE;
DROP TABLE IF EXISTS resource_comments CASCADE;
DROP TABLE IF EXISTS activity_likes CASCADE;
DROP TABLE IF EXISTS project_likes CASCADE;
DROP TABLE IF EXISTS resource_likes CASCADE;
DROP TABLE IF EXISTS activity_bookmarks CASCADE;
DROP TABLE IF EXISTS project_bookmarks CASCADE;
DROP TABLE IF EXISTS resource_bookmarks CASCADE;
DROP TABLE IF EXISTS activity_participants CASCADE;
DROP TABLE IF EXISTS activity_votes CASCADE;
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS project_team_members CASCADE;
DROP TABLE IF EXISTS resource_downloads CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS activity_posts CASCADE;
DROP TABLE IF EXISTS project_posts CASCADE;
DROP TABLE IF EXISTS resource_posts CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS board_categories CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =============================================
-- 1. 사용자 관리 시스템
-- =============================================

-- 사용자 프로필 테이블 (확장된 버전)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    student_id VARCHAR(8) UNIQUE NOT NULL,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    birth_date DATE,
    
    -- 프로필 정보
    profile_image VARCHAR(500),
    bio TEXT,
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    
    -- 학과/전공 정보
    major VARCHAR(100),
    grade INTEGER CHECK (grade >= 1 AND grade <= 4),
    student_status VARCHAR(20) DEFAULT 'active', -- 'active', 'graduated', 'on_leave'
    
    -- 권한 및 상태
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin', 'super_admin'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'banned'
    email_verified BOOLEAN DEFAULT false,
    
    -- 통계
    total_posts INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    suspended_until TIMESTAMP WITH TIME ZONE,
    suspension_reason TEXT
);

-- =============================================
-- 2. 공통 게시물 시스템
-- =============================================

-- =============================================
-- 2.5. 관리자 계정 생성 가이드
-- =============================================

-- 수동으로 관리자 계정을 생성하려면 아래 단계를 따르세요:
-- 1. Supabase 대시보드 > Authentication > Users에서 새 사용자 생성
-- 2. 이메일: admin@semtle.com (또는 원하는 이메일)
-- 3. 비밀번호: 강력한 비밀번호 설정
-- 4. 생성된 사용자 ID를 복사하여 아래 INSERT 문에서 사용
-- 5. 아래 INSERT 문의 UUID를 실제 생성된 사용자 ID로 변경 후 실행

/*
-- 관리자 프로필 생성 (사용자 ID는 실제 생성된 UUID로 변경)
INSERT INTO user_profiles (
    id,
    student_id,
    nickname,
    name,
    email,
    birth_date,
    major,
    grade,
    student_status,
    role,
    status,
    email_verified,
    total_posts,
    total_likes_received,
    total_comments,
    created_at,
    updated_at
) VALUES (
    'YOUR_ADMIN_USER_ID_HERE', -- 실제 UUID로 변경 필요
    '20240001',
    'admin',
    '시스템 관리자',
    'admin@semtle.com',
    '1995-01-01',
    '컴퓨터공학과',
    4,
    'active',
    'super_admin',
    'active',
    true,
    0,
    0,
    0,
    NOW(),
    NOW()
);
*/

-- 게시판 카테고리 테이블
CREATE TABLE board_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    board_type VARCHAR(20) NOT NULL, -- 'activities', 'projects', 'resources'
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 활동 게시물 테이블 (독립적)
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    thumbnail VARCHAR(500),
    
    -- 카테고리 정보
    category_id INTEGER REFERENCES board_categories(id),
    
    -- 작성자 정보
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'draft',
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- 통계
    views INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- 메타데이터
    tags TEXT[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    
    -- 활동 특화 정보
    activity_type VARCHAR(50),
    location VARCHAR(200),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    vote_options JSONB DEFAULT '[]',
    vote_deadline TIMESTAMP WITH TIME ZONE,
    allow_multiple_votes BOOLEAN DEFAULT false,
    event_photos TEXT[] DEFAULT '{}',
    event_summary TEXT,
    participants_list JSONB DEFAULT '[]',
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 프로젝트 게시물 테이블 (독립적)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    thumbnail VARCHAR(500),
    
    -- 카테고리 정보
    category_id INTEGER REFERENCES board_categories(id),
    
    -- 작성자 정보
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'draft',
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- 통계
    views INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- 메타데이터
    tags TEXT[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    
    -- 프로젝트 특화 정보
    project_type VARCHAR(50),
    team_size INTEGER NOT NULL,
    current_members INTEGER DEFAULT 1,
    difficulty VARCHAR(20),
    location VARCHAR(50),
    deadline DATE,
    project_status VARCHAR(20) DEFAULT 'recruiting',
    needed_skills TEXT[] DEFAULT '{}',
    project_goals TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    project_timeline JSONB DEFAULT '{}',
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 자료 게시물 테이블 (독립적)
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    thumbnail VARCHAR(500),
    
    -- 카테고리 정보
    category_id INTEGER REFERENCES board_categories(id),
    
    -- 작성자 정보
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'draft',
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- 통계
    views INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- 메타데이터
    tags TEXT[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    
    -- 자료 특화 정보
    resource_type VARCHAR(50),
    file_url VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    download_count INTEGER DEFAULT 0,
    year INTEGER,
    semester VARCHAR(20),
    subject VARCHAR(100),
    professor VARCHAR(100),
    difficulty_level VARCHAR(20),
    rating DECIMAL(3,2) DEFAULT 0.0,
    downloads_count INTEGER DEFAULT 0,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 3. 활동 게시판 특화 시스템
-- =============================================

-- 활동 게시물 확장 테이블 (삭제됨 - activities 테이블로 통합)

-- 활동 참가자 테이블
CREATE TABLE activity_participants (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered', -- 'registered', 'attended', 'cancelled'
    notes TEXT,
    UNIQUE(activity_id, user_id)
);

-- 활동 투표 테이블
CREATE TABLE activity_votes (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_option VARCHAR(200) NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, user_id, vote_option)
);

-- =============================================
-- 4. 프로젝트 게시판 특화 시스템
-- =============================================

-- 프로젝트 게시물 확장 테이블 (삭제됨 - projects 테이블로 통합)

-- 프로젝트 신청 테이블
CREATE TABLE project_applications (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 신청 정보
    motivation TEXT NOT NULL,
    relevant_experience TEXT,
    available_time VARCHAR(100),
    portfolio_url VARCHAR(255),
    github_url VARCHAR(255),
    additional_info TEXT,
    
    -- 신청 상태
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'withdrawn'
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- 타임스탬프
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, applicant_id)
);

-- 프로젝트 팀원 테이블
CREATE TABLE project_team_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'leader', 'member', 'mentor'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'left', 'removed'
    UNIQUE(project_id, user_id)
);

-- =============================================
-- 5. 자료실 게시판 특화 시스템
-- =============================================

-- 자료실 게시물 확장 테이블 (삭제됨 - resources 테이블로 통합)

-- 자료 다운로드 기록 테이블
CREATE TABLE resource_downloads (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- =============================================
-- 6. 공통 상호작용 시스템
-- =============================================

-- 활동 게시판 좋아요 테이블
CREATE TABLE activity_likes (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

-- 프로젝트 게시판 좋아요 테이블
CREATE TABLE project_likes (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 자료실 게시판 좋아요 테이블
CREATE TABLE resource_likes (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

-- 활동 게시판 북마크 테이블
CREATE TABLE activity_bookmarks (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

-- 프로젝트 게시판 북마크 테이블
CREATE TABLE project_bookmarks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 자료실 게시판 북마크 테이블
CREATE TABLE resource_bookmarks (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

-- 활동 게시판 댓글 테이블
CREATE TABLE activity_comments (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES activity_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트 게시판 댓글 테이블
CREATE TABLE project_comments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES project_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 자료실 게시판 댓글 테이블
CREATE TABLE resource_comments (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES resource_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 활동 게시판 댓글 좋아요 테이블
CREATE TABLE activity_comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES activity_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 프로젝트 게시판 댓글 좋아요 테이블
CREATE TABLE project_comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES project_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 자료실 게시판 댓글 좋아요 테이블
CREATE TABLE resource_comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES resource_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- =============================================
-- 7. 알림 시스템
-- =============================================

-- 알림 테이블
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'bookmark', 'application', 'project_update'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- 추가 데이터
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. RLS (Row Level Security) 설정
-- =============================================

-- RLS 활성화 (새로운 분리된 구조)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8.5. 외래 키 제약 조건 제거
-- =============================================

-- user_profiles 테이블의 외래 키 제약 조건 제거 (auth.users 참조)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- =============================================
-- 9. RLS 정책 생성
-- =============================================

-- 사용자 프로필 정책 (기본 정책들)
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

-- 서비스 역할 키를 사용하는 경우 RLS 우회
CREATE POLICY "Service role bypass" ON user_profiles
    FOR ALL USING (current_setting('role') = 'service_role');

-- 일반 사용자 정책 (서비스 역할이 아닌 경우에만 적용)
CREATE POLICY "Users can manage own profile" ON user_profiles
    FOR ALL USING (
        current_setting('role') != 'service_role' AND
        auth.uid() = id
    );

-- 관리자 역할 정책 제거 (무한 재귀 방지)
-- 서비스 역할 키를 사용하여 관리자 작업 수행

-- 활동 게시물 정책 (새로운 분리된 구조)
CREATE POLICY "Anyone can view published activities" ON activities
    FOR SELECT USING (status = 'published');

CREATE POLICY "Only admins can create activities" ON activities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can update activities" ON activities
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can delete activities" ON activities
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- 프로젝트 게시물 정책 (새로운 분리된 구조)
CREATE POLICY "Anyone can view published projects" ON projects
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their projects" ON projects
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their projects" ON projects
    FOR DELETE USING (auth.uid() = author_id);

-- 자료실 게시물 정책 (새로운 분리된 구조)
CREATE POLICY "Anyone can view published resources" ON resources
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their resources" ON resources
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their resources" ON resources
    FOR DELETE USING (auth.uid() = author_id);

-- 활동 참가자 정책
CREATE POLICY "Anyone can view activity participants" ON activity_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join activities" ON activity_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave activities" ON activity_participants
    FOR DELETE USING (auth.uid() = user_id);

-- 프로젝트 신청 정책
CREATE POLICY "Project authors can view applications" ON project_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_id AND p.author_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own applications" ON project_applications
    FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Users can apply to projects" ON project_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Project authors can update applications" ON project_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_id AND p.author_id = auth.uid()
        )
    );

-- 활동 게시판 좋아요 정책
CREATE POLICY "Anyone can view activity likes" ON activity_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like activities" ON activity_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike activities" ON activity_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 프로젝트 게시판 좋아요 정책
CREATE POLICY "Anyone can view project likes" ON project_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like projects" ON project_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike projects" ON project_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 자료실 게시판 좋아요 정책
CREATE POLICY "Anyone can view resource likes" ON resource_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like resources" ON resource_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike resources" ON resource_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 활동 게시판 북마크 정책
CREATE POLICY "Users can view their own activity bookmarks" ON activity_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark activities" ON activity_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove activity bookmarks" ON activity_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- 프로젝트 게시판 북마크 정책
CREATE POLICY "Users can view their own project bookmarks" ON project_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark projects" ON project_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove project bookmarks" ON project_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- 자료실 게시판 북마크 정책
CREATE POLICY "Users can view their own resource bookmarks" ON resource_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark resources" ON resource_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove resource bookmarks" ON resource_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- 활동 게시판 댓글 정책
CREATE POLICY "Anyone can view activity comments" ON activity_comments
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can create activity comments" ON activity_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their activity comments" ON activity_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their activity comments" ON activity_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 프로젝트 게시판 댓글 정책
CREATE POLICY "Anyone can view project comments" ON project_comments
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can create project comments" ON project_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their project comments" ON project_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their project comments" ON project_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 자료실 게시판 댓글 정책
CREATE POLICY "Anyone can view resource comments" ON resource_comments
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can create resource comments" ON resource_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their resource comments" ON resource_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their resource comments" ON resource_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 활동 게시판 댓글 좋아요 정책
CREATE POLICY "Anyone can view activity comment likes" ON activity_comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like activity comments" ON activity_comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike activity comments" ON activity_comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 프로젝트 게시판 댓글 좋아요 정책
CREATE POLICY "Anyone can view project comment likes" ON project_comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like project comments" ON project_comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike project comments" ON project_comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 자료실 게시판 댓글 좋아요 정책
CREATE POLICY "Anyone can view resource comment likes" ON resource_comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like resource comments" ON resource_comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike resource comments" ON resource_comment_likes
    FOR DELETE USING (auth.uid() = user_id);


-- 알림 정책
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 10. 인덱스 생성
-- =============================================

-- 사용자 프로필 인덱스
CREATE INDEX idx_user_profiles_student_id ON user_profiles (student_id);
CREATE INDEX idx_user_profiles_nickname ON user_profiles (nickname);
CREATE INDEX idx_user_profiles_email ON user_profiles (email);
CREATE INDEX idx_user_profiles_role ON user_profiles (role);
CREATE INDEX idx_user_profiles_status ON user_profiles (status);

-- 활동 게시물 인덱스 (새로운 분리된 구조)
CREATE INDEX idx_activities_slug ON activities (slug);
CREATE INDEX idx_activities_category_id ON activities (category_id);
CREATE INDEX idx_activities_author_id ON activities (author_id);
CREATE INDEX idx_activities_status ON activities (status);
CREATE INDEX idx_activities_is_pinned ON activities (is_pinned);
CREATE INDEX idx_activities_created_at ON activities (created_at);
CREATE INDEX idx_activities_views ON activities (views DESC);
CREATE INDEX idx_activities_likes_count ON activities (likes_count DESC);
CREATE INDEX idx_activities_start_date ON activities (start_date);
CREATE INDEX idx_activities_activity_type ON activities (activity_type);
CREATE INDEX idx_activity_participants_activity_id ON activity_participants (activity_id);
CREATE INDEX idx_activity_participants_user_id ON activity_participants (user_id);
CREATE INDEX idx_activity_votes_activity_id ON activity_votes (activity_id);

-- 프로젝트 게시물 인덱스 (새로운 분리된 구조)
CREATE INDEX idx_projects_slug ON projects (slug);
CREATE INDEX idx_projects_category_id ON projects (category_id);
CREATE INDEX idx_projects_author_id ON projects (author_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_is_pinned ON projects (is_pinned);
CREATE INDEX idx_projects_created_at ON projects (created_at);
CREATE INDEX idx_projects_views ON projects (views DESC);
CREATE INDEX idx_projects_likes_count ON projects (likes_count DESC);
CREATE INDEX idx_projects_project_type ON projects (project_type);
CREATE INDEX idx_projects_project_status ON projects (project_status);
CREATE INDEX idx_projects_deadline ON projects (deadline);
CREATE INDEX idx_project_applications_project_id ON project_applications (project_id);
CREATE INDEX idx_project_applications_applicant_id ON project_applications (applicant_id);
CREATE INDEX idx_project_applications_status ON project_applications (status);
CREATE INDEX idx_project_team_members_project_id ON project_team_members (project_id);

-- 자료실 게시물 인덱스 (새로운 분리된 구조)
CREATE INDEX idx_resources_slug ON resources (slug);
CREATE INDEX idx_resources_category_id ON resources (category_id);
CREATE INDEX idx_resources_author_id ON resources (author_id);
CREATE INDEX idx_resources_status ON resources (status);
CREATE INDEX idx_resources_is_pinned ON resources (is_pinned);
CREATE INDEX idx_resources_created_at ON resources (created_at);
CREATE INDEX idx_resources_views ON resources (views DESC);
CREATE INDEX idx_resources_likes_count ON resources (likes_count DESC);
CREATE INDEX idx_resources_file_type ON resources (file_type);
CREATE INDEX idx_resources_subject ON resources (subject);
CREATE INDEX idx_resources_year ON resources (year);
CREATE INDEX idx_resources_downloads_count ON resources (downloads_count DESC);
CREATE INDEX idx_resource_downloads_resource_id ON resource_downloads (resource_id);
CREATE INDEX idx_resource_downloads_user_id ON resource_downloads (user_id);

-- 상호작용 인덱스
CREATE INDEX idx_activity_likes_activity_id ON activity_likes (activity_id);
CREATE INDEX idx_activity_likes_user_id ON activity_likes (user_id);
CREATE INDEX idx_project_likes_project_id ON project_likes (project_id);
CREATE INDEX idx_project_likes_user_id ON project_likes (user_id);
CREATE INDEX idx_resource_likes_resource_id ON resource_likes (resource_id);
CREATE INDEX idx_resource_likes_user_id ON resource_likes (user_id);

CREATE INDEX idx_activity_bookmarks_activity_id ON activity_bookmarks (activity_id);
CREATE INDEX idx_activity_bookmarks_user_id ON activity_bookmarks (user_id);
CREATE INDEX idx_project_bookmarks_project_id ON project_bookmarks (project_id);
CREATE INDEX idx_project_bookmarks_user_id ON project_bookmarks (user_id);
CREATE INDEX idx_resource_bookmarks_resource_id ON resource_bookmarks (resource_id);
CREATE INDEX idx_resource_bookmarks_user_id ON resource_bookmarks (user_id);

CREATE INDEX idx_activity_comments_activity_id ON activity_comments (activity_id);
CREATE INDEX idx_activity_comments_user_id ON activity_comments (user_id);
CREATE INDEX idx_activity_comments_parent_id ON activity_comments (parent_id);
CREATE INDEX idx_project_comments_project_id ON project_comments (project_id);
CREATE INDEX idx_project_comments_user_id ON project_comments (user_id);
CREATE INDEX idx_project_comments_parent_id ON project_comments (parent_id);
CREATE INDEX idx_resource_comments_resource_id ON resource_comments (resource_id);
CREATE INDEX idx_resource_comments_user_id ON resource_comments (user_id);
CREATE INDEX idx_resource_comments_parent_id ON resource_comments (parent_id);

-- 알림 인덱스
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);

-- =============================================
-- 11. 트리거 함수 및 트리거
-- =============================================

-- 업데이트 시간 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 활동 게시판 통계 업데이트 함수들 (새로운 분리된 구조)
CREATE OR REPLACE FUNCTION update_activity_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE activities SET likes_count = likes_count + 1 WHERE id = NEW.activity_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE activities SET likes_count = likes_count - 1 WHERE id = OLD.activity_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_activity_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE activities SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.activity_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE activities SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.activity_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_activity_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_deleted = false THEN
        UPDATE activities SET comments_count = comments_count + 1 WHERE id = NEW.activity_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
            UPDATE activities SET comments_count = comments_count - 1 WHERE id = NEW.activity_id;
        ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
            UPDATE activities SET comments_count = comments_count + 1 WHERE id = NEW.activity_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.is_deleted = false THEN
        UPDATE activities SET comments_count = comments_count - 1 WHERE id = OLD.activity_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 프로젝트 게시판 통계 업데이트 함수들 (새로운 분리된 구조)
CREATE OR REPLACE FUNCTION update_project_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projects SET likes_count = likes_count + 1 WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects SET likes_count = likes_count - 1 WHERE id = OLD.project_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_project_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projects SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.project_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_project_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_deleted = false THEN
        UPDATE projects SET comments_count = comments_count + 1 WHERE id = NEW.project_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
            UPDATE projects SET comments_count = comments_count - 1 WHERE id = NEW.project_id;
        ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
            UPDATE projects SET comments_count = comments_count + 1 WHERE id = NEW.project_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.is_deleted = false THEN
        UPDATE projects SET comments_count = comments_count - 1 WHERE id = OLD.project_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 자료실 게시판 통계 업데이트 함수들 (새로운 분리된 구조)
CREATE OR REPLACE FUNCTION update_resource_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE resources SET likes_count = likes_count + 1 WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE resources SET likes_count = likes_count - 1 WHERE id = OLD.resource_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_resource_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE resources SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE resources SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.resource_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_resource_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_deleted = false THEN
        UPDATE resources SET comments_count = comments_count + 1 WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
            UPDATE resources SET comments_count = comments_count - 1 WHERE id = NEW.resource_id;
        ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
            UPDATE resources SET comments_count = comments_count + 1 WHERE id = NEW.resource_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.is_deleted = false THEN
        UPDATE resources SET comments_count = comments_count - 1 WHERE id = OLD.resource_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_activity_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE activities SET current_participants = current_participants + 1 WHERE id = NEW.activity_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE activities SET current_participants = current_participants - 1 WHERE id = OLD.activity_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_project_members_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projects SET current_members = current_members + 1 WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects SET current_members = current_members - 1 WHERE id = OLD.project_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_resource_downloads_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE resources SET downloads_count = downloads_count + 1 WHERE id = NEW.resource_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_comments_updated_at
    BEFORE UPDATE ON activity_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at
    BEFORE UPDATE ON project_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_comments_updated_at
    BEFORE UPDATE ON resource_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_applications_updated_at
    BEFORE UPDATE ON project_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 활동 게시판 트리거
CREATE TRIGGER update_activity_likes_count_trigger
    AFTER INSERT OR DELETE ON activity_likes
    FOR EACH ROW EXECUTE FUNCTION update_activity_likes_count();

CREATE TRIGGER update_activity_bookmarks_count_trigger
    AFTER INSERT OR DELETE ON activity_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_activity_bookmarks_count();

CREATE TRIGGER update_activity_comments_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON activity_comments
    FOR EACH ROW EXECUTE FUNCTION update_activity_comments_count();

-- 프로젝트 게시판 트리거
CREATE TRIGGER update_project_likes_count_trigger
    AFTER INSERT OR DELETE ON project_likes
    FOR EACH ROW EXECUTE FUNCTION update_project_likes_count();

CREATE TRIGGER update_project_bookmarks_count_trigger
    AFTER INSERT OR DELETE ON project_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_project_bookmarks_count();

CREATE TRIGGER update_project_comments_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON project_comments
    FOR EACH ROW EXECUTE FUNCTION update_project_comments_count();

-- 자료실 게시판 트리거
CREATE TRIGGER update_resource_likes_count_trigger
    AFTER INSERT OR DELETE ON resource_likes
    FOR EACH ROW EXECUTE FUNCTION update_resource_likes_count();

CREATE TRIGGER update_resource_bookmarks_count_trigger
    AFTER INSERT OR DELETE ON resource_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_resource_bookmarks_count();

CREATE TRIGGER update_resource_comments_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON resource_comments
    FOR EACH ROW EXECUTE FUNCTION update_resource_comments_count();

CREATE TRIGGER update_activity_participants_count_trigger
    AFTER INSERT OR DELETE ON activity_participants
    FOR EACH ROW EXECUTE FUNCTION update_activity_participants_count();

CREATE TRIGGER update_project_members_count_trigger
    AFTER INSERT OR DELETE ON project_team_members
    FOR EACH ROW EXECUTE FUNCTION update_project_members_count();

CREATE TRIGGER update_resource_downloads_count_trigger
    AFTER INSERT ON resource_downloads
    FOR EACH ROW EXECUTE FUNCTION update_resource_downloads_count();

-- =============================================
-- 12. 기본 데이터 삽입
-- =============================================

-- 게시판 카테고리 데이터
INSERT INTO board_categories (name, description, color, icon, board_type, sort_order) VALUES
-- 활동 게시판 카테고리
('공지사항', '학회 공지사항', '#8B5CF6', 'megaphone', 'activities', 1),
('이벤트', '학회 이벤트 및 행사', '#EF4444', 'calendar', 'activities', 2),
('세미나', '학술 세미나 및 발표회', '#3B82F6', 'presentation', 'activities', 3),
('워크샵', '실습 중심 워크샵', '#10B981', 'tools', 'activities', 4),
('투표', '학회 관련 투표', '#F59E0B', 'vote', 'activities', 5),
('행사기록', '지난 행사 기록', '#6B7280', 'camera', 'activities', 6),

-- 프로젝트 게시판 카테고리
('웹개발', '웹 애플리케이션 개발', '#3B82F6', 'globe', 'projects', 1),
('모바일앱', '모바일 애플리케이션 개발', '#10B981', 'smartphone', 'projects', 2),
('AI/ML', '인공지능 및 머신러닝', '#8B5CF6', 'brain', 'projects', 3),
('게임개발', '게임 개발', '#EF4444', 'gamepad', 'projects', 4),
('해커톤', '해커톤 참가', '#F59E0B', 'zap', 'projects', 5),
('공모전', '공모전 참가', '#EC4899', 'trophy', 'projects', 6),
('연구프로젝트', '연구 및 논문 프로젝트', '#6366F1', 'book-open', 'projects', 7),
('사이드프로젝트', '개인 사이드 프로젝트', '#6B7280', 'code', 'projects', 8),

-- 자료실 게시판 카테고리
('시험지', '과목별 시험지', '#EF4444', 'file-text', 'resources', 1),
('강의자료', '강의 자료 및 노트', '#3B82F6', 'book', 'resources', 2),
('코드', '프로그래밍 코드', '#10B981', 'code', 'resources', 3),
('프레젠테이션', '발표 자료', '#8B5CF6', 'presentation', 'resources', 4),
('이미지', '이미지 및 그래픽', '#EC4899', 'image', 'resources', 5),
('동영상', '강의 동영상', '#F59E0B', 'video', 'resources', 6),
('기타', '기타 자료', '#6B7280', 'file', 'resources', 7);

-- =============================================
-- 13. 초기 데이터 삽입 (실사용 환경용)
-- =============================================

-- 기본 카테고리 데이터만 삽입 (샘플 사용자/게시물 제거)

-- =============================================
-- 13. 사용자 생성 트리거 (기존 함수 업데이트)
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, student_id, nickname, name, email, birth_date, status, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'student_id', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END,
    'active',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 사용자 생성 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 이메일 인증 상태 동기화 함수
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.user_profiles
    SET email_verified = TRUE
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이메일 확인 트리거
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmation();

-- =============================================
-- 14. Storage 버킷 생성
-- =============================================

-- 기존 버킷 삭제 (있다면)
DELETE FROM storage.buckets WHERE id IN ('resources', 'thumbnails', 'attachments');

-- 리소스 파일용 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- 기존 스토리지 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Anyone can view resources" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload resources" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resources" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resources" ON storage.objects;

-- 스토리지 정책 생성
CREATE POLICY "Anyone can view resources" ON storage.objects
    FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Authenticated users can upload resources" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'resources' AND 
        auth.uid() IS NOT NULL AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own resources" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'resources' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own resources" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'resources' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =============================================
-- 15. 설정 완료 확인
-- =============================================

SELECT 
    'SEMTLE 웹 시스템 데이터베이스 스키마 생성 완료' as status,
    NOW() as created_at,
    'v1.0' as version;
