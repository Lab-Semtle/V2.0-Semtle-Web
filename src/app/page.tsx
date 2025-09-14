'use client';

import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "../components/Footer";
import { Megaphone, Trophy, FileText, User, ArrowRight, Calendar, Users, Code, BookOpen, Clock, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

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
            <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-200 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Megaphone className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">공지사항</span>
                      <p className="text-xs text-slate-500 mt-1">2024.01.15</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                  2024년 1학기 정기모임 안내
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  매주 화요일 오후 7시, 공학관 101호에서 정기모임을 진행합니다.
                  AI 기술 트렌드와 프로젝트 발표가 예정되어 있습니다.
                </p>
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                  자세히 보기
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-purple-200 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">프로젝트</span>
                      <p className="text-xs text-slate-500 mt-1">2024.01.12</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors duration-300 leading-tight">
                  AI 웹 서비스 프로젝트 팀 모집
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  React, Node.js, TensorFlow를 활용한 AI 기반 웹 서비스 개발 프로젝트입니다.
                  프론트엔드, 백엔드, AI 개발자 모집 중입니다.
                </p>
                <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:text-purple-700">
                  자세히 보기
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-emerald-200 hover:-translate-y-2 overflow-hidden md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">자료실</span>
                      <p className="text-xs text-slate-500 mt-1">2024.01.10</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300 leading-tight">
                  머신러닝 기초 자료 업로드
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  선형대수, 통계학, 딥러닝 기초 개념 정리 자료와 실습 코드가
                  자료실에 업로드되었습니다.
                </p>
                <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:text-emerald-700">
                  자세히 보기
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
}


