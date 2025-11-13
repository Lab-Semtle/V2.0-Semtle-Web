import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 특정 활동 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabase();

    try {
        const { id: idParam } = await params;

        // 먼저 activities 테이블에서 조회 시도
        interface ActivityMeta {
            id: number;
            author_id: string;
            status: string;
            is_pinned?: boolean;
            views_count_cached: number;
            likes_count_cached: number;
            bookmarks_count_cached: number;
            comments_count_cached: number;
            published_at?: string | null;
            republished_at?: string | null;
            published_version_id: number | null;
        }

        let activityId: string | null = idParam;
        let activityMeta: ActivityMeta | null = null;
        let metaError: Error | null = null;

        const { data: activityMetaDirect, error: directError } = await supabase
            .from('activities')
            .select(`
                id,
                author_id,
                status,
                is_pinned,
                views_count_cached,
                likes_count_cached,
                bookmarks_count_cached,
                comments_count_cached,
                published_at,
                republished_at,
                published_version_id
            `)
            .eq('id', idParam)
            .maybeSingle();

        if (activityMetaDirect) {
            // activities 테이블에서 직접 찾음
            activityMeta = activityMetaDirect;
        } else {
            // activities 테이블에서 찾지 못했으면 activity_versions 테이블에서 activity_id 찾기
            const { data: version, error: versionError } = await supabase
                .from('activity_versions')
                .select('activity_id')
                .eq('id', idParam)
                .maybeSingle();

            if (version && version.activity_id) {
                activityId = version.activity_id;

                // 올바른 activity_id로 다시 조회
                const { data: activityMetaRetry, error: retryError } = await supabase
                    .from('activities')
                    .select(`
                        id,
                        author_id,
                        status,
                        is_pinned,
                        views_count_cached,
                        likes_count_cached,
                        bookmarks_count_cached,
                        comments_count_cached,
                        published_at,
                        republished_at,
                        published_version_id
            `)
                    .eq('id', activityId)
                    .maybeSingle();

                if (activityMetaRetry) {
                    activityMeta = activityMetaRetry;
                } else {
                    metaError = retryError;
                }
            } else {
                metaError = directError || versionError;
            }
        }

        if (metaError) {
            console.error('Error fetching activity metadata:', metaError);
            return NextResponse.json({ error: '활동을 조회하는 중 오류가 발생했습니다.' }, { status: 500 });
        }

        if (!activityMeta) {
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // published 상태가 아닌 경우에도 조회는 허용하되, 실제 접근 권한은 클라이언트에서 처리
        // (관리자는 모든 상태 조회 가능, 일반 사용자는 published만 조회 가능)

        // 버전 데이터 조회
        // 편집 모드인지 확인 (헤더로 확인)
        const isEditMode = request.headers.get('x-edit-mode') === 'true';
        
        interface ActivityVersion {
            id: number;
            activity_id: number;
            title: string;
            subtitle?: string;
            content: unknown;
            thumbnail?: string | string[] | null;
            category_id?: number | null;
            location?: string | null;
            start_date?: string | null;
            end_date?: string | null;
            max_participants?: number | null;
            participation_fee?: number;
            contact_info?: string | null;
            tags?: string[];
            has_voting?: boolean;
            vote_options?: unknown;
            vote_deadline?: string | null;
        }

        interface ActivityCategory {
            id: number;
            name: string;
            color: string;
            icon: string;
        }

        type Activity = ActivityMeta & Partial<ActivityVersion> & {
            category: ActivityCategory | null;
            comments_count?: number;
            current_participants?: number;
            views?: number;
            likes_count?: number;
            bookmarks_count?: number;
            author?: { id: string; nickname: string; name?: string; profile_image?: string | null } | null;
        };
        
        let activity: Activity = {
            ...activityMeta,
            category: null
        };
        
        // 새 스키마: 편집 모드는 클라이언트가 선택한 버전 ID를 헤더로 전달
        // 일반 조회 모드: published_version_id 사용 (상세 페이지/게시판용)
        // 비공개/임시저장 게시물의 경우 published_version_id가 없을 수 있으므로 최신 버전 조회
        const requestedVersionId = request.headers.get('x-version-id');
        let targetVersionId = isEditMode && requestedVersionId
            ? parseInt(requestedVersionId)
            : activityMeta.published_version_id;

        // 편집 모드에서 버전 ID가 없으면 published_version_id 사용
        if (isEditMode && !targetVersionId) {
            targetVersionId = activityMeta.published_version_id;
        }

        // published_version_id가 없으면 최신 버전 조회 (비공개/임시저장 게시물)
        if (!targetVersionId) {
            const { data: latestVersion } = await supabase
                .from('activity_versions')
                .select('id')
                .eq('activity_id', activityMeta.id)
                .order('version_number', { ascending: false })
                .limit(1)
                .single();

            if (latestVersion) {
                targetVersionId = latestVersion.id;
            }
        }

        if (targetVersionId) {
            const { data: version, error: versionError } = await supabase
                .from('activity_versions')
                .select(`
                    id,
                    activity_id,
                    title,
                    subtitle,
                    content,
                    thumbnail,
                    category_id,
                    location,
                    start_date,
                    end_date,
                    max_participants,
                    participation_fee,
                    contact_info,
                    tags,
                    has_voting,
                    vote_options,
                    vote_deadline
                `)
                .eq('id', targetVersionId)
                .single();

            if (!versionError && version) {
                // category는 별도로 조회
                let category = null;
                if (version.category_id) {
                    const { data: categoryData } = await supabase
                        .from('activity_categories')
                        .select('id, name, color, icon')
                        .eq('id', version.category_id)
                        .single();

                    category = categoryData;
                }

                // 중요: activity.id는 activities 테이블의 ID를 유지해야 함 (activity_versions ID 아님)
                activity = {
                    ...activityMeta,  // activities 테이블 데이터 (id 포함)
                    ...version,        // activity_versions 테이블 데이터
                    id: activityMeta.id,  // activities 테이블 ID 명시적으로 유지
                    category
                };
            }
        } else if (isEditMode) {
            // 편집 모드인데 targetVersionId가 없는 경우 (버전이 아직 생성되지 않음)
            // 버전이 없어도 기본 활동 메타데이터는 반환 (빈 폼으로 시작)
            activity = {
                ...activityMeta,
                category: null
            };
        }

        // 작성자 정보 조회
        if (activity && activity.author_id) {
            const { data: author } = await supabase
                .from('user_profiles')
                .select('id, nickname, name, profile_image')
                .eq('id', activity.author_id)
                .single();

            activity.author = author;
        }

        // 참가자 수, 댓글 개수, 좋아요 개수 집계
        const [participantsCountResult, commentCountResult, likeCountResult] = await Promise.all([
            supabase
                .from('activity_participants')
                .select('*', { count: 'exact', head: true })
                .eq('activity_id', activityId)
                .eq('status', 'registered'),
            supabase
                .from('activity_comments')
                .select('*', { count: 'exact', head: true })
                .eq('activity_id', activityId)
                .is('parent_id', null)
                .eq('is_deleted', false),
            supabase
                .from('activity_likes')
                .select('*', { count: 'exact', head: true })
                .eq('activity_id', activityId)
        ]);

        // 댓글 개수, 좋아요 개수, 참가자 수를 활동 데이터에 추가
        if (activity) {
            // 실제 댓글 개수 사용 (답글 제외)
            activity.comments_count = commentCountResult.count || 0;
            activity.current_participants = participantsCountResult.count || 0;
            activity.views = activity.views_count_cached || 0;
            // 실제 좋아요 개수 사용
            activity.likes_count = likeCountResult.count || 0;
            activity.bookmarks_count = activity.bookmarks_count_cached || 0;
        }

        return NextResponse.json({ activity });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 활동 수정
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabase();

    try {
        const { id: activityId } = await params;
        const body = await request.json();

        // 사용자 확인 (보안상 getUser 사용)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json(
                { error: '인증되지 않은 요청입니다.' },
                { status: 401 }
            );
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
            return NextResponse.json(
                { error: '활동 게시물은 관리자만 수정할 수 있습니다.' },
                { status: 403 }
            );
        }

        // 기존 활동 조회
        const { data: existingActivity } = await supabase
            .from('activities')
            .select('status')
            .eq('id', activityId)
            .single();

        // activities 테이블에는 메타데이터만 업데이트
        const updateData: Record<string, unknown> = {
            status: body.status || existingActivity?.status,
            updated_at: new Date().toISOString()
        };

        if (body.status === 'published' && existingActivity?.status === 'draft') {
            updateData.published_at = new Date().toISOString();
        }

        // 활동 메타데이터 수정
        const { data: activity, error: updateError } = await supabase
            .from('activities')
            .update(updateData)
            .eq('id', activityId)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        // 실제 내용은 버전 관리 테이블에 저장되므로 여기서는 메타데이터만 반환
        return NextResponse.json({
            message: '활동이 성공적으로 수정되었습니다.',
            activity
        });

    } catch {
        return NextResponse.json(
            { error: '활동 수정에 실패했습니다.' },
            { status: 500 }
        );
    }
}
