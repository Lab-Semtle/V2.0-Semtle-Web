-- 개인정보 공개 여부 설정을 위한 컬럼 추가 (이미 존재하는 컬럼은 건너뛰기)
DO $$ 
BEGIN
    -- profile_public 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'profile_public') THEN
        ALTER TABLE user_profiles ADD COLUMN profile_public BOOLEAN DEFAULT true;
    END IF;
    
    -- email_public 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'email_public') THEN
        ALTER TABLE user_profiles ADD COLUMN email_public BOOLEAN DEFAULT true;
    END IF;
    
    -- student_id_public 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'student_id_public') THEN
        ALTER TABLE user_profiles ADD COLUMN student_id_public BOOLEAN DEFAULT true;
    END IF;
    
    -- major_grade_public 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'major_grade_public') THEN
        ALTER TABLE user_profiles ADD COLUMN major_grade_public BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 기존 사용자들의 기본값 설정
UPDATE user_profiles 
SET 
    profile_public = true,
    email_public = true,
    student_id_public = true,
    major_grade_public = true
WHERE profile_public IS NULL OR email_public IS NULL OR student_id_public IS NULL OR major_grade_public IS NULL;

-- 컬럼에 NOT NULL 제약 조건 추가
ALTER TABLE user_profiles 
ALTER COLUMN profile_public SET NOT NULL,
ALTER COLUMN email_public SET NOT NULL,
ALTER COLUMN student_id_public SET NOT NULL,
ALTER COLUMN major_grade_public SET NOT NULL;

-- 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_public ON user_profiles(profile_public);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_public ON user_profiles(email_public);
CREATE INDEX IF NOT EXISTS idx_user_profiles_student_id_public ON user_profiles(student_id_public);
CREATE INDEX IF NOT EXISTS idx_user_profiles_major_grade_public ON user_profiles(major_grade_public);
