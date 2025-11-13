import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

interface UserProfile {
    id: string;
    nickname: string;
    profile_image?: string;
}

// Supabase에서 반환되는 원시 댓글 타입
interface RawComment {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
    updated_at?: string;
    parent_id?: number;
    is_deleted: boolean;
    likes_count: number; // 테이블에 직접 저장된 값
}

// 최종 변환된 댓글 타입
interface CommentWithLikes {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
    updated_at?: string;
    parent_id?: number;
    is_deleted: boolean;
    likes_count: number;
    replies?: CommentWithLikes[];
}

// RawComment를 CommentWithLikes로 변환하는 헬퍼 함수
function transformComment(rawComment: RawComment): CommentWithLikes {
    return {
        ...rawComment,
        likes_count: rawComment.likes_count || 0
    };
}

// 통합 댓글 조회 API
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postType: string; postId: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const { postType, postId } = resolvedParams;
        const postIdNum = parseInt(postId);

        if (isNaN(postIdNum)) {
            return NextResponse.json({ error: '잘못된 게시물 ID입니다.' }, { status: 400 });
        }

        // 게시물 타입에 따른 테이블 매핑
        const tableMap = {
            project: 'project_comments',
            activity: 'activity_comments',
            resource: 'resource_comments'
        };

        const commentTable = tableMap[postType as keyof typeof tableMap];
        if (!commentTable) {
            return NextResponse.json({ error: '지원하지 않는 게시물 타입입니다.' }, { status: 400 });
        }

        // 게시물 존재 확인
        const postTableMap = {
            project: 'projects',
            activity: 'activities',
            resource: 'resources'
        };

        const postTable = postTableMap[postType as keyof typeof postTableMap];

        // 댓글은 활동 게시물(activities) 테이블과 직접 연결됨 (버전과 무관)
        // activity_versions ID가 전달되면 activities 테이블 ID로 변환
        interface Post {
            id: number;
            status?: string;
        }

        let actualPostId = postIdNum;
        let post: Post | null = null;

        if (postType === 'activity') {
            // 중요: 댓글은 activities 테이블 ID로 조회해야 함
            // 먼저 activities 테이블에서 직접 조회 시도
            const { data: activityDirect } = await supabase
                .from('activities')
                .select('id, status')
                .eq('id', postIdNum)
                .maybeSingle();

            if (activityDirect) {
                // activities 테이블에서 직접 찾음 - 올바른 ID
                post = activityDirect;
                actualPostId = postIdNum;
            } else {
                // activities 테이블에서 찾지 못했으면 activity_versions의 ID일 가능성
                // activity_versions에서 activity_id 찾기 (댓글은 activities ID로 조회해야 함)
                const { data: version } = await supabase
                    .from('activity_versions')
                    .select('activity_id')
                    .eq('id', postIdNum)
                    .maybeSingle();

                if (version && version.activity_id) {
                    // activity_versions의 ID를 activities 테이블 ID로 변환
                    // 댓글은 항상 activities 테이블 ID로 조회해야 함
                    actualPostId = version.activity_id;

                    // 올바른 activity_id로 activities 테이블에서 조회
                    const { data: activityRetry } = await supabase
                        .from('activities')
                        .select('id, status')
                        .eq('id', actualPostId)
                        .maybeSingle();

                    if (activityRetry) {
                        post = activityRetry;
                    }
                }
            }
        } else if (postType === 'resource') {
            // resources 테이블의 경우 새 스키마 고려
            // resources 테이블의 status는 enum 타입 ('draft', 'public', 'private')
            const { data: resourceData, error: resourceError } = await supabase
                .from('resources')
                .select('id, status')
                .eq('id', postIdNum)
                .eq('status', 'public')
                .maybeSingle();

            if (resourceError || !resourceData) {
                console.error('❌ resources 조회 실패 - error:', resourceError);
                post = null;
            } else {
                post = resourceData;
            }
        } else {
            // 다른 타입은 기존 로직 사용
            let postQuery = supabase
                .from(postTable)
                .select('id, status')
                .eq('id', postIdNum);

            if (postType === 'activity') {
                // activities: status가 'public' 또는 'private'인 경우만 (draft는 제외)
                postQuery = postQuery.in('status', ['public', 'private']);
            } else {
                // projects: 기존대로 'published' 상태만
                postQuery = postQuery.eq('status', 'published');
            }

            const { data: postData } = await postQuery.maybeSingle();
            post = postData;
        }

        if (!post) {
            return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 댓글 조회 (부모 댓글만) - 좋아요 수는 테이블에 저장된 값 사용
        const { data: comments, error } = await supabase
            .from(commentTable)
            .select('*')
            .eq(`${postType}_id`, actualPostId)
            .is('parent_id', null)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('댓글 조회 오류:', error);
            return NextResponse.json({ error: '댓글을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 각 댓글의 대댓글 조회
        const commentsWithReplies = await Promise.all(
            (comments as unknown as RawComment[] || []).map(async (comment: RawComment) => {
                const { data: replies } = await supabase
                    .from(commentTable)
                    .select('*')
                    .eq('parent_id', comment.id)
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: true });

                return {
                    ...transformComment(comment),
                    replies: (replies as unknown as RawComment[] || []).map((reply: RawComment) => transformComment(reply))
                };
            })
        );

        // 모든 댓글과 대댓글의 사용자 정보 조회
        const allCommentIds = [
            ...commentsWithReplies.map(c => c.user_id),
            ...commentsWithReplies.flatMap(c => c.replies?.map((r: CommentWithLikes) => r.user_id) || [])
        ];
        const uniqueUserIds = [...new Set(allCommentIds)];

        const { data: users } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .in('id', uniqueUserIds) as { data: UserProfile[] | null };

        // 사용자 정보를 댓글에 매핑
        const commentsWithUsers = commentsWithReplies.map(comment => ({
            ...comment,
            user_id: comment.user_id,
            user: users?.find(u => u.id === comment.user_id) || {
                id: comment.user_id,
                nickname: 'Unknown',
                profile_image: null
            },
            replies: comment.replies?.map((reply: CommentWithLikes) => ({
                ...reply,
                user_id: reply.user_id,
                user: users?.find(u => u.id === reply.user_id) || {
                    id: reply.user_id,
                    nickname: 'Unknown',
                    profile_image: null
                }
            }))
        }));

        return NextResponse.json({ comments: commentsWithUsers });
    } catch (error) {
        console.error('댓글 조회 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 통합 댓글 생성 API
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postType: string; postId: string }> }
) {
    console.log('📝 POST /api/comments/[postType]/[postId] - 댓글 생성 요청');
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const { postType, postId } = resolvedParams;
        console.log('📝 파라미터 - postType:', postType, 'postId:', postId);
        const postIdNum = parseInt(postId);

        if (isNaN(postIdNum)) {
            return NextResponse.json({ error: '잘못된 게시물 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { content, parent_id } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
        }

        // 게시물 타입에 따른 테이블 매핑
        const tableMap = {
            project: 'project_comments',
            activity: 'activity_comments',
            resource: 'resource_comments'
        };

        const commentTable = tableMap[postType as keyof typeof tableMap];
        if (!commentTable) {
            return NextResponse.json({ error: '지원하지 않는 게시물 타입입니다.' }, { status: 400 });
        }

        // 게시물 존재 확인
        const postTableMap = {
            project: 'projects',
            activity: 'activities',
            resource: 'resources'
        };

        const postTable = postTableMap[postType as keyof typeof postTableMap];
        const postIdField = postType === 'activity' ? 'id' : 'id';

        interface PostForComment {
            id: number;
            title: string;
            author_id: string;
        }

        let post: PostForComment | null = null;

        if (postType === 'activity') {
            // activities 테이블의 경우 새 스키마 고려
            // activities 테이블에는 title이 없고, published_version_id를 통해 activity_versions에서 가져와야 함
            const { data: activityData, error: activityError } = await supabase
                .from('activities')
                .select('id, published_version_id')
                .eq('id', postIdNum)
                .in('status', ['public', 'private'])
                .single();

            console.log('📝 activities 조회 결과 - activityData:', activityData, 'error:', activityError);

            if (activityError || !activityData) {
                console.error('❌ activities 조회 실패 - error:', activityError);
                return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
            }

            // published_version_id를 통해 실제 컨텐츠 정보 가져오기
            if (activityData.published_version_id) {
                const { data: versionData, error: versionError } = await supabase
                    .from('activity_versions')
                    .select('id, title, author_id')
                    .eq('id', activityData.published_version_id)
                    .single();

                console.log('📝 activity_versions 조회 결과 - versionData:', versionData, 'error:', versionError);

                if (versionError || !versionData) {
                    console.error('❌ activity_versions 조회 실패 - error:', versionError);
                    return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
                }

                post = {
                    id: activityData.id,
                    title: versionData.title,
                    author_id: versionData.author_id
                };
            } else {
                console.error('❌ published_version_id가 없음');
                return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
            }
        } else if (postType === 'resource') {
            // resources 테이블의 경우 새 스키마 고려
            // resources 테이블에는 title이 없고, published_version_id를 통해 resource_versions에서 가져와야 함
            const { data: resourceData, error: resourceError } = await supabase
                .from('resources')
                .select('id, published_version_id')
                .eq('id', postIdNum)
                .eq('status', 'public')
                .single();

            console.log('📝 resources 조회 결과 - resourceData:', resourceData, 'error:', resourceError);

            if (resourceError || !resourceData) {
                console.error('❌ resources 조회 실패 - error:', resourceError);
                return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
            }

            // published_version_id를 통해 실제 컨텐츠 정보 가져오기
            if (resourceData.published_version_id) {
                const { data: versionData, error: versionError } = await supabase
                    .from('resource_versions')
                    .select('id, title, author_id')
                    .eq('id', resourceData.published_version_id)
                    .single();

                console.log('📝 resource_versions 조회 결과 - versionData:', versionData, 'error:', versionError);

                if (versionError || !versionData) {
                    console.error('❌ resource_versions 조회 실패 - error:', versionError);
                    return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
                }

                post = {
                    id: resourceData.id,
                    title: versionData.title,
                    author_id: versionData.author_id
                };
            } else {
                console.error('❌ published_version_id가 없음');
                return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
            }
        } else {
            // projects: 기존 로직 사용
            const postQuery = supabase
                .from(postTable)
                .select('id, title, author_id')
                .eq(postIdField, postIdNum)
                .eq('status', 'published');

            const { data: postData, error: postError } = await postQuery.single();

            if (!postData || postError) {
                console.error('❌ 게시물 조회 실패 - post:', postData, 'error:', postError);
                return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
            }

            post = postData;
        }

        console.log('✅ 게시물 조회 성공 - id:', post.id, 'title:', post.title, 'author_id:', post.author_id);

        // 댓글 생성
        console.log('📝 댓글 생성 시작 - commentTable:', commentTable, 'postIdNum:', postIdNum, 'userId:', user.id);

        const { data: newComment, error } = await supabase
            .from(commentTable)
            .insert({
                [`${postType}_id`]: postIdNum,
                user_id: user.id,
                content: content.trim(),
                parent_id: parent_id || null
            })
            .select('*')
            .single();

        if (error) {
            console.error('❌ 댓글 생성 오류:', error);
            return NextResponse.json({ error: '댓글 생성에 실패했습니다.' }, { status: 500 });
        }

        console.log('✅ 댓글 생성 성공 - commentId:', newComment?.id);

        // 사용자 정보 조회
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .eq('id', user.id)
            .single();

        const commentWithUser = {
            ...transformComment(newComment as unknown as RawComment),
            user: userProfile || {
                id: user.id,
                nickname: 'Unknown',
                profile_image: null
            }
        };

        // 알림 생성 (작성자에게, 대댓글이 아닌 경우)
        if (!parent_id && post.author_id !== user.id) {
            await supabase
                .from('notifications')
                .insert({
                    user_id: post.author_id,
                    type: 'comment',
                    title: '새로운 댓글이 달렸습니다',
                    message: `${commentWithUser.user.nickname}님이 ${postType === 'project' ? '프로젝트' : postType === 'activity' ? '활동' : '자료'} "${post.title}"에 댓글을 남겼습니다.`,
                    related_id: postIdNum,
                    related_type: postType
                });
        }

        return NextResponse.json({ comment: commentWithUser });
    } catch (error) {
        console.error('댓글 생성 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
