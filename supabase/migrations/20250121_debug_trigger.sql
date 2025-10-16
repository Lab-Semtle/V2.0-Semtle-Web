-- 회원가입 트리거 수정: 올바른 메타데이터 키 사용
-- Supabase Auth에서 실제로 저장되는 키 이름으로 수정

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 디버깅을 위한 로그
  RAISE LOG '🚀 [트리거 시작] handle_new_user 함수 실행됨';
  RAISE LOG '👤 [사용자 ID] %', NEW.id;
  RAISE LOG '📧 [이메일] %', NEW.email;
  RAISE LOG '📊 [전체 메타데이터] %', NEW.raw_user_meta_data;
  RAISE LOG '🔍 [student_id 값] %', NEW.raw_user_meta_data->>'student_id';
  RAISE LOG '🔍 [nickname 값] %', NEW.raw_user_meta_data->>'nickname';
  RAISE LOG '🔍 [name 값] %', NEW.raw_user_meta_data->>'name';

  INSERT INTO public.user_profiles (id, student_id, nickname, name, email, birth_date, status, email_verified, role)
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
    FALSE,
    'member'
  );
  
  RAISE LOG '✅ [성공] 사용자 프로필 생성 완료';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
