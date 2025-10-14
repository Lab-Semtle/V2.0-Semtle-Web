-- project_team_members 테이블 RLS 정책 추가
-- 이 마이그레이션은 project_team_members 테이블에 누락된 RLS 정책을 추가합니다

-- 프로젝트 팀원 정책
CREATE POLICY "Anyone can read project team members" ON project_team_members FOR SELECT USING (true);

CREATE POLICY "Project leaders can manage team members" ON project_team_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_team_members.project_id 
        AND projects.author_id = auth.uid()
    )
);

CREATE POLICY "Users can join teams when accepted" ON project_team_members FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_team_members.project_id 
        AND projects.author_id = auth.uid()
    )
);
