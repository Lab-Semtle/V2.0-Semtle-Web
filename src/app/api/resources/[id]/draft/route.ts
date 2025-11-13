import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { generateVersionCode } from '@/lib/utils/version-code';

// 임시저장 (draft 저장) - 새 버전 생성
export async function POST(
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

        // 권한 확인
        const { data: resource } = await supabase
            .from('resources')
            .select('id, author_id')
            .eq('id', resourceId)
            .single();

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

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
            parent_version_id,
            version_label,
            files
        } = body;

        // 기존 버전 목록 조회
        const { data: allVersions } = await supabase
            .from('resource_versions')
            .select('version_number, version_code, parent_version_id, id')
            .eq('resource_id', resourceId)
            .order('version_number', { ascending: false });

        const nextVersionNumber = allVersions && allVersions.length > 0
            ? (allVersions[0].version_number || 0) + 1
            : 1;

        // 부모 버전 찾기
        const parentVersion = parent_version_id 
            ? allVersions?.find(v => v.id === parent_version_id)
            : (allVersions && allVersions.length > 0 ? allVersions[0] : null);

        // version_code 생성
        const versionCode = generateVersionCode(
            parentVersion?.version_code || null,
            parent_version_id || null,
            allVersions || [],
            nextVersionNumber
        );

        // 새 버전 생성
        const { data: newVersion, error: createError } = await supabase
            .from('resource_versions')
            .insert({
                resource_id: resourceId,
                author_id: user.id,
                version_number: nextVersionNumber,
                version_code: versionCode,
                parent_version_id: parent_version_id || parentVersion?.id || null,
                version_label: version_label?.trim() || null,
                content,
                title,
                subtitle,
                thumbnail: Array.isArray(thumbnail) ? thumbnail : (thumbnail ? [thumbnail] : []),
                category_id,
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
                rating: rating || 0,
                rating_count: rating_count || 0,
                tags: tags || []
            })
            .select()
            .single();

        if (createError || !newVersion) {
            console.error('Version creation error:', createError);
            return NextResponse.json({ error: '버전 생성에 실패했습니다.' }, { status: 500 });
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
                    // 파일 저장 실패해도 버전 생성은 성공했으므로 경고만
                }
            }
        }

        return NextResponse.json({
            success: true,
            version_id: newVersion.id,
            version_code: versionCode,
            message: '새 버전이 생성되었습니다.'
        });
    } catch (error) {
        console.error('Draft save error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
