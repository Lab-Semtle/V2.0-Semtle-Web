import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 일반 저장 (현재 버전 내용만 업데이트, 새 버전 생성 안 함)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const resourceId = parseInt(resolvedParams.id);

        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '유효하지 않은 자료 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 권한 확인 (작성자 또는 관리자)
        const { data: resource } = await supabase
            .from('resources')
            .select('id, author_id')
            .eq('id', resourceId)
            .single();

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        const isAuthor = resource.author_id === user.id;

        if (!isAdmin && !isAuthor) {
            return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
        }

        const body = await request.json();
        const {
            content,
            title,
            subtitle,
            category_id,
            thumbnail,
            resource_type_id,
            file_url,
            file_size,
            file_extension,
            original_filename,
            year,
            semester,
            subject,
            professor,
            difficulty_level,
            rating,
            rating_count,
            tags,
            files
        } = body;

        // 새 스키마: 버전 ID는 요청 본문에서 받음
        const { version_id } = body;

        if (!version_id) {
            return NextResponse.json({ error: '버전 ID가 필요합니다.' }, { status: 400 });
        }

        // 선택된 버전만 업데이트 (새 버전 생성 안 함)
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        };

        if (content !== undefined) updateData.content = content;
        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (thumbnail !== undefined) {
            updateData.thumbnail = Array.isArray(thumbnail) && thumbnail.length > 0 ? thumbnail : (thumbnail ? [thumbnail] : []);
        }
        if (resource_type_id !== undefined) updateData.resource_type_id = resource_type_id;
        if (file_url !== undefined) updateData.file_url = file_url;
        if (file_size !== undefined) updateData.file_size = file_size;
        if (file_extension !== undefined) updateData.file_extension = file_extension;
        if (original_filename !== undefined) updateData.original_filename = original_filename;
        if (year !== undefined) updateData.year = year;
        if (semester !== undefined) updateData.semester = semester;
        if (subject !== undefined) updateData.subject = subject;
        if (professor !== undefined) updateData.professor = professor;
        if (difficulty_level !== undefined) updateData.difficulty_level = difficulty_level;
        if (rating !== undefined) updateData.rating = rating;
        if (rating_count !== undefined) updateData.rating_count = rating_count;
        if (tags !== undefined) updateData.tags = tags || [];

        const { error: updateError } = await supabase
            .from('resource_versions')
            .update(updateData)
            .eq('id', version_id)
            .eq('resource_id', resourceId);

        if (updateError) {
            console.error('Version update error:', updateError);
            return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 });
        }

        // 파일 저장 처리
        if (files && Array.isArray(files) && files.length > 0) {
            // 기존 파일 삭제 (resource_files 테이블)
            await supabase
                .from('resource_files')
                .delete()
                .eq('resource_id', resourceId);

            // 새 파일들 저장
            interface FileInput {
                file_path?: string;
                url?: string;
                size?: number;
                name?: string;
                type?: string;
            }

            const fileRecords = files.map((file: FileInput, index: number) => ({
                resource_id: resourceId,
                file_path: file.file_path || file.url || '',
                file_size: file.size || 0,
                file_extension: file.name?.split('.').pop()?.toLowerCase() || '',
                original_filename: file.name || '',
                file_type: file.type || 'application/octet-stream',
                upload_order: index + 1
            })).filter((file) => file.file_path); // file_path가 있는 것만 저장

            if (fileRecords.length > 0) {
                const { error: filesError } = await supabase
                    .from('resource_files')
                    .insert(fileRecords);

                if (filesError) {
                    console.error('Files save error:', filesError);
                    // 파일 저장 실패해도 버전 업데이트는 성공했으므로 경고만
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: '저장되었습니다.'
        });
    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

