-- representative_admin 역할을 super_admin으로 통합하는 마이그레이션

-- 1. 기존 제약 조건 제거
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- 2. representative_admin 역할을 super_admin으로 변경
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE role = 'representative_admin';

-- 3. 새로운 제약 조건 추가 (representative_admin 제거)
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
    CHECK (role IN ('member', 'admin', 'super_admin'));

-- 4. 기존 뷰 삭제 (API에서 직접 조회하므로 불필요)
DROP VIEW IF EXISTS representative_admin_info;
