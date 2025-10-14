-- 대표관리자 역할 추가를 위한 마이그레이션
-- 기존 role 컬럼에 'representative_admin' 옵션 추가

-- 1. 먼저 기존 제약 조건을 제거
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- 2. 기존 데이터의 role 값들을 유효한 값으로 수정
-- 잘못된 role 값을 기본값 'member'로 설정
UPDATE user_profiles 
SET role = 'member' 
WHERE role NOT IN ('member', 'admin', 'super_admin');

-- 3. 새로운 제약 조건 추가 (representative_admin 포함)
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
    CHECK (role IN ('member', 'admin', 'super_admin', 'representative_admin'));

-- 4. 기존 관리자 중 한 명을 대표관리자로 설정
-- 먼저 관리자가 있는지 확인하고, 있으면 첫 번째 관리자를 대표관리자로 설정
DO $$ 
BEGIN
    -- 관리자가 있는지 확인
    IF EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin') THEN
        -- 첫 번째 관리자를 대표관리자로 설정
        UPDATE user_profiles 
        SET role = 'representative_admin' 
        WHERE role = 'admin' 
        AND id = (
            SELECT id FROM user_profiles 
            WHERE role = 'admin' 
            ORDER BY created_at ASC 
            LIMIT 1
        );
        
        RAISE NOTICE '관리자를 대표관리자로 설정했습니다.';
    ELSE
        RAISE NOTICE '설정할 관리자가 없습니다.';
    END IF;
END $$;

-- 4. 대표관리자 정보 조회를 위한 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW representative_admin_info AS
SELECT 
    id,
    name,
    nickname,
    email,
    role,
    created_at
FROM user_profiles 
WHERE role = 'representative_admin'
LIMIT 1;
