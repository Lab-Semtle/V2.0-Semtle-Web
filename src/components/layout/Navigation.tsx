'use client';

import Link from "next/link";
import Image from "next/image";
import { Home, Megaphone, Trophy, FileText } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            {/* Desktop Navigation - 상단 투명 스타일 */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 z-50">
                <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
                    {/* Left - Logo */}
                    <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                            <Image
                                src="/logo/semtle-logo-bg-circle-v2022.png"
                                alt="SEMTLE Logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold text-gray-900 font-dunggeunmo drop-shadow-lg">아치셈틀</span>
                    </Link>

                    {/* Center - Navigation Links */}
                    <div className="flex items-center space-x-8">
                        <Link
                            href="/activities"
                            className="group relative text-gray-900 font-bold transition-all duration-300 py-2 px-3 rounded-lg drop-shadow-lg"
                        >
                            <span className="relative z-10">학회활동</span>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                        </Link>
                        <Link
                            href="/projects"
                            className="group relative text-gray-900 font-bold transition-all duration-300 py-2 px-3 rounded-lg drop-shadow-lg"
                        >
                            <span className="relative z-10">프로젝트</span>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                        </Link>
                        <Link
                            href="/resources"
                            className="group relative text-gray-900 font-bold transition-all duration-300 py-2 px-3 rounded-lg drop-shadow-lg"
                        >
                            <span className="relative z-10">자료실</span>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                        </Link>
                    </div>

                    {/* Right - Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/auth/login"
                            className="text-gray-900 font-bold transition-colors duration-200 drop-shadow-lg"
                        >
                            로그인
                        </Link>
                        <Link
                            href="/auth/register"
                            className="group relative px-6 py-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-full hover:from-slate-800 hover:to-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
                        >
                            <span className="relative z-10">회원가입</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Top Logo - 상단 우측 원형 로고 */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <Link
                    href="/auth/login"
                    className="group flex items-center justify-center w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 border border-slate-200/40 hover:border-slate-300/60"
                >
                    <Image
                        src="/logo/semtle-logo-bg-circle-v2022.png"
                        alt="SEMTLE Logo"
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                </Link>
            </div>

            {/* Mobile Navigation - 유리 효과 스타일 */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md flex items-center justify-around px-4 z-50 border-t border-slate-200/50">
                <Link href="/" className="p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 group">
                    <Home className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                </Link>

                <Link href="/activities" className="p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 group">
                    <Megaphone className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                </Link>

                <Link href="/projects" className="p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 group">
                    <Trophy className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                </Link>

                <Link href="/resources" className="p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 group">
                    <FileText className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                </Link>

            </nav>
        </>
    );
}
