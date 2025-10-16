-- 사용하지 않는 notifications 테이블 삭제
-- 현재 시스템에서는 알림을 생성하고 있지만, 프론트엔드에서 알림을 조회하거나 표시하는 기능이 없음
-- 알림 시스템이 완전히 구현되지 않은 상태이므로 테이블 삭제

-- notifications 테이블 삭제
DROP TABLE IF EXISTS public.notifications;

-- 관련 인덱스도 함께 삭제 (있다면)
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_read;

