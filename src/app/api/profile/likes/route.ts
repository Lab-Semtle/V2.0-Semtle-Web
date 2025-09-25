import { createServerSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all'; // all, projects, resources, activities

        // 현재 사용자 확인
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        let posts = [];

        if (type === 'all' || type === 'projects') {
            // 좋아요한 프로젝트 조회
            const { data: projects } = await supabase
                .from('projects')
                .select(`
                    id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                    created_at, updated_at, published_at, status,
                    category:project_categories(name, color),
                    project_type:project_types(name),
                    author:user_profiles(nickname, name, profile_image)
                `)
                .eq('status', 'published')
                .in('id',
                    supabase
                        .from('likes')
                        .select('post_id')
                        .eq('user_id', user.id)
                        .eq('post_type', 'project')
                )
                .order('published_at', { ascending: false });

            if (projects) {
                posts.push(...projects.map(p => ({ ...p, post_type: 'project' })));
            }
        }

        if (type === 'all' || type === 'resources') {
            // 좋아요한 자료 조회
            const { data: resources } = await supabase
                .from('resources')
                .select(`
                    id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                    created_at, updated_at, published_at, status,
                    category:resource_categories(name, color),
                    resource_type:resource_types(name),
                    author:user_profiles(nickname, name, profile_image)
                `)
                .eq('status', 'published')
                .in('id',
                    supabase
                        .from('likes')
                        .select('post_id')
                        .eq('user_id', user.id)
                        .eq('post_type', 'resource')
                )
                .order('published_at', { ascending: false });

            if (resources) {
                posts.push(...resources.map(r => ({ ...r, post_type: 'resource' })));
            }
        }

        if (type === 'all' || type === 'activities') {
            // 좋아요한 활동 조회
            const { data: activities } = await supabase
                .from('activities')
                .select(`
                    id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                    created_at, updated_at, published_at, status,
                    category:activity_categories(name, color),
                    activity_type:activity_types(name),
                    author:user_profiles(nickname, name, profile_image)
                `)
                .eq('status', 'published')
                .in('id',
                    supabase
                        .from('likes')
                        .select('post_id')
                        .eq('user_id', user.id)
                        .eq('post_type', 'activity')
                )
                .order('published_at', { ascending: false });

            if (activities) {
                posts.push(...activities.map(a => ({ ...a, post_type: 'activity' })));
            }
        }

        return NextResponse.json({
            posts: posts
        });

    } catch (error) {
        console.error('좋아요한 게시물 조회 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
