'use client';

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Megaphone, Trophy, FileText, ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import { BubbleBackground } from "@/components/ui/bubble-background";
import ActivityCard from "@/components/activities/ActivityCard";
import { ActivityPost } from "@/types/activity";

function HomeContent() {
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [latestActivities, setLatestActivities] = useState<ActivityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setShowVerificationMessage(true);
      // 5초 후 메시지 자동 제거
      setTimeout(() => {
        setShowVerificationMessage(false);
      }, 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchLatestActivities = async () => {
      try {
        setLoadingPosts(true);
        const response = await fetch('/api/posts/latest?type=activity&limit=4');
        if (response.ok) {
          const data = await response.json();
          // ActivityPost 형식으로 변환
          interface PostData {
            id: number;
            title: string;
            subtitle?: string;
            thumbnail?: string | string[] | null;
            views_count_cached?: number;
            likes_count_cached?: number;
            comments_count_cached?: number;
            bookmarks_count_cached?: number;
            created_at?: string;
            published_at?: string;
            display_date?: string;
            author_id?: string;
            category?: { name: string; color?: string } | null;
            author?: { nickname: string; name?: string; profile_image?: string | null };
            start_date?: string | null;
            end_date?: string | null;
            location?: string | null;
            max_participants?: number | null;
            participation_fee?: number | null;
            contact_info?: string | null;
            has_voting?: boolean;
            vote_options?: unknown;
            vote_deadline?: string | null;
            published_version_id?: number | null;
          }

          const activities: ActivityPost[] = (data.posts || []).map((post: PostData) => ({
            id: post.id,
            title: post.title,
            subtitle: post.subtitle,
            thumbnail: post.thumbnail,
            post_type: 'activity' as const,
            status: 'published' as const,
            views: post.views_count_cached || 0,
            likes_count: post.likes_count_cached || 0,
            comments_count: post.comments_count_cached || 0,
            bookmarks_count: post.bookmarks_count_cached || 0,
            created_at: post.created_at || post.display_date,
            published_at: post.published_at || post.display_date,
            author_id: post.author_id || '',
            category: post.category || undefined,
            author: post.author,
            start_date: post.start_date,
            end_date: post.end_date,
            location: post.location,
            max_participants: post.max_participants,
            participation_fee: post.participation_fee,
            contact_info: post.contact_info,
            has_voting: post.has_voting,
            vote_options: post.vote_options,
            vote_deadline: post.vote_deadline,
            published_version_id: post.published_version_id
          }));
          setLatestActivities(activities);
        }
      } catch {
        // 오류 시 빈 배열로 설정
        setLatestActivities([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchLatestActivities();
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* 이메일 인증 완료 메시지 */}
      {showVerificationMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">이메일 인증이 완료되었습니다! 이제 로그인하실 수 있습니다.</span>
        </div>
      )}



      {/* Hero Section */}
      <section className="relative min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] lg:min-h-[55vh] flex items-center justify-center overflow-hidden">
        <BubbleBackground
          interactive
          className="absolute inset-0"
          colors={{
            first: '14,165,233', // cyan-500 - 연한 톤
            second: '59,130,246', // blue-500 - 연한 톤
            third: '20,184,166', // teal-500 - 연한 톤
            fourth: '125,211,252', // sky-400 - 연한 톤
            fifth: '99,102,241', // indigo-500 - 연한 톤
            sixth: '139,92,246', // violet-500 - 연한 톤
          }}
        />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="space-y-2 md:space-y-3">
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 leading-tight drop-shadow-lg">
                KOREA MARITIME & OCEAN UNIV.
              </h1>
              <h2 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-800 leading-tight drop-shadow-md">
                Division of Artificial Intelligence Engineering
              </h2>
              <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-900 leading-tight drop-shadow-md">
                국립한국해양대학교 인공지능공학부 아치셈틀
              </h3>
            </div>
          </div>
        </div>
        {/* Bottom fade to features section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-slate-50/90 z-[5] pointer-events-none"></div>
      </section>

      {/* Features Section - 아치셈틀 소개 */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-sky-50/20 to-blue-50/10 relative overflow-hidden">
        {/* 미묘한 배경 요소 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/8 to-blue-200/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-200/8 to-purple-200/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
            {/* 왼쪽: 텍스트 영역 */}
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 mb-6 md:mb-8 leading-tight">
                아치셈틀 <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">소개</span>
              </h2>
              <div className="text-base md:text-lg lg:text-xl text-slate-700 leading-relaxed space-y-5">
                <p className="text-base md:text-lg lg:text-xl font-medium text-slate-800">안녕하세요 👋</p>
                <p className="text-slate-700">국립한국해양대학교 인공지능공학부 학회 아치셈틀입니다.</p>
                <p className="text-slate-600 leading-relaxed">
                  &apos;아치셈틀&apos;은 우리 학교가 위치한 <strong className="font-semibold text-slate-900 bg-cyan-50 px-2 py-0.5 rounded">부산 영도구의 아치섬(아치)</strong>과, 컴퓨터의 순우리말인 셈틀을 합쳐 만든 이름입니다.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  저희 아치셈틀은 프로젝트, 공모전, 해커톤, 세미나 등<br />
                  인공지능 및 컴퓨터과학과 관련된 다양한 활동을 통해<br />
                  서로 배우고 함께 성장하는 것을 목표로 하고 있습니다.
                </p>
              </div>
            </div>

            {/* 오른쪽: 카드 영역 */}
            <div className="flex flex-col gap-6 md:gap-8">
              <Link
                href="/activities"
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-7 md:p-9 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/60 hover:border-cyan-300/60 hover:-translate-y-2 overflow-hidden"
              >
                {/* 배경 그라디언트 */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 md:w-40 h-32 md:h-40 bg-gradient-to-br from-cyan-400/8 to-blue-400/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-5">
                    <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                      <Megaphone className="w-5 md:w-6 h-5 md:h-6 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors duration-300">학회 활동 게시판</h3>
                  </div>
                  <p className="text-sm md:text-base lg:text-lg text-slate-600 mb-6 md:mb-7 leading-relaxed">학회 공지사항, 세미나, 홈커밍 등 다양한 활동 소식을 확인하세요</p>
                  <div className="flex items-center text-cyan-600 font-semibold text-sm md:text-base group-hover:text-cyan-700">
                    자세히 보기
                    <ArrowRight className="ml-2 w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>

              <Link
                href="/projects"
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-7 md:p-9 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/60 hover:border-indigo-300/60 hover:-translate-y-2 overflow-hidden"
              >
                {/* 배경 그라디언트 */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 md:w-40 h-32 md:h-40 bg-gradient-to-br from-indigo-400/8 to-purple-400/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-5">
                    <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-indigo-500/20">
                      <Trophy className="w-5 md:w-6 h-5 md:h-6 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">프로젝트 게시판</h3>
                  </div>
                  <p className="text-sm md:text-base lg:text-lg text-slate-600 mb-6 md:mb-7 leading-relaxed">프로젝트 개설, 프로젝트 팀원 모집 등 포트폴리오 구축을 위한 다양한 기회를 얻어가세요.</p>
                  <div className="flex items-center text-indigo-600 font-semibold text-sm md:text-base group-hover:text-indigo-700">
                    자세히 보기
                    <ArrowRight className="ml-2 w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>

              <Link
                href="/resources"
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-7 md:p-9 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/60 hover:border-teal-300/60 hover:-translate-y-2 overflow-hidden"
              >
                {/* 배경 그라디언트 */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-cyan-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 md:w-40 h-32 md:h-40 bg-gradient-to-br from-teal-400/8 to-cyan-400/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-5">
                    <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-teal-500/20">
                      <FileText className="w-5 md:w-6 h-5 md:h-6 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors duration-300">자료실 게시판</h3>
                  </div>
                  <p className="text-sm md:text-base lg:text-lg text-slate-600 mb-6 md:mb-7 leading-relaxed">시험 족보, 학습 자료 등 학업에 도움이 되는 자료를 공유합니다</p>
                  <div className="flex items-center text-teal-600 font-semibold text-sm md:text-base group-hover:text-teal-700">
                    자세히 보기
                    <ArrowRight className="ml-2 w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-sky-50/20 to-blue-50/10 relative overflow-hidden">
        {/* 미묘한 배경 요소 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/8 to-blue-200/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-200/8 to-purple-200/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-20 lg:mb-24">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 mb-6 md:mb-8 leading-tight">
              아치셈틀의 <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">최신 소식</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed px-4 mb-8 md:mb-10">
              학회의 최신 활동과 공지사항을 확인하고 함께 참여해보세요
            </p>
            <Link
              href="/activities"
              className="group inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span className="text-sm md:text-base">학회활동 게시판으로 이동</span>
              <ArrowRight className="ml-2 w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loadingPosts ? (
              // 로딩 상태
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="group relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-slate-200/60 overflow-hidden animate-pulse">
                  <div className="aspect-video w-full bg-gray-200 rounded-2xl mb-4"></div>
                  <div className="h-4 md:h-6 bg-gray-200 rounded mb-3 md:mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 md:h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : latestActivities.length > 0 ? (
              // 실제 데이터 표시 - ActivityCard 사용
              latestActivities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  priority={index < 2}
                />
              ))
            ) : (
              // 게시물이 없을 때
              <div className="col-span-full text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">아직 게시물이 없습니다</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  첫 번째 게시물이 등록되면 여기에 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-sky-50/20 to-blue-50/10 relative overflow-hidden">
        {/* 미묘한 배경 요소 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/8 to-blue-200/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-200/8 to-purple-200/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-20 lg:mb-24">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 mb-6 md:mb-8 leading-tight">
              궁금한 점이 <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">있으신가요?</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed px-4 mb-8 md:mb-10">
              아치셈틀에 대한 문의사항이나 제안사항이 있으시면 언제든지 연락해주세요.<br />
              빠른 시일 내에 답변드리겠습니다.
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <MessageCircle className="mr-2 w-4 md:w-5 h-4 md:h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm md:text-base">문의하기</span>
              <ArrowRight className="ml-2 w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
