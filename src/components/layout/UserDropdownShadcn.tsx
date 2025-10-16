'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, ChevronDown, ChevronUp, UserCircle, Cog, Shield, FileText, Users } from "lucide-react";
import Image from "next/image";

export default function UserDropdownShadcn() {
    const { profile, signOut } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleMyPageClick = () => {
        router.push(`/profile/${profile?.nickname}`);
    };

    const handleSettingsClick = () => {
        router.push('/settings');
    };

    const handleAdminDashboardClick = () => {
        router.push('/admin');
    };

    const handleMyApplicationsClick = () => {
        router.push('/my-applications');
    };

    const handleProjectApplicationsClick = () => {
        router.push('/my-projects/applications');
    };

    const handleLogoutClick = async () => {
        await signOut();
    };

    return (
        <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="group flex items-center space-x-3 px-4 py-2 rounded-2xl hover:bg-gray-50 transition-all duration-200 w-48 focus:outline-none focus:ring-0">
                    {/* 아바타 */}
                    <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                            {profile?.profile_image ? (
                                <Image
                                    src={profile.profile_image}
                                    alt={profile.nickname || profile.name || '사용자'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-sm font-semibold">
                                    {(profile?.nickname || profile?.name || '사용자').charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 사용자 이름 */}
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 flex-1 text-left truncate">
                        {profile?.nickname || profile?.name || '사용자'}
                    </span>

                    {/* 드롭다운 토글 아이콘 - 상태 기반 제어 */}
                    <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center relative">
                        {!isOpen ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 transition-all duration-200" />
                        ) : (
                            <ChevronUp className="w-4 h-4 text-gray-400 transition-all duration-200" />
                        )}
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-64 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2"
                align="end"
                sideOffset={8}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <DropdownMenuLabel className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                            {profile?.profile_image ? (
                                <Image
                                    src={profile.profile_image}
                                    alt={profile.nickname || profile.name || '사용자'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-lg font-semibold">
                                    {(profile?.nickname || profile?.name || '사용자').charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-bold text-slate-900 leading-none">
                                {profile?.name || '사용자'}
                            </p>
                            <p className="text-xs text-slate-500 leading-none">
                                {profile?.email}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-slate-200/50" />

                <DropdownMenuItem onClick={handleMyPageClick} className="cursor-pointer px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <UserCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-slate-900">내 프로필</span>
                        <p className="text-xs text-slate-500">프로필 관리</p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <Cog className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-slate-900">계정 설정</span>
                        <p className="text-xs text-slate-500">개인 정보 관리</p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleMyApplicationsClick} className="cursor-pointer px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-slate-900">신청한 프로젝트 현황</span>
                        <p className="text-xs text-slate-500">내가 신청한 프로젝트 관리</p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleProjectApplicationsClick} className="cursor-pointer px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 group">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-slate-900">내 프로젝트 관리</span>
                        <p className="text-xs text-slate-500">내 프로젝트 신청자 관리</p>
                    </div>
                </DropdownMenuItem>

                {/* 관리자 대시보드 메뉴 (관리자만 표시) */}
                {profile && (profile.role === 'admin' || profile.role === 'super_admin') && (
                    <DropdownMenuItem onClick={handleAdminDashboardClick}
                        className="cursor-pointer px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 group">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                            <Shield className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <span className="font-semibold text-slate-900">아치셈틀 공홈관리</span>
                            <p className="text-xs text-slate-500">관리자 전용 기능</p>
                        </div>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-slate-200/50" />

                <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-red-600">로그아웃</span>
                        <p className="text-xs text-slate-500">계정에서 로그아웃</p>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
