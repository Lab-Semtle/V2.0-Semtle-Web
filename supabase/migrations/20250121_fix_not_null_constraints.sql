-- 회원가입 문제 해결: NOT NULL 제약조건 수정
-- 빈 문자열을 허용하도록 제약조건 변경

ALTER TABLE user_profiles ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN nickname DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN name DROP NOT NULL;
