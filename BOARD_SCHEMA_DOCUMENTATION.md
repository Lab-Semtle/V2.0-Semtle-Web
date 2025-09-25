# SEMTLE 게시판별 스키마 문서 (최적화 버전)

## 📋 개요

각 게시판은 독립적인 카테고리와 타입 시스템을 가지며, 각 게시판의 특성에 맞게 최적화된 속성들을 가지고 있습니다. 이 문서는 각 게시판의 데이터 구조와 속성들을 정리한 것입니다.

## 🎯 **주요 최적화 사항**
- ✅ **타입 테이블 분리**: 각 게시판별로 타입을 별도 테이블로 관리
- ✅ **불필요한 속성 제거**: 복잡하고 사용하지 않는 속성들 정리
- ✅ **게시판별 특화**: 각 게시판의 특성에 맞는 속성들로 최적화
- ✅ **성능 향상**: 인덱스 최적화 및 쿼리 효율성 개선

---

## 🎯 1. 활동 게시판 (Activities)

### 📊 테이블 구조
- **메인 테이블**: `activities`
- **카테고리 테이블**: `activity_categories`
- **타입 테이블**: `activity_types`

### 🏷️ 카테고리
| 카테고리명 | 설명 | 색상 | 아이콘 |
|-----------|------|------|--------|
| 공지사항 | 학회 공지사항 | #8B5CF6 | megaphone |
| 이벤트 | 학회 이벤트 및 행사 | #EF4444 | calendar |
| 세미나 | 학술 세미나 및 발표회 | #3B82F6 | presentation |
| 워크샵 | 실습 중심 워크샵 | #10B981 | tools |
| 투표 | 학회 관련 투표 | #F59E0B | vote |
| 행사기록 | 지난 행사 기록 | #6B7280 | camera |

### 📝 기본 속성
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(200)) - 제목
- `subtitle` (TEXT) - 부제목
- `content` (JSONB) - 본문 내용 (Novel Editor)
- `thumbnail` (VARCHAR(500)) - 썸네일 이미지
- `category_id` (INTEGER) - 활동 카테고리 ID
- `author_id` (UUID) - 작성자 ID
- `status` (VARCHAR(20)) - 게시물 상태 (draft/published)
- `is_pinned` (BOOLEAN) - 고정 여부
- `is_featured` (BOOLEAN) - 추천 여부
- `views` (INTEGER) - 조회수
- `likes_count` (INTEGER) - 좋아요 수
- `bookmarks_count` (INTEGER) - 북마크 수
- `comments_count` (INTEGER) - 댓글 수
- `tags` (TEXT[]) - 태그 배열
- `attachments` (JSONB) - 첨부파일 정보

### 🎪 활동 특화 속성 (최적화)
- `activity_type_id` (INTEGER) - 활동 타입 ID (activity_types 테이블 참조)
- `activity_status` (VARCHAR(20)) - 활동 상태 (upcoming/ongoing/completed/cancelled)
- `location` (VARCHAR(200)) - 장소
- `start_date` (TIMESTAMP) - 시작일시
- `end_date` (TIMESTAMP) - 종료일시
- `max_participants` (INTEGER) - 최대 참가자 수
- `current_participants` (INTEGER) - 현재 참가자 수
- `participation_fee` (INTEGER) - 참가비 (원)
- `contact_info` (VARCHAR(200)) - 연락처 정보
- `has_voting` (BOOLEAN) - 투표 여부
- `vote_options` (JSONB) - 투표 옵션
- `vote_deadline` (TIMESTAMP) - 투표 마감일

### 🏷️ 활동 타입
| 타입명 | 설명 | 아이콘 |
|--------|------|--------|
| 학회행사 | 정기 학회 행사 | calendar |
| 세미나 | 학술 세미나 | presentation |
| 워크샵 | 실습 워크샵 | tools |
| 해커톤 | 해커톤 대회 | zap |
| 공모전 | 공모전 참가 | trophy |
| 기타 | 기타 활동 | activity |

### ⏰ 타임스탬프
- `created_at` (TIMESTAMP) - 생성일시
- `updated_at` (TIMESTAMP) - 수정일시
- `published_at` (TIMESTAMP) - 발행일시

---

## 💻 2. 프로젝트 게시판 (Projects)

### 📊 테이블 구조
- **메인 테이블**: `projects`
- **카테고리 테이블**: `project_categories`
- **타입 테이블**: `project_types`

### 🏷️ 카테고리
| 카테고리명 | 설명 | 색상 | 아이콘 |
|-----------|------|------|--------|
| 웹개발 | 웹 애플리케이션 개발 | #3B82F6 | globe |
| 모바일앱 | 모바일 애플리케이션 개발 | #10B981 | smartphone |
| AI/ML | 인공지능 및 머신러닝 | #8B5CF6 | brain |
| 게임개발 | 게임 개발 | #EF4444 | gamepad |
| 해커톤 | 해커톤 참가 | #F59E0B | zap |
| 공모전 | 공모전 참가 | #EC4899 | trophy |
| 연구프로젝트 | 연구 및 논문 프로젝트 | #6366F1 | book-open |
| 사이드프로젝트 | 개인 사이드 프로젝트 | #6B7280 | code |

### 📝 기본 속성
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(200)) - 제목
- `subtitle` (TEXT) - 부제목
- `content` (JSONB) - 본문 내용 (Novel Editor)
- `thumbnail` (VARCHAR(500)) - 썸네일 이미지
- `category_id` (INTEGER) - 프로젝트 카테고리 ID
- `author_id` (UUID) - 작성자 ID
- `status` (VARCHAR(20)) - 게시물 상태 (draft/published)
- `is_pinned` (BOOLEAN) - 고정 여부
- `is_featured` (BOOLEAN) - 추천 여부
- `views` (INTEGER) - 조회수
- `likes_count` (INTEGER) - 좋아요 수
- `bookmarks_count` (INTEGER) - 북마크 수
- `comments_count` (INTEGER) - 댓글 수
- `tags` (TEXT[]) - 태그 배열
- `attachments` (JSONB) - 첨부파일 정보

### 🚀 프로젝트 특화 속성 (최적화)
- `project_type_id` (INTEGER) - 프로젝트 타입 ID (project_types 테이블 참조)
- `project_status` (VARCHAR(20)) - 프로젝트 상태 (recruiting/active/completed/cancelled)
- `team_size` (INTEGER) - 팀 규모
- `current_members` (INTEGER) - 현재 멤버 수
- `difficulty` (VARCHAR(20)) - 난이도 (beginner/intermediate/advanced)
- `location` (VARCHAR(50)) - 위치
- `deadline` (DATE) - 마감일
- `progress_percentage` (INTEGER) - 진행률 (0-100)
- `needed_skills` (TEXT[]) - 필요 기술
- `project_goals` (TEXT) - 프로젝트 목표
- `tech_stack` (TEXT[]) - 기술 스택
- `github_url` (VARCHAR(500)) - GitHub URL
- `demo_url` (VARCHAR(500)) - 데모 URL

### 🏷️ 프로젝트 타입
| 타입명 | 설명 | 아이콘 |
|--------|------|--------|
| 개인프로젝트 | 개인 사이드 프로젝트 | user |
| 팀프로젝트 | 팀 협업 프로젝트 | users |
| 해커톤 | 해커톤 참가 프로젝트 | zap |
| 공모전 | 공모전 참가 프로젝트 | trophy |
| 연구프로젝트 | 연구 및 논문 프로젝트 | book-open |
| 상업프로젝트 | 상업적 목적 프로젝트 | dollar-sign |
| 오픈소스 | 오픈소스 기여 프로젝트 | github |

### ⏰ 타임스탬프
- `created_at` (TIMESTAMP) - 생성일시
- `updated_at` (TIMESTAMP) - 수정일시
- `published_at` (TIMESTAMP) - 발행일시

---

## 📚 3. 자료실 게시판 (Resources)

### 📊 테이블 구조
- **메인 테이블**: `resources`
- **카테고리 테이블**: `resource_categories`
- **타입 테이블**: `resource_types`

### 🏷️ 카테고리
| 카테고리명 | 설명 | 색상 | 아이콘 |
|-----------|------|------|--------|
| 시험지 | 과목별 시험지 | #EF4444 | file-text |
| 강의자료 | 강의 자료 및 노트 | #3B82F6 | book |
| 코드 | 프로그래밍 코드 | #10B981 | code |
| 프레젠테이션 | 발표 자료 | #8B5CF6 | presentation |
| 이미지 | 이미지 및 그래픽 | #EC4899 | image |
| 동영상 | 강의 동영상 | #F59E0B | video |
| 기타 | 기타 자료 | #6B7280 | file |

### 📝 기본 속성
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(200)) - 제목
- `subtitle` (TEXT) - 부제목
- `content` (JSONB) - 본문 내용 (Novel Editor)
- `thumbnail` (VARCHAR(500)) - 썸네일 이미지
- `category_id` (INTEGER) - 자료 카테고리 ID
- `author_id` (UUID) - 작성자 ID
- `status` (VARCHAR(20)) - 게시물 상태 (draft/published)
- `is_pinned` (BOOLEAN) - 고정 여부
- `is_featured` (BOOLEAN) - 추천 여부
- `views` (INTEGER) - 조회수
- `likes_count` (INTEGER) - 좋아요 수
- `bookmarks_count` (INTEGER) - 북마크 수
- `comments_count` (INTEGER) - 댓글 수
- `tags` (TEXT[]) - 태그 배열
- `attachments` (JSONB) - 첨부파일 정보

### 📁 자료 특화 속성 (최적화)
- `resource_type_id` (INTEGER) - 자료 타입 ID (resource_types 테이블 참조)
- `is_verified` (BOOLEAN) - 검증된 자료 여부
- `file_url` (VARCHAR(500)) - 파일 URL
- `file_size` (BIGINT) - 파일 크기
- `file_extension` (VARCHAR(10)) - 파일 확장자
- `original_filename` (VARCHAR(200)) - 원본 파일명
- `downloads_count` (INTEGER) - 다운로드 수
- `year` (INTEGER) - 연도
- `semester` (VARCHAR(20)) - 학기 (1학기/2학기/여름학기/겨울학기)
- `subject` (VARCHAR(100)) - 과목명
- `professor` (VARCHAR(100)) - 교수명
- `difficulty_level` (VARCHAR(20)) - 난이도 (beginner/intermediate/advanced)
- `rating` (DECIMAL(3,2)) - 평점
- `rating_count` (INTEGER) - 평점 참여자 수

### 🏷️ 자료 타입
| 타입명 | 설명 | 아이콘 | 지원 확장자 |
|--------|------|--------|-------------|
| 문서 | PDF, DOC, DOCX 파일 | file-text | pdf, doc, docx, txt |
| 코드 | 프로그래밍 소스코드 | code | js, ts, py, java, cpp, c, html, css |
| 이미지 | 이미지 파일 | image | jpg, jpeg, png, gif, svg, webp |
| 동영상 | 동영상 파일 | video | mp4, avi, mov, wmv, flv |
| 프레젠테이션 | 발표 자료 | presentation | ppt, pptx, key |
| 압축파일 | 압축된 파일 | archive | zip, rar, 7z, tar, gz |
| 기타 | 기타 파일 | file | - |

### ⏰ 타임스탬프
- `created_at` (TIMESTAMP) - 생성일시
- `updated_at` (TIMESTAMP) - 수정일시
- `published_at` (TIMESTAMP) - 발행일시

---

## 🔄 주요 변경사항

### ✅ 완료된 작업
1. **카테고리 테이블 분리**: `board_categories` → `activity_categories`, `project_categories`, `resource_categories`
2. **Slug 필드 제거**: 프로젝트와 자료실 게시판에서 slug 필드 제거
3. **API 라우트 업데이트**: 각 게시판별 카테고리 테이블 참조로 변경
4. **프론트엔드 컴포넌트 수정**: PostForm에서 slug 관련 코드 제거

### 🎯 각 게시판의 독립성
- 각 게시판은 고유한 카테고리 시스템을 가짐
- 게시판별로 특화된 속성들로 최적화
- 데이터 무결성과 확장성 향상

### 📊 데이터 관계
```
user_profiles (1) ←→ (N) activities
user_profiles (1) ←→ (N) projects  
user_profiles (1) ←→ (N) resources

activity_categories (1) ←→ (N) activities
project_categories (1) ←→ (N) projects
resource_categories (1) ←→ (N) resources
```

---

## 🚀 사용 방법

### 1. 카테고리 관리
각 게시판의 카테고리는 독립적으로 관리됩니다:
```sql
-- 활동 카테고리 조회
SELECT * FROM activity_categories WHERE is_active = true ORDER BY sort_order;

-- 프로젝트 카테고리 조회  
SELECT * FROM project_categories WHERE is_active = true ORDER BY sort_order;

-- 자료실 카테고리 조회
SELECT * FROM resource_categories WHERE is_active = true ORDER BY sort_order;
```

### 2. 게시물 생성
각 게시판의 특화된 속성들을 활용하여 게시물을 생성할 수 있습니다:
- **활동**: 행사 정보, 참가자 관리, 투표 기능
- **프로젝트**: 팀 관리, 기술 스택, 프로젝트 일정
- **자료실**: 파일 관리, 학과 정보, 다운로드 추적

### 3. API 사용
각 게시판의 API는 해당 게시판의 카테고리 테이블을 참조합니다:
- `/api/activities` → `activity_categories`
- `/api/projects` → `project_categories`  
- `/api/resources` → `resource_categories`
