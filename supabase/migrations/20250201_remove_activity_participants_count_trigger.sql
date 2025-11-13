-- =============================================
-- 활동 참가자 수 트리거 제거
-- =============================================
-- current_participants 컬럼이 제거되었으므로
-- 더 이상 필요하지 않은 트리거를 삭제합니다.

-- 트리거 삭제
DROP TRIGGER IF EXISTS update_activity_participants_count_trigger ON public.activity_participants;

-- 트리거 함수 삭제
DROP FUNCTION IF EXISTS public.update_activity_participants_count();






