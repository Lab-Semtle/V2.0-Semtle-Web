# 데이터베이스 설정 가이드

velog-스타일 에디터 통합을 위한 Supabase 데이터베이스 설정 가이드입니다.

## 테이블 구조

### 게시판 테이블들
- **activities**: 활동게시판 (공지, 세미나, 해커톤 등)
- **projects**: 프로젝트게시판 (팀원 모집)
- **resources**: 족보게시판/자료실 (학습 자료)

### 공통 테이블들
- **tags**: 태그 시스템
- **post_tags**: 게시물-태그 매핑
- **post_revisions**: 리비전 히스토리

## 마이그레이션 실행

1. Supabase 대시보드에서 SQL Editor 열기
2. 다음 파일들을 순서대로 실행:
   - `supabase/migrations/20250101_editor_integration.sql`
   - `supabase/migrations/20250101_storage_setup.sql`

## 환경변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 주요 기능

### 자동저장
- 800ms 디바운스로 자동저장
- post_revisions 테이블에 히스토리 저장

### 이미지 업로드
- `post-images` 스토리지 버킷 사용
- 로그인 사용자만 업로드 가능
- 퍼블릭 읽기 허용

### 태그 시스템
- 공통 태그 시스템으로 모든 게시판에서 사용
- 자동 생성 및 매핑

### RLS (Row Level Security)
- 작성자만 수정/삭제 가능
- 발행된 게시물은 모든 사용자 읽기 가능

## 인덱스 최적화

성능을 위해 다음 인덱스들이 생성됩니다:
- 작성자별 게시물 조회
- 발행일별 정렬
- 슬러그별 조회
- 태그별 검색
