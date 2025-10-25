'use client';

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Rocket, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserDropdownShadcn from "./UserDropdownShadcn";
import { useState, useEffect } from "react";

export default function Navigation() {
    const { user } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);


    return (
        <>
            {/* Desktop Navigation - 배경색 추가 */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 h-12 bg-white/95 backdrop-blur-xl border-b border-gray-100/80 z-50">
                <div className="max-w-7xl mx-auto w-full px-4 lg:px-6 relative">
                    {/* Left - Logo */}
                    <div className="absolute left-4 lg:left-6 top-1/2 transform -translate-y-1/2">
                        <Link href="/" className="flex items-center space-x-2 lg:space-x-3 hover:opacity-80 transition-opacity duration-200">
                            <Image
                                src="/logo/semtle-logo-bg-square-v2022.png"
                                alt="SEMTLE Logo"
                                width={32}
                                height={32}
                                className="w-8 lg:w-10 h-8 lg:h-10 object-contain"
                            />
                            <span className="text-base lg:text-lg font-bold text-gray-900 font-dunggeunmo drop-shadow-lg">아치셈틀</span>
                        </Link>
                    </div>

                    {/* Center - Navigation Links */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-6 lg:space-x-8">
                        <Link
                            href="/activities"
                            className="group relative text-gray-900 font-bold transition-all duration-300 py-2 px-2 lg:px-3 rounded-lg drop-shadow-lg text-sm lg:text-base"
                        >
                            <span className="relative z-10">학회활동</span>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:w-full transition-all duration-300"></div>
                        </Link>
                        <Link
                            href="/projects"
                            className="group relative text-gray-900 font-bold transition-all duration-300 py-2 px-2 lg:px-3 rounded-lg drop-shadow-lg text-sm lg:text-base"
                        >
                            <span className="relative z-10">프로젝트</span>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 group-hover:w-full transition-all duration-300"></div>
                        </Link>
                        <Link
                            href="/resources"
                            className="group relative text-gray-900 font-bold transition-all duration-300 py-2 px-2 lg:px-3 rounded-lg drop-shadow-lg text-sm lg:text-base"
                        >
                            <span className="relative z-10">자료실</span>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                        </Link>
                    </div>

                    {/* Right - Auth Buttons or User Menu */}
                    <div className="absolute right-4 lg:right-6 top-1/2 transform -translate-y-1/2">
                        {!isClient ? (
                            // 서버 사이드 렌더링 시 로딩 상태
                            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : user ? (
                            // 로그인된 사용자 - shadcn/ui 드롭다운 사용
                            <UserDropdownShadcn />
                        ) : (
                            // 로그인되지 않은 사용자 - 로그인/회원가입 버튼
                            <div className="flex items-center space-x-2 lg:space-x-3">
                                <Link
                                    href="/auth/login"
                                    className="text-gray-700 font-semibold hover:text-blue-600 transition-colors duration-200 px-2 lg:px-3 py-2 rounded-lg hover:bg-blue-50 text-sm lg:text-base"
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="group relative px-4 lg:px-6 py-2 lg:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden text-sm lg:text-base"
                                >
                                    <span className="relative z-10">회원가입</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Top Navigation - 모던 앱 스타일 상단 네비게이션 */}
            <nav className="md:hidden fixed top-0 left-0 right-0 h-12 bg-white/98 backdrop-blur-xl border-b border-gray-100/80 flex items-center justify-between px-4 z-50">
                {/* Left - Logo */}
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
                    <Image
                        src="/logo/semtle-logo-bg-square-v2022.png"
                        alt="SEMTLE Logo"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                    />
                </Link>

                {/* Center - Navigation Links */}
                <div className="flex items-center space-x-4">
                    <Link href="/activities" className="flex items-center justify-center p-2.5 rounded-xl hover:bg-blue-50 transition-all duration-200 group min-w-0">
                        <Sparkles className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    </Link>

                    <Link href="/projects" className="flex items-center justify-center p-2.5 rounded-xl hover:bg-green-50 transition-all duration-200 group min-w-0">
                        <Rocket className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                    </Link>

                    <Link href="/resources" className="flex items-center justify-center p-2.5 rounded-xl hover:bg-purple-50 transition-all duration-200 group min-w-0">
                        <BookOpen className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                    </Link>
                </div>

                {/* Right - User Menu */}
                <div className="flex-shrink-0">
                    {!isClient ? (
                        // 서버 사이드 렌더링 시 로딩 상태
                        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                    ) : user ? (
                        <UserDropdownShadcn />
                    ) : (
                        <Link
                            href="/auth/login"
                            className="flex items-center justify-center px-3 py-2 rounded-lg text-gray-700 text-sm font-semibold hover:text-blue-600 transition-colors duration-200"
                        >
                            로그인
                        </Link>
                    )}
                </div>
            </nav>
        </>
    );
}
