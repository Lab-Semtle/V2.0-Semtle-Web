-- 표시 관리자 업데이트를 위한 별도 정책 추가
-- 기존 정책은 건드리지 않고 추가만 함

CREATE POLICY "Admins can update representative status" ON public.user_profiles
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);
