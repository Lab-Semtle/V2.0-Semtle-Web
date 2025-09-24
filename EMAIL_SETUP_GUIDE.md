# 이메일 인증 설정 가이드

## 문제 상황
회원가입 시 이메일 인증 이메일이 실제로 전송되지 않는 문제가 발생하고 있습니다.

## 해결 방법

### 1. Supabase 대시보드에서 이메일 인증 설정

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 에 로그인
   - 해당 프로젝트 선택

2. **Authentication 설정**
   - 좌측 메뉴에서 `Authentication` 클릭
   - `Settings` 탭 선택

3. **이메일 인증 활성화**
   - `Enable email confirmations` 체크박스 활성화
   - `Enable email change confirmations` 체크박스 활성화 (선택사항)

### 2. SMTP 설정 (권장)

#### 방법 1: Supabase 기본 이메일 서비스 사용
- Supabase에서 제공하는 기본 이메일 서비스를 사용
- 추가 설정 없이 바로 사용 가능
- 하지만 이메일이 스팸 폴더에 들어갈 수 있음

#### 방법 2: 커스텀 SMTP 설정 (권장)
1. **SMTP 서비스 선택**
   - Gmail, Naver, SendGrid, Mailgun 등
   - 예시: Gmail 사용

2. **Gmail 설정**
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Pass: your-app-password (2단계 인증 활성화 후 앱 비밀번호 생성)
   SMTP Admin Email: your-email@gmail.com
   ```

3. **Supabase에서 SMTP 설정**
   - Authentication > Settings > SMTP Settings
   - `Enable Custom SMTP` 체크
   - 위 정보 입력

### 3. 이메일 템플릿 설정

1. **Authentication > Email Templates**
2. **Confirm signup** 템플릿 수정
   ```
   Subject: [SEMTLE] 이메일 인증을 완료해주세요
   
   안녕하세요!
   
   SEMTLE 회원가입을 완료하기 위해 이메일 인증이 필요합니다.
   
   아래 링크를 클릭하여 인증을 완료해주세요:
   {{ .ConfirmationURL }}
   
   이 링크는 24시간 후 만료됩니다.
   
   감사합니다.
   SEMTLE 팀
   ```

### 4. 환경 변수 확인

`.env.local` 파일이 있는지 확인하고, 없다면 생성:

```bash
# .env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. 개발 환경에서 테스트

1. **Supabase 로그 확인**
   - Authentication > Logs에서 이메일 전송 로그 확인

2. **스팸 폴더 확인**
   - 이메일이 스팸 폴더에 들어갔을 수 있음

3. **브라우저 콘솔 확인**
   - 개발자 도구에서 오류 메시지 확인

### 6. 코드 수정 (필요시)

현재 코드는 정상적으로 작동해야 합니다. 만약 문제가 지속된다면:

1. **AuthContext.tsx**에서 `signUp` 함수 확인
2. **회원가입 후 리다이렉트** 로직 확인
3. **이메일 인증 페이지** 로직 확인

### 7. 디버깅 방법

1. **Supabase 대시보드에서 확인**
   - Authentication > Users에서 사용자 생성 확인
   - `email_confirmed_at` 필드가 null인지 확인

2. **브라우저 네트워크 탭 확인**
   - 회원가입 요청이 성공적으로 전송되는지 확인

3. **콘솔 로그 확인**
   - `console.log`로 각 단계별 상태 확인

## 추가 참고사항

- **개발 환경**: Supabase의 기본 이메일 서비스 사용 가능
- **프로덕션 환경**: 커스텀 SMTP 설정 권장
- **이메일 전송 제한**: Supabase 무료 플랜에서는 일일 이메일 전송 제한이 있음

## 문제 해결 후 확인사항

1. 회원가입 시 이메일이 실제로 전송되는지 확인
2. 이메일 링크 클릭 시 정상적으로 인증되는지 확인
3. 인증 후 로그인이 정상적으로 작동하는지 확인
