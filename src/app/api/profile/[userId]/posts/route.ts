import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 사용자의 공개 게시물 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const userId = resolvedParams.userId;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all'; // all, projects, resources, activities
        const includeDrafts = searchParams.get('include_drafts') === 'true';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');

        let posts = [];

        if (type === 'all' || type === 'projects') {
            // 프로젝트 조회
            let query = supabase
                .from('projects')
                .select(`
                    id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                    created_at, updated_at, published_at, status,
                    category:project_categories(name, color),
                    project_type:project_types(name)
                `)
                .eq('author_id', userId);

            if (!includeDrafts) {
                query = query.eq('status', 'published');
            }

            const { data: projects } = await query.order('published_at', { ascending: false });

            if (projects) {
                posts.push(...projects.map(p => ({ ...p, post_type: 'project' })));
            }
        }

        if (type === 'all' || type === 'resources') {
            // 자료 조회
            let query = supabase
                .from('resources')
                .select(`
                    id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                    created_at, updated_at, published_at, status,
                    category:resource_categories(name, color),
                    resource_type:resource_types(name)
                `)
                .eq('author_id', userId);

            if (!includeDrafts) {
                query = query.eq('status', 'published');
            }

            const { data: resources } = await query.order('published_at', { ascending: false });

            if (resources) {
                posts.push(...resources.map(r => ({ ...r, post_type: 'resource' })));
            }
        }

        if (type === 'all' || type === 'activities') {
            // 활동 조회
            let query = supabase
                .from('activities')
                .select(`
                    id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                    created_at, updated_at, published_at, status,
                    category:activity_categories(name, color),
                    activity_type:activity_types(name)
                `)
                .eq('author_id', userId);

            if (!includeDrafts) {
                query = query.eq('status', 'published');
            }

            const { data: activities } = await query.order('published_at', { ascending: false });

            if (activities) {
                posts.push(...activities.map(a => ({ ...a, post_type: 'activity' })));
            }
        }

        // 최신순으로 정렬
        posts.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const paginatedPosts = posts.slice(from, to + 1);

        return NextResponse.json({
            posts: paginatedPosts,
            pagination: {
                page,
                limit,
                total: posts.length,
                totalPages: Math.ceil(posts.length / limit)
            }
        });
    } catch (error) {
        console.error('사용자 게시물 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
