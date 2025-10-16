-- 회원가입 트리거 수정: 필수 필드 검증 및 로깅 추가
-- "Database error saving new user" 오류 해결

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 로그 시작
  RAISE LOG '🚀 [트리거 시작] handle_new_user 함수 실행됨';
  RAISE LOG '👤 [사용자 ID] %', NEW.id;
  RAISE LOG '📧 [이메일] %', NEW.email;
  RAISE LOG '📊 [메타데이터] %', NEW.raw_user_meta_data;

  -- 필수 필드 검증
  IF NEW.raw_user_meta_data->>'student_id' IS NULL OR NEW.raw_user_meta_data->>'student_id' = '' THEN
    RAISE LOG '❌ [오류] student_id가 없음';
    RAISE EXCEPTION 'student_id is required';
  END IF;
  
  IF NEW.raw_user_meta_data->>'nickname' IS NULL OR NEW.raw_user_meta_data->>'nickname' = '' THEN
    RAISE LOG '❌ [오류] nickname이 없음';
    RAISE EXCEPTION 'nickname is required';
  END IF;
  
  IF NEW.raw_user_meta_data->>'name' IS NULL OR NEW.raw_user_meta_data->>'name' = '' THEN
    RAISE LOG '❌ [오류] name이 없음';
    RAISE EXCEPTION 'name is required';
  END IF;

  RAISE LOG '✅ [검증 통과] 모든 필수 필드 확인됨';

  -- 프로필 삽입 시도
  BEGIN
    INSERT INTO public.user_profiles (id, student_id, nickname, name, email, birth_date, status, email_verified, role)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'student_id',
      NEW.raw_user_meta_data->>'nickname',
      NEW.raw_user_meta_data->>'name',
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
    
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG '💥 [삽입 오류] 프로필 생성 실패: %', SQLERRM;
    RAISE EXCEPTION 'Database error saving new user: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
