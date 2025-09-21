'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Eye, Heart, MessageCircle, Share2, Pin, Tag, Clock, ChevronRight, Download, FileText, File, Archive, Presentation, Palette, Code, FileSpreadsheet, Star } from 'lucide-react';
import Link from 'next/link';

// 임시 데이터 (실제로는 API에서 가져올 데이터)
const mockResource = {
    id: 1,
    title: "React Native 개발 가이드북",
    description: "React Native를 활용한 모바일 앱 개발의 모든 것을 담은 종합 가이드입니다. 초보자부터 고급 개발자까지 활용할 수 있습니다.",
    category: "문서",
    fileType: "PDF",
    fileSize: "15.2 MB",
    downloads: 1247,
    views: 2156,
    likes: 89,
    comments: 23,
    author: "김개발",
    authorRole: "시니어 개발자",
    date: "2024-02-15",
    isPinned: true,
    tags: ["React Native", "모바일앱", "가이드", "개발", "JavaScript", "TypeScript"],
    version: "v2.1",
    language: "한국어",
    content: `# React Native 개발 가이드북 v2.1

## 개요
이 가이드북은 React Native를 사용한 모바일 앱 개발의 모든 것을 다룹니다. 초보자부터 고급 개발자까지 모든 레벨의 개발자가 활용할 수 있도록 구성되었습니다.

## 목차
1. **React Native 기초**
   - React Native란 무엇인가?
   - 개발 환경 설정
   - 첫 번째 앱 만들기

2. **컴포넌트와 네비게이션**
   - 기본 컴포넌트 사용법
   - 네비게이션 구현
   - 상태 관리

3. **스타일링과 레이아웃**
   - StyleSheet 사용법
   - Flexbox 레이아웃
   - 반응형 디자인

4. **API 연동과 데이터 관리**
   - HTTP 요청 처리
   - AsyncStorage 사용법
   - Redux 상태 관리

5. **고급 기능**
   - 네이티브 모듈 연동
   - 푸시 알림 구현
   - 앱 배포

## 주요 특징
- **실무 중심**: 실제 프로젝트에서 사용되는 패턴과 기법
- **코드 예제**: 각 섹션마다 실행 가능한 코드 예제 제공
- **문제 해결**: 자주 발생하는 문제와 해결 방법
- **최신 정보**: React Native 최신 버전 반영

## 대상 독자
- React Native를 처음 배우는 개발자
- 기존 웹 개발자가 모바일 앱 개발을 배우고 싶은 경우
- React Native 개발 경험을 더 깊이 있게 하고 싶은 개발자

## 사용된 기술
- React Native 0.72+
- TypeScript
- React Navigation
- Redux Toolkit
- AsyncStorage
- React Query

## 파일 구성
- **PDF 파일**: 메인 가이드북 (15.2MB)
- **소스 코드**: 각 섹션별 예제 코드
- **이미지**: 스크린샷 및 다이어그램
- **체크리스트**: 학습 진도 확인용

## 업데이트 내역
- **v2.1** (2024-02-15): React Native 0.72 업데이트 반영
- **v2.0** (2024-01-10): TypeScript 지원 추가
- **v1.5** (2023-12-01): React Navigation 6 업데이트
- **v1.0** (2023-10-15): 초기 버전 릴리스

## 다운로드 및 설치
1. 파일을 다운로드합니다
2. PDF 리더로 열어보세요
3. 소스 코드는 별도 폴더에 압축 해제하세요

## 문의사항
- 이메일: guide@archsemtle.com
- GitHub: https://github.com/archsemtle/react-native-guide
- 이슈 리포트: GitHub Issues 활용

많은 관심과 피드백 부탁드립니다!`,
    requirements: [
        "React 기본 지식",
        "JavaScript ES6+ 문법",
        "Node.js 설치",
        "Android Studio 또는 Xcode",
        "Git 사용 경험"
    ],
    changelog: [
        "v2.1: React Native 0.72 업데이트 반영",
        "v2.0: TypeScript 지원 추가",
        "v1.5: React Navigation 6 업데이트",
        "v1.0: 초기 버전 릴리스"
    ]
};

export default function ResourceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [resource, setResource] = useState(mockResource);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleDownload = () => {
        setIsDownloaded(true);
        // 실제 다운로드 로직 구현
        alert('다운로드가 시작됩니다.');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: resource.title,
                text: resource.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 클립보드에 복사되었습니다.');
        }
    };

    const getFileTypeIcon = (fileType: string) => {
        const icons: { [key: string]: any } = {
            "PDF": File,
            "ZIP": Archive,
            "PPTX": Presentation,
            "Figma": Palette,
            "Unity Package": Code,
            "XLSX": FileSpreadsheet,
            "기타": FileText
        };
        return icons[fileType] || FileText;
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            "문서": "bg-blue-100 text-blue-800 border-blue-200",
            "코드": "bg-green-100 text-green-800 border-green-200",
            "디자인": "bg-purple-100 text-purple-800 border-purple-200",
            "프레젠테이션": "bg-orange-100 text-orange-800 border-orange-200",
            "에셋": "bg-pink-100 text-pink-800 border-pink-200",
            "템플릿": "bg-indigo-100 text-indigo-800 border-indigo-200",
            "기타": "bg-gray-100 text-gray-800 border-gray-200"
        };
        return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getFileTypeColor = (fileType: string) => {
        const colors: { [key: string]: string } = {
            "PDF": "bg-red-100 text-red-800 border-red-200",
            "ZIP": "bg-yellow-100 text-yellow-800 border-yellow-200",
            "PPTX": "bg-orange-100 text-orange-800 border-orange-200",
            "Figma": "bg-purple-100 text-purple-800 border-purple-200",
            "Unity Package": "bg-blue-100 text-blue-800 border-blue-200",
            "XLSX": "bg-green-100 text-green-800 border-green-200",
            "기타": "bg-gray-100 text-gray-800 border-gray-200"
        };
        return colors[fileType] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const FileTypeIcon = getFileTypeIcon(resource.fileType);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50">
                {/* 배경 패턴 */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-fuchsia-500/10"></div>

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

                        {/* 카테고리 및 파일 타입 */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`px-4 py-2 rounded-xl font-bold text-sm border ${getCategoryColor(resource.category)}`}>
                                {resource.category}
                            </div>
                            <div className={`px-4 py-2 rounded-xl font-bold text-sm border ${getFileTypeColor(resource.fileType)}`}>
                                <div className="flex items-center gap-2">
                                    <FileTypeIcon className="w-4 h-4" />
                                    {resource.fileType}
                                </div>
                            </div>
                            <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                                {resource.version}
                            </div>
                            {resource.isPinned && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                                    <Pin className="w-4 h-4 fill-amber-500" />
                                    고정
                                </div>
                            )}
                        </div>

                        {/* 제목 */}
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            {resource.title}
                        </h1>

                        {/* 메타 정보 */}
                        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <span className="font-medium">{resource.author}</span>
                                <span className="text-sm">({resource.authorRole})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{resource.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                <span>{resource.views} 조회</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                <span>{resource.downloads} 다운로드</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                <span>{resource.fileSize}</span>
                            </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-violet-600 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <Download className="w-5 h-5" />
                                다운로드
                            </button>
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isLiked
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : 'bg-white/50 text-slate-700 border border-white/30 hover:bg-white/70'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                                {resource.likes + (isLiked ? 1 : 0)}
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
                                {/* 자료 설명 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">자료 소개</h2>
                                    <p className="text-slate-700 leading-relaxed text-lg">
                                        {resource.description}
                                    </p>
                                </div>

                                {/* 상세 내용 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">상세 내용</h2>
                                    <div className="prose prose-slate max-w-none">
                                        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                            {resource.content}
                                        </div>
                                    </div>
                                </div>

                                {/* 태그 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">태그</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags.map((tag, index) => (
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
                                {/* 파일 정보 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">파일 정보</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">파일 형식</span>
                                            <span className="font-bold text-slate-900">{resource.fileType}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">파일 크기</span>
                                            <span className="font-bold text-slate-900">{resource.fileSize}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">버전</span>
                                            <span className="font-bold text-slate-900">{resource.version}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">언어</span>
                                            <span className="font-bold text-slate-900">{resource.language}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 통계 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">통계</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">조회수</span>
                                            <span className="font-bold text-slate-900">{resource.views}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">다운로드</span>
                                            <span className="font-bold text-slate-900">{resource.downloads}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">좋아요</span>
                                            <span className="font-bold text-slate-900">{resource.likes}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">댓글</span>
                                            <span className="font-bold text-slate-900">{resource.comments}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 작성자 정보 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">작성자</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                            {resource.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{resource.author}</div>
                                            <div className="text-sm text-slate-500">{resource.authorRole}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 업데이트 내역 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">업데이트 내역</h3>
                                    <div className="space-y-2">
                                        {resource.changelog.map((item, index) => (
                                            <div key={index} className="text-sm text-slate-600">
                                                • {item}
                                            </div>
                                        ))}
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
