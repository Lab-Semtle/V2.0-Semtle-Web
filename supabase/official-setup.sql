-- =============================================
-- Supabase 공식 문서 방식 설정
-- =============================================

-- 1. 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id VARCHAR(8) UNIQUE NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  birth_date DATE,
  status BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. 기존 정책들 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Allow email verification update" ON user_profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_profiles;

-- 4. 새로운 RLS 정책 생성 (공식 문서 방식)
CREATE POLICY "Public profiles are viewable by everyone." ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_profiles_student_id ON user_profiles (student_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname ON user_profiles (nickname);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles (email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles (status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles (email_verified);

-- 6. 새 사용자 자동 프로필 생성 함수 (공식 문서 방식)
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
    TRUE,
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 새 사용자 생성 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. 이메일 인증 상태 동기화 함수
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- 이메일이 확인되면 user_profiles의 email_verified를 true로 업데이트
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.user_profiles
    SET email_verified = TRUE
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 이메일 확인 트리거
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmation();

-- 10. 즉시 수동 동기화 실행 (기존 인증된 사용자들)
UPDATE user_profiles 
SET email_verified = true 
WHERE email IN (
  SELECT email 
  FROM auth.users 
  WHERE email_confirmed_at IS NOT NULL
);

-- 11. 설정 완료 확인
SELECT 
  'user_profiles 테이블 생성 완료' as status,
  COUNT(*) as total_profiles
FROM user_profiles;

-- 12. 동기화 결과 확인
SELECT 
  '동기화 완료' as status,
  COUNT(*) as verified_users
FROM user_profiles 
WHERE email_verified = true;

-- 13. 현재 인증된 사용자들 확인
SELECT 
  au.email,
  au.email_confirmed_at,
  up.email_verified
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email_confirmed_at IS NOT NULL;

