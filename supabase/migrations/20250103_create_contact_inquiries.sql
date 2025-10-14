-- 문의 테이블 생성
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);

-- RLS 정책 설정
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 문의를 생성할 수 있도록 허용
CREATE POLICY "Anyone can create contact inquiries" ON contact_inquiries
    FOR INSERT WITH CHECK (true);

-- 관리자만 모든 문의를 조회할 수 있도록 허용
CREATE POLICY "Admins can view all contact inquiries" ON contact_inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- 관리자만 문의 상태를 업데이트할 수 있도록 허용
CREATE POLICY "Admins can update contact inquiries" ON contact_inquiries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- 관리자만 문의를 삭제할 수 있도록 허용
CREATE POLICY "Admins can delete contact inquiries" ON contact_inquiries
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );





