'use client';

import Link from "next/link";
import Image from "next/image";
import { Home, Megaphone, Trophy, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserDropdownShadcn from "./UserDropdownShadcn";

export default function Navigation() {
    const { user } = useAuth();


    return (
        <>
            {/* Desktop Navigation - 투명 배경 스타일 */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 z-50">
                <div className="max-w-7xl mx-auto w-full px-6 relative">
                    {/* Left - Logo */}
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
                            <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm border border-gray-200/50">
                                <Image
                                    src="/logo/semtle-logo-bg-square-v2022.png"
                                    alt="SEMTLE Logo"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold text-gray-900 font-dunggeunmo drop-shadow-lg">아치셈틀</span>
                        </Link>
                    </div>

                    {/* Center - Navigation Links */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-8">
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

                    {/* Right - Auth Buttons or User Menu */}
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                        {user ? (
                            // 로그인된 사용자 - shadcn/ui 드롭다운 사용
                            <UserDropdownShadcn />
                        ) : (
                            // 로그인되지 않은 사용자 - 로그인/회원가입 버튼
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/auth/login"
                                    className="text-gray-700 font-semibold hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
                                >
                                    <span className="relative z-10">회원가입</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Top Logo - 모던 글래스모피즘 스타일 */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                {user ? (
                    <UserDropdownShadcn />
                ) : (
                    <Link
                        href="/auth/login"
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200/50 hover:opacity-80 transition-opacity duration-200"
                    >
                        <Image
                            src="/logo/semtle-logo-bg-square-v2022.png"
                            alt="SEMTLE Logo"
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                        />
                    </Link>
                )}
            </div>


            {/* Mobile Navigation - 투명 배경 스타일 */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-4 z-50">
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
