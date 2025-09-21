'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Eye, Heart, MessageCircle, Share2, Pin, Tag, Clock, ChevronRight, Users, MapPin, Code, Palette, Database, Smartphone, Globe, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

// 임시 데이터 (실제로는 API에서 가져올 데이터)
const mockProject = {
    id: 1,
    title: "AI 기반 스마트 캠퍼스 앱 개발",
    description: "머신러닝을 활용한 캠퍼스 생활 최적화 앱을 개발합니다. React Native와 Python을 사용하여 크로스 플랫폼 앱을 만들 예정입니다.",
    category: "모바일앱",
    status: "모집중",
    teamSize: 4,
    currentMembers: 2,
    neededSkills: ["React Native", "Python", "Machine Learning", "UI/UX", "Firebase", "TensorFlow"],
    duration: "3개월",
    startDate: "2024-03-01",
    deadline: "2024-02-20",
    views: 156,
    likes: 23,
    comments: 8,
    author: "김개발",
    authorRole: "프로젝트 리더",
    date: "2024-02-15",
    isPinned: true,
    tags: ["AI", "모바일앱", "React Native", "Python", "머신러닝"],
    location: "온라인",
    difficulty: "중급",
    content: `# AI 기반 스마트 캠퍼스 앱 개발 프로젝트

## 프로젝트 개요
이 프로젝트는 머신러닝 기술을 활용하여 대학생들의 캠퍼스 생활을 더욱 효율적이고 편리하게 만들어주는 모바일 애플리케이션을 개발하는 것을 목표로 합니다.

## 주요 기능
1. **스마트 시간표 관리**
   - AI가 개인의 학습 패턴을 분석하여 최적의 시간표를 추천
   - 과목별 난이도와 개인 성향을 고려한 스케줄링

2. **캠퍼스 내비게이션**
   - 실시간 혼잡도 분석을 통한 최적 경로 안내
   - 건물별 시설 정보 및 이용 가능 시간 제공

3. **학습 도우미**
   - 개인화된 학습 계획 수립
   - 과목별 추천 자료 및 학습 방법 제안

4. **소셜 기능**
   - 같은 과목을 듣는 학생들과의 소통
   - 스터디 그룹 매칭 서비스

## 기술 스택
- **Frontend**: React Native, TypeScript
- **Backend**: Python (Django/FastAPI)
- **AI/ML**: TensorFlow, PyTorch, scikit-learn
- **Database**: PostgreSQL, Redis
- **Cloud**: AWS/GCP, Firebase
- **DevOps**: Docker, CI/CD

## 팀 구성
- **프로젝트 리더**: 1명 (김개발)
- **Frontend 개발자**: 1명 (모집중)
- **Backend 개발자**: 1명 (모집중)
- **AI/ML 엔지니어**: 1명 (모집중)

## 일정
- **1주차**: 프로젝트 기획 및 기술 스택 확정
- **2-4주차**: UI/UX 디자인 및 프로토타입 개발
- **5-8주차**: 핵심 기능 개발 (AI 모델 학습 포함)
- **9-12주차**: 통합 테스트 및 배포 준비

## 참가 조건
- React Native 또는 모바일 앱 개발 경험
- Python 백엔드 개발 경험 (AI/ML 경험 우대)
- 팀워크와 소통 능력
- 프로젝트 완주 의지

## 지원 방법
- 이메일: project@archsemtle.com
- 지원 마감: 2024년 2월 20일
- 면접 일정: 2024년 2월 22일

많은 관심과 지원 부탁드립니다!`,
    requirements: [
        "React Native 개발 경험 1년 이상",
        "Python 백엔드 개발 경험",
        "머신러닝 기초 지식",
        "팀 프로젝트 경험",
        "Git 사용 경험"
    ],
    benefits: [
        "실무 수준의 프로젝트 경험",
        "포트폴리오 구축",
        "네트워킹 기회",
        "멘토링 제공",
        "프로젝트 완주 시 수료증 발급"
    ]
};

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState(mockProject);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isApplied, setIsApplied] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleApply = () => {
        setIsApplied(!isApplied);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: project.title,
                text: project.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 클립보드에 복사되었습니다.');
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: any } = {
            "모바일앱": Smartphone,
            "웹개발": Globe,
            "게임개발": Palette,
            "IoT": Database,
            "데이터분석": Code,
            "AI/ML": Code,
            "블록체인": Database
        };
        return icons[category] || Code;
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            "모집중": "bg-green-100 text-green-800 border-green-200",
            "모집완료": "bg-gray-100 text-gray-800 border-gray-200"
        };
        return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getDifficultyColor = (difficulty: string) => {
        const colors: { [key: string]: string } = {
            "초급": "bg-green-100 text-green-800 border-green-200",
            "중급": "bg-yellow-100 text-yellow-800 border-yellow-200",
            "고급": "bg-red-100 text-red-800 border-red-200"
        };
        return colors[difficulty] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const CategoryIcon = getCategoryIcon(project.category);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                {/* 배경 패턴 */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10"></div>

                <div className="relative py-20 pt-24">
                    <div className="max-w-4xl mx-auto px-6">
                        {/* 뒤로 가기 버튼 */}
                        <button
                            onClick={() => router.back()}
                            className="mb-8 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 text-slate-700 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            뒤로 가기
                        </button>

                        {/* 카테고리 및 상태 */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-xl font-bold text-sm">
                                <CategoryIcon className="w-4 h-4" />
                                {project.category}
                            </div>
                            <div className={`px-4 py-2 rounded-xl font-bold text-sm border ${getStatusColor(project.status)}`}>
                                {project.status}
                            </div>
                            <div className={`px-4 py-2 rounded-xl font-bold text-sm border ${getDifficultyColor(project.difficulty)}`}>
                                {project.difficulty}
                            </div>
                            {project.isPinned && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                                    <Pin className="w-4 h-4 fill-amber-500" />
                                    고정
                                </div>
                            )}
                        </div>

                        {/* 제목 */}
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            {project.title}
                        </h1>

                        {/* 메타 정보 */}
                        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <span className="font-medium">{project.author}</span>
                                <span className="text-sm">({project.authorRole})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{project.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                <span>{project.views} 조회</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span>{project.currentMembers}/{project.teamSize}명</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{project.duration}</span>
                            </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleApply}
                                disabled={project.status === "모집완료"}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${project.status === "모집완료"
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : isApplied
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                    }`}
                            >
                                {isApplied ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        지원완료
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        지원하기
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isLiked
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : 'bg-white/50 text-slate-700 border border-white/30 hover:bg-white/70'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                                {project.likes + (isLiked ? 1 : 0)}
                            </button>
                            <button
                                onClick={handleBookmark}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isBookmarked
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-white/50 text-slate-700 border border-white/30 hover:bg-white/70'
                                    }`}
                            >
                                <Pin className={`w-5 h-5 ${isBookmarked ? 'fill-blue-500' : ''}`} />
                                북마크
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-6 py-3 bg-white/50 text-slate-700 border border-white/30 rounded-xl font-medium hover:bg-white/70 transition-all duration-200"
                            >
                                <Share2 className="w-5 h-5" />
                                공유
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 메인 콘텐츠 */}
                        <div className="lg:col-span-2">
                            <div className="space-y-8">
                                {/* 프로젝트 설명 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">프로젝트 소개</h2>
                                    <p className="text-slate-700 leading-relaxed text-lg">
                                        {project.description}
                                    </p>
                                </div>

                                {/* 상세 내용 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">상세 내용</h2>
                                    <div className="prose prose-slate max-w-none">
                                        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                            {project.content}
                                        </div>
                                    </div>
                                </div>

                                {/* 필요한 기술 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">필요한 기술</h2>
                                    <div className="flex flex-wrap gap-3">
                                        {project.neededSkills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-green-100 text-green-800 rounded-xl font-medium text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* 태그 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">태그</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors duration-200"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 사이드바 */}
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                {/* 팀 정보 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">팀 정보</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">현재 인원</span>
                                            <span className="font-bold text-slate-900">{project.currentMembers}/{project.teamSize}명</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">모집 상태</span>
                                            <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">난이도</span>
                                            <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getDifficultyColor(project.difficulty)}`}>
                                                {project.difficulty}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">기간</span>
                                            <span className="font-bold text-slate-900">{project.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 통계 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">통계</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">조회수</span>
                                            <span className="font-bold text-slate-900">{project.views}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">좋아요</span>
                                            <span className="font-bold text-slate-900">{project.likes}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">댓글</span>
                                            <span className="font-bold text-slate-900">{project.comments}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 작성자 정보 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">작성자</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                            {project.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{project.author}</div>
                                            <div className="text-sm text-slate-500">{project.authorRole}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 일정 정보 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">일정</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">시작: {project.startDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">마감: {project.deadline}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">{project.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
