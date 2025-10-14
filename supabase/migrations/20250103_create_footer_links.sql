-- Footer 링크 관리를 위한 테이블 생성
CREATE TABLE public.footer_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- 링크 이름 (예: GitHub, Instagram 등)
    url VARCHAR(500) NOT NULL, -- 링크 URL
    icon VARCHAR(50) NOT NULL, -- 아이콘 이름 (lucide-react 아이콘)
    color VARCHAR(20) DEFAULT '#8B5CF6', -- 아이콘 색상
    is_active BOOLEAN DEFAULT true, -- 활성화 여부
    sort_order INTEGER DEFAULT 0, -- 정렬 순서
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS 활성화
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- 정책 설정
CREATE POLICY "Allow admin to manage footer links."
ON public.footer_links FOR ALL
TO service_role
USING (true);

-- 기본 데이터 삽입
INSERT INTO public.footer_links (name, url, icon, color, sort_order) VALUES
('GitHub', 'https://github.com/Lab-Semtle', 'Github', '#8B5CF6', 1),
('Instagram', 'https://instagram.com/semtle', 'Instagram', '#E4405F', 2),
('YouTube', 'https://youtube.com/@semtle', 'Youtube', '#FF0000', 3);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_footer_links_active ON public.footer_links(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_links_sort_order ON public.footer_links(sort_order);





