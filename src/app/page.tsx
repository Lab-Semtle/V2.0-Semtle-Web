'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/layout/Navigation";
import { Megaphone, Trophy, FileText, ArrowRight, CheckCircle, MessageCircle } from "lucide-react";

interface LatestPost {
  id: number;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  post_type: 'project' | 'resource' | 'activity';
  board_type: 'projects' | 'resources' | 'activities';
  display_date: string;
  author: {
    nickname: string;
    name: string;
    profile_image?: string;
  };
  category?: {
    name: string;
    color?: string;
  };
}

function HomeContent() {
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);
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
    const fetchLatestPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await fetch('/api/posts/latest?limit=6');
        if (response.ok) {
          const data = await response.json();
          setLatestPosts(data.posts || []);
        }
      } catch {
        // 오류 시 빈 배열로 설정
        setLatestPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchLatestPosts();
  }, []);

  const getPostTypeInfo = (postType: string) => {
    switch (postType) {
      case 'project':
        return {
          icon: Trophy,
          label: '프로젝트',
          color: 'purple',
          bgColor: 'purple-50',
          textColor: 'purple-600',
          hoverColor: 'purple-200'
        };
      case 'resource':
        return {
          icon: FileText,
          label: '자료실',
          color: 'emerald',
          bgColor: 'emerald-50',
          textColor: 'emerald-600',
          hoverColor: 'emerald-200'
        };
      case 'activity':
        return {
          icon: Megaphone,
          label: '활동',
          color: 'blue',
          bgColor: 'blue-50',
          textColor: 'blue-600',
          hoverColor: 'blue-200'
        };
      default:
        return {
          icon: FileText,
          label: '게시물',
          color: 'gray',
          bgColor: 'gray-50',
          textColor: 'gray-600',
          hoverColor: 'gray-200'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  const getPostUrl = (post: LatestPost) => {
    return `/${post.board_type}/${post.id}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* 이메일 인증 완료 메시지 */}
      {showVerificationMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">이메일 인증이 완료되었습니다! 이제 로그인하실 수 있습니다.</span>
        </div>
      )}



      {/* Hero Section */}
      <section className="pt-48 pb-56 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero/kmou_fall.jpg"
            alt="KMOU Fall"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/15 to-transparent backdrop-blur-sm"></div>
          {/* Bottom fade to features section */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-slate-50/50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {/* Main Title */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-none drop-shadow-lg animate-fade-in-up">
                KOREA MARITIME & OCEAN UNIV.
              </h1>
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-black leading-none drop-shadow-lg animate-fade-in-up animation-delay-200">
                Division of Artificial Intelligence Engineering Archi Semtle
              </h2>
              <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-black leading-none drop-shadow-lg animate-fade-in-up animation-delay-400">
                국립한국해양대학교 인공지능공학부 아치셈틀
              </h3>
            </div>

            {/* CTA Button */}
            <div className="pt-4 animate-fade-in-up animation-delay-600">
              <Link
                href="/activities"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-full hover:from-slate-800 hover:to-slate-600 transition-all duration-300 shadow-2xl hover:shadow-slate-900/30 transform hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10">활동 둘러보기</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              주요 활동
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              아치셈틀의<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">주요 활동</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              인공지능과 컴퓨터과학 분야의 다양한 활동을 통해 함께 성장하고 발전해나갑니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link
              href="/activities"
              className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-200 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Megaphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">활동게시판</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">학회 공지사항, 세미나, 홈커밍 등 다양한 활동 소식을 확인하세요</p>
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                  자세히 보기
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            <Link
              href="/projects"
              className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-purple-200 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">프로젝트</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">프로젝트 팀 모집, 공모전 참가 등 포트폴리오 구축을 위한 다양한 기회를 얻어가세요</p>
                <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:text-purple-700">
                  자세히 보기
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            <Link
              href="/resources"
              className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-emerald-200 hover:-translate-y-2 overflow-hidden md:col-span-2 lg:col-span-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">자료실</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">족보, 프로젝트 템플릿 등 학습에 도움이 되는 자료를 공유합니다</p>
                <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:text-emerald-700">
                  자세히 보기
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 rounded-full translate-y-40 -translate-x-40"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-20">
            <div className="mb-8 lg:mb-0">
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                최신 소식
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                아치셈틀의<br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">최신 소식</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                학회의 최신 활동과 공지사항을 확인하고 함께 참여해보세요
              </p>
            </div>
            <Link
              href="/activities"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-full hover:from-slate-800 hover:to-slate-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              전체 보기
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingPosts ? (
              // 로딩 상태
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="group relative bg-white rounded-3xl p-8 shadow-xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                      <div>
                        <div className="h-6 bg-gray-200 rounded-full w-20 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : latestPosts.length > 0 ? (
              // 실제 데이터 표시
              latestPosts.map((post, index) => {
                const typeInfo = getPostTypeInfo(post.post_type);
                const IconComponent = typeInfo.icon;
                const isWideCard = index === 2; // 세 번째 카드를 넓게 표시

                return (
                  <Link
                    key={post.id}
                    href={getPostUrl(post)}
                    className={`group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-${typeInfo.hoverColor} hover:-translate-y-2 overflow-hidden ${isWideCard ? 'md:col-span-2 lg:col-span-1' : ''}`}
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-${typeInfo.color}-500/10 to-${typeInfo.color}-600/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700`}></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-br from-${typeInfo.color}-500 to-${typeInfo.color}-600 rounded-2xl flex items-center justify-center shadow-lg`}>
                            <IconComponent className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <span className={`text-sm font-bold text-${typeInfo.textColor} bg-${typeInfo.bgColor} px-3 py-1 rounded-full`}>
                              {typeInfo.label}
                            </span>
                            <p className="text-xs text-slate-500 mt-1">{formatDate(post.display_date)}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 bg-${typeInfo.color}-500 rounded-full animate-pulse`}></div>
                      </div>
                      <h3 className={`text-xl font-bold text-slate-900 mb-4 group-hover:text-${typeInfo.textColor} transition-colors duration-300 leading-tight`}>
                        {post.title}
                      </h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {post.subtitle || '자세한 내용을 확인해보세요.'}
                      </p>
                      <div className={`flex items-center text-${typeInfo.textColor} font-semibold text-sm group-hover:text-${typeInfo.color}-700`}>
                        자세히 보기
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                );
              })
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-full -translate-y-40 -translate-x-40"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-500/5 to-purple-500/5 rounded-full translate-y-48 translate-x-48"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              문의하기
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              궁금한 점이<br />
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">있으신가요?</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
              아치셈틀에 대한 문의사항이나 제안사항이 있으시면 언제든지 연락해주세요.<br />
              빠른 시일 내에 답변드리겠습니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/contact"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden"
              >
                <MessageCircle className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative z-10">문의하기</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <div className="flex items-center space-x-6 text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">평균 응답시간: 일주일 이내</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">24시간 접수 가능</span>
                </div>
              </div>
            </div>
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
