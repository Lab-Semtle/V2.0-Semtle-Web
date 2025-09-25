# Supabase 클라이언트

서버사이드와 클라이언트사이드에서 Supabase를 안전하게 사용하기 위한 유틸리티입니다.

## 구성 요소

- **browser.ts**: 클라이언트사이드 Supabase 클라이언트
- **server.ts**: 서버사이드 Supabase 클라이언트 (App Router 호환)

## 환경변수

`.env.local`에 다음 변수들이 필요합니다:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

