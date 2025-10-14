-- 팔로우/팔로워 기능을 위한 테이블
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- 팔로우 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- 팔로우 테이블 RLS 정책
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 팔로우 조회 정책 (자신의 팔로우/팔로워 목록 조회 가능)
CREATE POLICY "Users can view their own follows" ON follows
    FOR SELECT USING (follower_id = auth.uid() OR following_id = auth.uid());

-- 팔로우 생성 정책 (자신이 팔로우할 수 있음)
CREATE POLICY "Users can follow others" ON follows
    FOR INSERT WITH CHECK (follower_id = auth.uid() AND following_id != auth.uid());

-- 팔로우 삭제 정책 (자신이 언팔로우할 수 있음)
CREATE POLICY "Users can unfollow others" ON follows
    FOR DELETE USING (follower_id = auth.uid());

-- 북마크 테이블 (이미 존재한다면 스키마 확인 후 업데이트)
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL,
    post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('project', 'resource', 'activity')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id, post_type)
);

-- 북마크 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_type ON bookmarks(post_type);

-- 북마크 테이블 RLS 정책
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 북마크 조회 정책 (자신의 북마크만 조회 가능)
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
    FOR SELECT USING (user_id = auth.uid());

-- 북마크 생성 정책 (자신이 북마크할 수 있음)
CREATE POLICY "Users can create bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 북마크 삭제 정책 (자신이 북마크 해제할 수 있음)
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
    FOR DELETE USING (user_id = auth.uid());

-- 사용자 프로필에 팔로우/팔로워 수 추가
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 팔로우 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 팔로워 수 증가
        UPDATE user_profiles 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.following_id;
        
        -- 팔로잉 수 증가
        UPDATE user_profiles 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 팔로워 수 감소
        UPDATE user_profiles 
        SET followers_count = followers_count - 1 
        WHERE id = OLD.following_id;
        
        -- 팔로잉 수 감소
        UPDATE user_profiles 
        SET following_count = following_count - 1 
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 팔로우 수 업데이트 트리거
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON follows;
CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- 북마크 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_bookmark_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 해당 게시물의 북마크 수 증가
        IF NEW.post_type = 'project' THEN
            UPDATE projects SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.post_type = 'resource' THEN
            UPDATE resources SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.post_type = 'activity' THEN
            UPDATE activities SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 해당 게시물의 북마크 수 감소
        IF OLD.post_type = 'project' THEN
            UPDATE projects SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.post_id;
        ELSIF OLD.post_type = 'resource' THEN
            UPDATE resources SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.post_id;
        ELSIF OLD.post_type = 'activity' THEN
            UPDATE activities SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 북마크 수 업데이트 트리거
DROP TRIGGER IF EXISTS trigger_update_bookmark_counts ON bookmarks;
CREATE TRIGGER trigger_update_bookmark_counts
    AFTER INSERT OR DELETE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_bookmark_counts();









