# Supabase 데이터베이스 완전 초기화 가이드

## 🚨 주의사항
- 이 작업은 **모든 데이터를 삭제**합니다
- **프로덕션 환경에서는 절대 실행하지 마세요**
- **개발/테스트 환경에서만 사용**하세요

## 🔄 완전 초기화 방법

### 1. Supabase 대시보드에서 초기화 (권장)

#### 1.1. Authentication 초기화
1. **Supabase 대시보드** → **Authentication** → **Users**
2. **모든 사용자 삭제** (개별 삭제 또는 일괄 삭제)
3. **Settings** → **Auth** → **Reset** (선택사항)

#### 1.2. Database 초기화
1. **Supabase 대시보드** → **SQL Editor**
2. **아래 SQL 실행**:

```sql
-- 1. 모든 사용자 관련 데이터 삭제
DELETE FROM user_profiles;
DELETE FROM activities;
DELETE FROM projects;
DELETE FROM resources;
DELETE FROM activity_likes;
DELETE FROM project_likes;
DELETE FROM resource_likes;
DELETE FROM activity_bookmarks;
DELETE FROM project_bookmarks;
DELETE FROM resource_bookmarks;
DELETE FROM activity_comments;
DELETE FROM project_comments;
DELETE FROM resource_comments;
DELETE FROM activity_participants;
DELETE FROM activity_votes;
DELETE FROM project_applications;
DELETE FROM project_team_members;
DELETE FROM resource_downloads;
DELETE FROM notifications;

-- 2. 카테고리 데이터만 유지 (선택사항)
-- DELETE FROM board_categories;

-- 3. 시퀀스 리셋 (선택사항)
-- ALTER SEQUENCE board_categories_id_seq RESTART WITH 1;
```

#### 1.3. Storage 초기화
1. **Supabase 대시보드** → **Storage** → **Buckets**
2. **모든 파일 삭제** 또는 **버킷 삭제 후 재생성**

### 2. SQL 마이그레이션 파일로 초기화

#### 2.1. 기존 SQL 파일 수정
현재 `20250101_complete_system.sql` 파일에 다음 추가:

```sql
-- =============================================
-- 0. 완전 초기화 (개발 환경용)
-- =============================================

-- ⚠️ 주의: 이 섹션은 개발 환경에서만 사용하세요
-- 프로덕션 환경에서는 절대 실행하지 마세요

-- 모든 사용자 관련 데이터 삭제
DELETE FROM user_profiles;
DELETE FROM activities;
DELETE FROM projects;
DELETE FROM resources;
DELETE FROM activity_likes;
DELETE FROM project_likes;
DELETE FROM resource_likes;
DELETE FROM activity_bookmarks;
DELETE FROM project_bookmarks;
DELETE FROM resource_bookmarks;
DELETE FROM activity_comments;
DELETE FROM project_comments;
DELETE FROM resource_comments;
DELETE FROM activity_participants;
DELETE FROM activity_votes;
DELETE FROM project_applications;
DELETE FROM project_team_members;
DELETE FROM resource_downloads;
DELETE FROM notifications;

-- 카테고리 데이터만 유지 (선택사항)
-- DELETE FROM board_categories;

-- 시퀀스 리셋 (선택사항)
-- ALTER SEQUENCE board_categories_id_seq RESTART WITH 1;
```

### 3. 프로젝트 재시작

#### 3.1. 환경 변수 확인
```bash
# .env.local 파일 확인
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 3.2. 서버 재시작
```bash
npm run dev
# 또는
yarn dev
```

## 🔐 초기 관리자 설정

### 1. 일반 사용자 회원가입
1. `/auth/register`에서 일반 사용자 계정 생성
2. 이메일 인증 완료

### 2. Supabase에서 관리자로 변경
1. **Supabase 대시보드** → **Table Editor** → **user_profiles** 테이블
2. **해당 사용자 찾기** (이메일로 검색)
3. **role 컬럼**을 `member`에서 `admin`으로 변경
4. **저장**

### 3. 관리자 기능 확인
1. **일반 로그인** (`/auth/login`)으로 로그인
2. **사용자 프로필 드롭다운**에서 "관리자 대시보드" 메뉴 확인
3. **`/admin`** 페이지 접속 가능한지 확인

## ⚠️ 주의사항

### DO NOT (하지 마세요)
- ❌ `auth.users` 테이블 직접 삭제
- ❌ `auth` 스키마의 테이블 직접 조작
- ❌ 프로덕션 환경에서 초기화 실행

### DO (해야 할 것)
- ✅ Supabase 대시보드에서 사용자 삭제
- ✅ SQL로 사용자 관련 데이터만 삭제
- ✅ 개발 환경에서만 초기화 실행

## 🆘 문제 해결

### 1. 외래 키 제약 조건 오류
```sql
-- 외래 키 제약 조건 일시적으로 비활성화
SET session_replication_role = replica;
-- 데이터 삭제
-- 외래 키 제약 조건 다시 활성화
SET session_replication_role = DEFAULT;
```

### 2. RLS 정책 오류
```sql
-- RLS 일시적으로 비활성화
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- 데이터 삭제
-- RLS 다시 활성화
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## 📞 지원

문제가 발생하면 시스템 관리자에게 문의하세요.
