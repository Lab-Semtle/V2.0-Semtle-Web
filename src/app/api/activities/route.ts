import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 활동 목록 조회
export async function GET() {
    try {
        const supabase = await createServerSupabase();

        // 활동 목록 조회 (메타데이터만) - 새 스키마: status='public'만 조회
        const { data: activitiesMeta, error: activitiesError } = await supabase
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
            .eq('status', 'public')
            .not('published_version_id', 'is', null)
            // 정렬: is_pinned 우선 → published_at 최신순
            .order('is_pinned', { ascending: false })
            .order('published_at', { ascending: false });

        if (activitiesError) {
            console.error('Error fetching activities metadata:', activitiesError);
            return NextResponse.json({ error: '활동을 조회하는데 실패했습니다.' }, { status: 500 });
        }

        // published_version_id로 버전 데이터 JOIN
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
            created_at: string;
        }

        interface ActivityCategory {
            id: number;
            name: string;
            color: string;
            icon: string;
        }

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

        type Activity = ActivityMeta & ActivityVersion & {
            category: ActivityCategory | null;
            author?: { id: string; nickname: string; name?: string; profile_image?: string | null } | null;
        };

        let activities: Activity[] = [];
        if (activitiesMeta && activitiesMeta.length > 0) {
            const versionIds = activitiesMeta
                .map(a => a.published_version_id)
                .filter(Boolean);

            if (versionIds.length > 0) {
                const { data: versions, error: versionsError } = await supabase
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
                        vote_deadline,
                        created_at
                    `)
                    .in('id', versionIds);

                if (versionsError) {
                    console.error('Error fetching activity versions:', versionsError);
                    // 버전 조회 실패 시 빈 배열 반환 (활동 목록은 비어있게 됨)
                    activities = [];
                } else if (versions && versions.length > 0) {
                    // category_id 목록 추출
                    const categoryIds = [...new Set(versions.map(v => v.category_id).filter(Boolean))];

                    // activity_categories 조회
                    let categoriesMap: Record<number, ActivityCategory> = {};
                    if (categoryIds.length > 0) {
                        const { data: categories } = await supabase
                            .from('activity_categories')
                            .select('id, name, color, icon')
                            .in('id', categoryIds);

                        if (categories) {
                            categoriesMap = categories.reduce((acc, cat) => {
                                acc[cat.id] = cat;
                                return acc;
                            }, {} as Record<number, ActivityCategory>);
                        }
                    }

                    // 메타데이터와 버전 데이터 병합
                    // 중요: 반환되는 id는 activities 테이블의 id여야 함 (버전 id 아님)
                    const mappedActivities = activitiesMeta.map(meta => {
                        const version = versions.find(v => v.id === meta.published_version_id);
                        if (version) {
                            return {
                                ...meta, // meta에 activities 테이블의 id가 있음
                                ...version,
                                id: meta.id, // activities 테이블의 id를 명시적으로 유지
                                // category는 별도 조회한 데이터 사용
                                category: version.category_id ? categoriesMap[version.category_id] : null,
                            } as Activity;
                        }
                        // published_version_id가 있지만 버전 데이터가 없는 경우 (데이터 불일치)
                        return null;
                    });
                    activities = mappedActivities.filter((activity): activity is Activity => activity !== null);
                } else {
                    // 버전 데이터가 없는 경우 (published_version_id가 있지만 실제 버전이 없음)
                    activities = [];
                }
            }
        }

        // 각 활동의 댓글 개수, 좋아요 개수 및 참가자 수 조회
        if (activities && activities.length > 0) {
            const activitiesWithCounts = await Promise.all(
                activities.map(async (activity) => {
                    const [commentCountResult, likeCountResult, participantsCountResult] = await Promise.all([
                        supabase
                            .from('activity_comments')
                            .select('*', { count: 'exact', head: true })
                            .eq('activity_id', activity.id)
                            .is('parent_id', null)
                            .eq('is_deleted', false),
                        supabase
                            .from('activity_likes')
                            .select('*', { count: 'exact', head: true })
                            .eq('activity_id', activity.id),
                        supabase
                            .from('activity_participants')
                            .select('*', { count: 'exact', head: true })
                            .eq('activity_id', activity.id)
                            .eq('status', 'registered')
                    ]);

                    return {
                        ...activity,
                        current_participants: participantsCountResult.count || 0,
                        views: activity.views_count_cached || 0,
                        likes_count: likeCountResult.count || 0,
                        bookmarks_count: activity.bookmarks_count_cached || 0,
                        // 실제 댓글 개수 사용 (답글 제외)
                        comments_count: commentCountResult.count || 0
                    };
                })
            );

            activities.splice(0, activities.length, ...activitiesWithCounts);
        }

        // 작성자 정보를 별도로 조회
        if (activities && activities.length > 0) {
            const authorIds = activities.map(a => a.author_id).filter(Boolean);
            if (authorIds.length > 0) {
                const { data: authors } = await supabase
                    .from('user_profiles')
                    .select('id, nickname, profile_image')
                    .in('id', authorIds);

                // 작성자 정보를 활동에 매핑
                activities.forEach(activity => {
                    activity.author = authors?.find(a => a.id === activity.author_id) || null;
                });
            }
        }

        // 카테고리 목록 조회
        const { data: categories } = await supabase
            .from('activity_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        return NextResponse.json({
            activities: activities || [],
            categories: categories || []
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 활동 생성
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabase();

    try {
        const body = await request.json();
        const {
            title,
            subtitle,
            content,
            category_id,
            thumbnail,
            status = 'draft',
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
        } = body;

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
                { error: '활동 게시물은 관리자만 작성할 수 있습니다.' },
                { status: 403 }
            );
        }

        // thumbnail을 배열 형태로 변환
        const thumbnailArray = Array.isArray(thumbnail)
            ? thumbnail
            : (thumbnail && thumbnail.trim() ? [thumbnail] : []);

        // 새 스키마: 외래키 제약조건 때문에 activities를 먼저 생성해야 함
        // 하지만 최대한 자연스럽게: draft로 생성 → 버전 생성 → 출판 시 한 번에 업데이트
        // CHECK 제약조건: (status = 'draft' AND published_version_id IS NULL) OR (status IN ('public', 'private') AND published_version_id IS NOT NULL)
        const insertData = {
            author_id: user.id,
            status: 'draft' as const, // 먼저 draft로 생성 (CHECK 제약조건: draft는 published_version_id가 NULL 가능)
            published_version_id: null, // 명시적으로 NULL 설정 (undefined가 아닌 null)
        };

        // 출판 시에는 INSERT 트리거가 published_at과 republished_at을 설정하지만,
        // draft로 생성할 때는 트리거가 실행되지 않으므로 명시적으로 설정하지 않음

        // 활동 생성 (RLS 정책이 auth.uid()를 사용하여 작동)
        const { data: activity, error: activityError } = await supabase
            .from('activities')
            .insert(insertData)
            .select()
            .single();

        if (activityError) {
            console.error('Activity creation error:', activityError);
            throw activityError;
        }

        // 첫 번째 버전 생성 (v1, version_code='v1')
        const versionCode = 'v1';
        const { data: firstVersion, error: versionError } = await supabase
            .from('activity_versions')
            .insert({
                activity_id: activity.id,
                author_id: user.id,
                version_number: 1,
                version_code: versionCode,
                parent_version_id: null, // 최초 버전은 부모 없음
                content,
                title,
                subtitle,
                thumbnail: thumbnailArray.length > 0 ? thumbnailArray : null,
                category_id: category_id || null,
                location: location || null,
                start_date: start_date || null,
                end_date: end_date || null,
                max_participants: max_participants || null,
                participation_fee: participation_fee || 0,
                contact_info: contact_info || null,
                tags: tags || [],
                has_voting: has_voting || false,
                vote_options: vote_options || [],
                vote_deadline: vote_deadline || null
            })
            .select()
            .single();

        if (versionError) {
            console.error('First version creation error:', versionError);
            // 버전 생성 실패 시 활동도 삭제
            await supabase.from('activities').delete().eq('id', activity.id);
            throw versionError;
        }

        // 출판 시: 버전이 생성되었으므로 이제 status='public'으로 업데이트 가능
        // CHECK 제약조건: public/private는 published_version_id가 NOT NULL이어야 함
        if (status !== 'draft') {
            const finalStatus = status === 'published' ? 'public' : 'private';

            // 버전이 준비되었으므로 status와 published_version_id를 한 번에 업데이트
            const { data: updatedActivity, error: updateError } = await supabase
                .from('activities')
                .update({
                    status: finalStatus,
                    published_version_id: firstVersion.id,
                    published_at: new Date().toISOString(),
                    republished_at: new Date().toISOString()
                })
                .eq('id', activity.id)
                .select('id, published_version_id, status')
                .single();

            if (updateError) {
                console.error('Update activity status error:', updateError);
                // 업데이트 실패 시 버전과 활동 모두 삭제
                await supabase.from('activity_versions').delete().eq('id', firstVersion.id);
                await supabase.from('activities').delete().eq('id', activity.id);
                throw updateError;
            }

            // 응답용 activity 객체 구성
            const responseActivity = {
                ...activity,
                ...firstVersion,
                published_version_id: updatedActivity?.published_version_id || firstVersion.id,
                status: updatedActivity?.status || finalStatus
            };

            return NextResponse.json({
                message: '활동이 성공적으로 생성되었습니다.',
                activity: responseActivity
            }, { status: 201 });
        } else {
            // 임시저장 (draft): published_version_id는 NULL 그대로 유지, status도 draft 유지
            const responseActivity = {
                ...activity,
                ...firstVersion,
                published_version_id: null,
                status: 'draft'
            };

            return NextResponse.json({
                message: '활동이 임시저장되었습니다.',
                activity: responseActivity
            }, { status: 201 });
        }

    } catch (error) {
        console.error('Activity creation error:', error);
        return NextResponse.json(
            { error: '활동 생성에 실패했습니다.' },
            { status: 500 }
        );
    }
}
