import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 활동 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 활동 목록 조회
        const { data: activities, error: activitiesError } = await supabase
            .from('activities')
            .select(`
                *,
                category:activity_categories(id, name, color, icon),
                activity_type:activity_types(id, name, description, icon)
            `)
            .eq('status', 'published')
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

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

        if (activitiesError) {
            console.error('활동 조회 오류:', activitiesError);
            return NextResponse.json({ error: '활동을 조회하는데 실패했습니다.' }, { status: 500 });
        }

        // 카테고리 목록 조회
        const { data: categories, error: categoriesError } = await supabase
            .from('activity_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        // 활동 타입 목록 조회
        const { data: types, error: typesError } = await supabase
            .from('activity_types')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        return NextResponse.json({
            activities: activities || [],
            categories: categories || [],
            types: types || []
        });
    } catch (error) {
        console.error('활동 조회 서버 오류:', error);
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
            activity_type_id,
            thumbnail,
            status = 'draft',
            activity_status = 'upcoming',
            location,
            start_date,
            end_date,
            max_participants,
            participation_fee,
            contact_info,
            tags,
            author_id
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

        // 활동 생성
        const { data: activity, error: activityError } = await supabase
            .from('activities')
            .insert({
                title,
                subtitle,
                content,
                category_id,
                activity_type_id,
                thumbnail,
                status,
                activity_status,
                location,
                start_date,
                end_date,
                max_participants,
                participation_fee: participation_fee || 0,
                contact_info,
                tags: tags || [],
                author_id: user.id,
                published_at: status === 'published' ? new Date().toISOString() : null
            })
            .select()
            .single();

        if (activityError) {
            console.error('활동 생성 오류:', activityError);
            throw activityError;
        }

        return NextResponse.json({
            message: '활동이 성공적으로 생성되었습니다.',
            activity
        }, { status: 201 });

    } catch (error) {
        console.error('활동 생성 서버 오류:', error);
        return NextResponse.json(
            { error: '활동 생성에 실패했습니다.' },
            { status: 500 }
        );
    }
}
