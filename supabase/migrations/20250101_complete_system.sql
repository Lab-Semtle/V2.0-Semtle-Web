-- =============================================
-- SEMTLE 웹 시스템 완전한 데이터베이스 스키마
-- 생성일: 2025-01-01
-- 버전: 1.0 (최종 통합 버전)
-- 
-- 이 파일 하나만 Supabase에서 실행하면 전체 시스템이 초기화되고 설정됩니다.
-- 앞으로 SQL 관련 수정사항이 있으면 이 파일만 수정하면 됩니다.
-- =============================================

-- =============================================
-- 0. 초기화 안내
-- =============================================

-- ⚠️ 이 SQL을 실행하기 전에 Supabase 대시보드에서 다음을 수행하세요:
-- 1. Settings → Database → Reset database (권장)
-- 2. 또는 SQL Editor에서: DROP SCHEMA public CASCADE; CREATE SCHEMA public;
-- 3. 그 후 이 SQL 파일을 실행하세요

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



-- 게시판 카테고리 테이블
-- =============================================
-- 2. 게시판별 카테고리 테이블 (분리)
-- =============================================

-- 활동 게시판 카테고리
CREATE TABLE activity_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 활동 타입 (별도 테이블로 분리)
CREATE TABLE activity_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트 게시판 카테고리
CREATE TABLE project_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#10B981',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트 타입 (별도 테이블로 분리)
CREATE TABLE project_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 자료실 게시판 카테고리
CREATE TABLE resource_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#F59E0B',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 자료 타입 (별도 테이블로 분리)
CREATE TABLE resource_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    file_extensions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. 게시판별 게시물 테이블 (분리 및 최적화)
-- =============================================

-- 활동 게시물 테이블 (활동 특화 - 최적화)
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    thumbnail VARCHAR(500),
    
    -- 카테고리 및 타입
    category_id INTEGER REFERENCES activity_categories(id),
    activity_type_id INTEGER REFERENCES activity_types(id),
    
    -- 작성자 정보
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'draft',
    activity_status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- 통계
    views INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- 메타데이터
    tags TEXT[] DEFAULT '{}',
    
    -- 활동 특화 정보 (최적화)
    location VARCHAR(200),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    participation_fee INTEGER DEFAULT 0, -- 참가비 (원)
    contact_info VARCHAR(200), -- 연락처 정보
    
    -- 투표 시스템 (간소화)
    has_voting BOOLEAN DEFAULT false,
    vote_options JSONB DEFAULT '[]',
    vote_deadline TIMESTAMP WITH TIME ZONE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 프로젝트 게시물 테이블 (프로젝트 특화 - 최적화)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    thumbnail VARCHAR(500),
    
    -- 카테고리 및 타입
    category_id INTEGER REFERENCES project_categories(id),
    project_type_id INTEGER REFERENCES project_types(id),
    
    -- 작성자 정보
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'draft',
    project_status VARCHAR(20) DEFAULT 'recruiting', -- recruiting, active, completed, cancelled
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- 통계
    views INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- 메타데이터
    tags TEXT[] DEFAULT '{}',
    
    -- 프로젝트 특화 정보 (최적화)
    team_size INTEGER NOT NULL,
    current_members INTEGER DEFAULT 1,
    difficulty VARCHAR(20), -- beginner, intermediate, advanced
    location VARCHAR(50),
    deadline DATE,
    progress_percentage INTEGER DEFAULT 0, -- 진행률 (0-100)
    
    -- 기술 및 목표
    needed_skills TEXT[] DEFAULT '{}',
    tech_stack TEXT[] DEFAULT '{}',
    project_goals TEXT,
    
    -- 외부 링크
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 자료실 게시물 테이블 (자료 특화 - 최적화)
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    thumbnail VARCHAR(500),
    
    -- 카테고리 및 타입
    category_id INTEGER REFERENCES resource_categories(id),
    resource_type_id INTEGER REFERENCES resource_types(id),
    
    -- 작성자 정보
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'draft',
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false, -- 검증된 자료 여부
    
    -- 통계
    views INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    
    -- 메타데이터
    tags TEXT[] DEFAULT '{}',
    
    -- 자료 특화 정보 (최적화)
    file_url VARCHAR(500),
    file_size BIGINT,
    file_extension VARCHAR(10),
    original_filename VARCHAR(200),
    
    -- 학과 정보
    year INTEGER,
    semester VARCHAR(20), -- 1학기, 2학기, 여름학기, 겨울학기
    subject VARCHAR(100),
    professor VARCHAR(100),
    
    -- 품질 정보
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    rating DECIMAL(3,2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    
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

-- 카테고리 및 타입 테이블들에 RLS 활성화
ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_types ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8.5. 카테고리 및 타입 테이블 RLS 정책
-- =============================================

-- 활동 카테고리 정책
CREATE POLICY "Anyone can read activity categories" ON activity_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify activity categories" ON activity_categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- 활동 타입 정책
CREATE POLICY "Anyone can read activity types" ON activity_types FOR SELECT USING (true);
CREATE POLICY "Only admins can modify activity types" ON activity_types FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- 프로젝트 카테고리 정책
CREATE POLICY "Anyone can read project categories" ON project_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify project categories" ON project_categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- 프로젝트 타입 정책
CREATE POLICY "Anyone can read project types" ON project_types FOR SELECT USING (true);
CREATE POLICY "Only admins can modify project types" ON project_types FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- 자료실 카테고리 정책
CREATE POLICY "Anyone can read resource categories" ON resource_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify resource categories" ON resource_categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- 자료실 타입 정책
CREATE POLICY "Anyone can read resource types" ON resource_types FOR SELECT USING (true);
CREATE POLICY "Only admins can modify resource types" ON resource_types FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- =============================================
-- 8.6. 외래 키 제약 조건 제거
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
CREATE INDEX idx_activities_category_id ON activities (category_id);
CREATE INDEX idx_activities_author_id ON activities (author_id);
CREATE INDEX idx_activities_status ON activities (status);
CREATE INDEX idx_activities_is_pinned ON activities (is_pinned);
CREATE INDEX idx_activities_created_at ON activities (created_at);
CREATE INDEX idx_activities_views ON activities (views DESC);
CREATE INDEX idx_activities_likes_count ON activities (likes_count DESC);
CREATE INDEX idx_activities_start_date ON activities (start_date);
CREATE INDEX idx_activities_activity_type_id ON activities (activity_type_id);
CREATE INDEX idx_activity_participants_activity_id ON activity_participants (activity_id);
CREATE INDEX idx_activity_participants_user_id ON activity_participants (user_id);
CREATE INDEX idx_activity_votes_activity_id ON activity_votes (activity_id);

-- 프로젝트 게시물 인덱스 (새로운 분리된 구조)
CREATE INDEX idx_projects_category_id ON projects (category_id);
CREATE INDEX idx_projects_author_id ON projects (author_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_is_pinned ON projects (is_pinned);
CREATE INDEX idx_projects_created_at ON projects (created_at);
CREATE INDEX idx_projects_views ON projects (views DESC);
CREATE INDEX idx_projects_likes_count ON projects (likes_count DESC);
CREATE INDEX idx_projects_project_type_id ON projects (project_type_id);
CREATE INDEX idx_projects_project_status ON projects (project_status);
CREATE INDEX idx_projects_deadline ON projects (deadline);
CREATE INDEX idx_project_applications_project_id ON project_applications (project_id);
CREATE INDEX idx_project_applications_applicant_id ON project_applications (applicant_id);
CREATE INDEX idx_project_applications_status ON project_applications (status);
CREATE INDEX idx_project_team_members_project_id ON project_team_members (project_id);

-- 자료실 게시물 인덱스 (새로운 분리된 구조)
CREATE INDEX idx_resources_category_id ON resources (category_id);
CREATE INDEX idx_resources_author_id ON resources (author_id);
CREATE INDEX idx_resources_status ON resources (status);
CREATE INDEX idx_resources_is_pinned ON resources (is_pinned);
CREATE INDEX idx_resources_created_at ON resources (created_at);
CREATE INDEX idx_resources_views ON resources (views DESC);
CREATE INDEX idx_resources_likes_count ON resources (likes_count DESC);
CREATE INDEX idx_resources_file_extension ON resources (file_extension);
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
-- =============================================
-- 4. 게시판별 초기 카테고리 데이터
-- =============================================

-- 활동 게시판 카테고리 데이터
INSERT INTO activity_categories (name, description, color, icon, sort_order) VALUES
('공지사항', '학회 공지사항', '#8B5CF6', 'megaphone', 1),
('이벤트', '학회 이벤트 및 행사', '#EF4444', 'calendar', 2),
('세미나', '학술 세미나 및 발표회', '#3B82F6', 'presentation', 3),
('워크샵', '실습 중심 워크샵', '#10B981', 'tools', 4),
('투표', '학회 관련 투표', '#F59E0B', 'vote', 5),
('행사기록', '지난 행사 기록', '#6B7280', 'camera', 6);

-- 프로젝트 게시판 카테고리 데이터
INSERT INTO project_categories (name, description, color, icon, sort_order) VALUES
('웹개발', '웹 애플리케이션 개발', '#3B82F6', 'globe', 1),
('모바일앱', '모바일 애플리케이션 개발', '#10B981', 'smartphone', 2),
('AI/ML', '인공지능 및 머신러닝', '#8B5CF6', 'brain', 3),
('게임개발', '게임 개발', '#EF4444', 'gamepad', 4),
('해커톤', '해커톤 참가', '#F59E0B', 'zap', 5),
('공모전', '공모전 참가', '#EC4899', 'trophy', 6),
('연구프로젝트', '연구 및 논문 프로젝트', '#6366F1', 'book-open', 7),
('사이드프로젝트', '개인 사이드 프로젝트', '#6B7280', 'code', 8);

-- 자료실 게시판 카테고리 데이터
INSERT INTO resource_categories (name, description, color, icon, sort_order) VALUES
('시험지', '과목별 시험지', '#EF4444', 'file-text', 1),
('강의자료', '강의 자료 및 노트', '#3B82F6', 'book', 2),
('코드', '프로그래밍 코드', '#10B981', 'code', 3),
('프레젠테이션', '발표 자료', '#8B5CF6', 'presentation', 4),
('이미지', '이미지 및 그래픽', '#EC4899', 'image', 5),
('동영상', '강의 동영상', '#F59E0B', 'video', 6),
('기타', '기타 자료', '#6B7280', 'file', 7);

-- =============================================
-- 5. 타입별 초기 데이터
-- =============================================

-- 활동 타입 데이터
INSERT INTO activity_types (name, description, icon, sort_order) VALUES
('학회행사', '정기 학회 행사', 'calendar', 1),
('세미나', '학술 세미나', 'presentation', 2),
('워크샵', '실습 워크샵', 'tools', 3),
('해커톤', '해커톤 대회', 'zap', 4),
('공모전', '공모전 참가', 'trophy', 5),
('기타', '기타 활동', 'activity', 6);

-- 프로젝트 타입 데이터
INSERT INTO project_types (name, description, icon, sort_order) VALUES
('개인프로젝트', '개인 사이드 프로젝트', 'user', 1),
('팀프로젝트', '팀 협업 프로젝트', 'users', 2),
('해커톤', '해커톤 참가 프로젝트', 'zap', 3),
('공모전', '공모전 참가 프로젝트', 'trophy', 4),
('연구프로젝트', '연구 및 논문 프로젝트', 'book-open', 5),
('상업프로젝트', '상업적 목적 프로젝트', 'dollar-sign', 6),
('오픈소스', '오픈소스 기여 프로젝트', 'github', 7);

-- 자료 타입 데이터
INSERT INTO resource_types (name, description, icon, file_extensions, sort_order) VALUES
('문서', 'PDF, DOC, DOCX 파일', 'file-text', '{"pdf", "doc", "docx", "txt"}', 1),
('코드', '프로그래밍 소스코드', 'code', '{"js", "ts", "py", "java", "cpp", "c", "html", "css"}', 2),
('이미지', '이미지 파일', 'image', '{"jpg", "jpeg", "png", "gif", "svg", "webp"}', 3),
('동영상', '동영상 파일', 'video', '{"mp4", "avi", "mov", "wmv", "flv"}', 4),
('프레젠테이션', '발표 자료', 'presentation', '{"ppt", "pptx", "key"}', 5),
('압축파일', '압축된 파일', 'archive', '{"zip", "rar", "7z", "tar", "gz"}', 6),
('기타', '기타 파일', 'file', '{}', 7);

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
