-- 활동 투표 테이블 RLS 정책 추가
-- 투표 기능이 올바르게 동작하도록 필요한 정책들을 생성합니다.

-- 활동 투표 테이블에 RLS 활성화
ALTER TABLE activity_votes ENABLE ROW LEVEL SECURITY;

-- 투표 조회 정책: 모든 사용자가 투표 결과를 볼 수 있음
CREATE POLICY "Anyone can view activity votes" ON activity_votes
    FOR SELECT USING (true);

-- 투표 생성 정책: 인증된 사용자만 투표할 수 있음
CREATE POLICY "Authenticated users can vote" ON activity_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 투표 삭제 정책: 사용자는 자신의 투표만 취소할 수 있음
CREATE POLICY "Users can cancel their own votes" ON activity_votes
    FOR DELETE USING (auth.uid() = user_id);

-- 투표 업데이트 정책: 투표는 업데이트하지 않고 삭제 후 재생성하는 방식 사용
-- 따라서 UPDATE 정책은 필요하지 않음
