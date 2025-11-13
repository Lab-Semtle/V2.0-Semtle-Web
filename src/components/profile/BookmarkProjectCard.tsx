import Link from 'next/link';
import Image from 'next/image';
import { Eye, Heart, MessageCircle, Calendar, Bookmark } from 'lucide-react';
import { Post } from '@/types/post';

interface BookmarkProjectCardProps {
  project: Post;
  className?: string;
}

export default function BookmarkProjectCard({ project, className = '' }: BookmarkProjectCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  return (
    <Link href={`/projects/${project.id}`}>
      <article
        className={`relative group rounded-2xl overflow-hidden shadow-md border-0 bg-white/80 backdrop-blur-lg hover:shadow-blue-300 transition-all duration-300 hover:scale-[1.035] hover:bg-white/90 ${className}`}
        style={{ minHeight: 220 }}
      >
        {/* 북마크 리본 포인트 */}
        <div className="absolute z-10 left-0 top-0 flex items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded-br-xl rounded-tl-2xl bg-gradient-to-r from-yellow-200 via-orange-100 to-pink-200 text-yellow-800 shadow-md font-bold text-xs gap-1 animate-pulse">
            <Bookmark className="w-3.5 h-3.5 -ml-0.5" />북마크
          </span>
        </div>
        {/* 라벨/날짜 */}
        <div className="flex items-center gap-2 absolute right-3 top-4">
          <span className="rounded bg-pink-100/90 px-2 py-0.5 text-[11px] text-pink-600 font-semibold shadow-sm">프로젝트</span>
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />{formatDate(project.created_at)}
          </span>
        </div>
        {/* 본문 */}
        <div className="flex flex-col gap-1 px-5 pt-8 pb-3 relative z-10">
          {/* 제목 */}
          <h3 className="font-extrabold text-lg text-blue-900 drop-shadow tracking-tight truncate group-hover:text-pink-500 transition-colors duration-200">{project.title}</h3>
          {/* 부제목 */}
          {project.subtitle && (
            <p className="text-slate-700 text-[13px] truncate mb-1 opacity-90">{project.subtitle}</p>
          )}
          {/* 정보라인 */}
          <div className="flex items-center gap-3 text-[13px] text-slate-400 mt-2 mb-1">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /><span>{project.views}</span></span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /><span>{project.likes_count}</span></span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /><span>{project.comments_count}</span></span>
          </div>
        </div>
        {/* 하단 반투명 바 & 북마크 강조 */}
        <div className="absolute left-0 bottom-0 w-full">
          <div className="flex items-center justify-between px-5 py-2 bg-gradient-to-r from-pink-200/50 via-white/80 to-blue-50/20">
            <span className="font-[700] text-pink-500 text-xs tracking-wide opacity-80 animate-fade-in">MY BOOKMARK</span>
            {/* 프로필 썸네일(작게)/작성자 */}
            {project.author?.profile_image ? (
              <span className="ml-2 w-6 h-6 rounded-full overflow-hidden border border-white shadow-md flex items-center justify-center">
                <Image src={project.author.profile_image ?? ''} alt={project.author.nickname ?? ''} width={24} height={24} className="object-cover" />
              </span>
            ) : (
              <span className="ml-2 w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-500 text-xs border border-white shadow-md">
                {project.author?.nickname?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        {/* 블러 배경효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white/95 to-indigo-50 pointer-events-none z-0 blur-[2px] opacity-70 group-hover:opacity-80 transition-all duration-300" />
      </article>
    </Link>
  );
}
