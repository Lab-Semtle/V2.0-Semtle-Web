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
import { ChevronDown, ChevronUp, User, Settings, FolderOpen, UserCheck, Crown, Power } from "lucide-react";
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
                <button className="group flex items-center space-x-1 md:space-x-2 lg:space-x-2 px-2 md:px-3 lg:px-3 py-1.5 md:py-1.5 lg:py-1.5 rounded-lg md:rounded-xl lg:rounded-xl bg-white/90 backdrop-blur-sm transition-all duration-200 w-auto md:w-40 lg:w-44 focus:outline-none focus:ring-0">
                    {/* 아바타 */}
                    <div className="relative flex-shrink-0">
                        <div className="w-6 md:w-7 lg:w-7 h-6 md:h-7 lg:h-7 bg-slate-200 rounded-full flex items-center justify-center shadow-sm overflow-hidden relative">
                            {profile?.profile_image ? (
                                <Image
                                    src={profile.profile_image}
                                    alt={profile.nickname || profile.name || '사용자'}
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-slate-600 text-xs md:text-sm font-semibold">
                                    {(profile?.nickname || profile?.name || '사용자').charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 사용자 이름 - 태블릿부터 표시 */}
                    <span className="hidden md:block text-xs lg:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 flex-1 text-left truncate">
                        {profile?.nickname || profile?.name || '사용자'}
                    </span>

                    {/* 드롭다운 토글 아이콘 - 상태 기반 제어 */}
                    <div className="flex-shrink-0 w-3 h-3 md:w-3 md:h-3 lg:w-4 lg:h-4 flex items-center justify-center relative">
                        {!isOpen ? (
                            <ChevronDown className="w-3 h-3 md:w-3 md:h-3 lg:w-4 lg:h-4 text-gray-500 group-hover:text-blue-600 transition-all duration-200" />
                        ) : (
                            <ChevronUp className="w-3 h-3 md:w-3 md:h-3 lg:w-4 lg:h-4 text-gray-500 group-hover:text-blue-600 transition-all duration-200" />
                        )}
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-72 md:w-60 lg:w-64 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2"
                align="end"
                sideOffset={8}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <DropdownMenuLabel className="px-3 md:px-3 lg:px-4 py-2">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 md:w-9 lg:w-10 h-8 md:h-9 lg:h-10 bg-slate-200 rounded-full flex items-center justify-center shadow-lg overflow-hidden relative">
                            {profile?.profile_image ? (
                                <Image
                                    src={profile.profile_image}
                                    alt={profile.nickname || profile.name || '사용자'}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-slate-600 text-sm md:text-sm lg:text-lg font-semibold">
                                    {(profile?.nickname || profile?.name || '사용자').charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col space-y-1">
                            <p className="text-xs font-bold text-slate-900 leading-none">
                                {profile?.name || '사용자'}
                            </p>
                            <p className="text-xs text-slate-500 leading-none">
                                {profile?.email}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-slate-200/50" />

                <DropdownMenuItem onClick={handleMyPageClick} className="cursor-pointer px-3 md:px-3 lg:px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                    <div className="w-7 md:w-7 lg:w-8 h-7 md:h-7 lg:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <User className="h-3 md:h-3 lg:h-4 w-3 md:w-3 lg:w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-slate-900 text-xs">내 프로필</span>
                        <p className="text-xs text-slate-500">프로필 관리</p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer px-3 md:px-3 lg:px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group">
                    <div className="w-7 md:w-7 lg:w-8 h-7 md:h-7 lg:h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <Settings className="h-3 md:h-3 lg:h-4 w-3 md:w-3 lg:w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-slate-900 text-xs">계정 설정</span>
                        <p className="text-xs text-slate-500">개인 정보 관리</p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleMyApplicationsClick} className="cursor-pointer px-3 md:px-3 lg:px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group">
                    <div className="w-7 md:w-7 lg:w-8 h-7 md:h-7 lg:h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <FolderOpen className="h-3 md:h-3 lg:h-4 w-3 md:w-3 lg:w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-slate-900 text-xs">신청한 프로젝트 현황</span>
                        <p className="text-xs text-slate-500">내가 신청한 프로젝트 관리</p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleProjectApplicationsClick} className="cursor-pointer px-3 md:px-3 lg:px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 group">
                    <div className="w-7 md:w-7 lg:w-8 h-7 md:h-7 lg:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <UserCheck className="h-3 md:h-3 lg:h-4 w-3 md:w-3 lg:w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-slate-900 text-xs">내 프로젝트 관리</span>
                        <p className="text-xs text-slate-500">내 프로젝트 신청자 관리</p>
                    </div>
                </DropdownMenuItem>

                {/* 관리자 대시보드 메뉴 (관리자만 표시) */}
                {profile && (profile.role === 'admin' || profile.role === 'super_admin') && (
                    <DropdownMenuItem onClick={handleAdminDashboardClick}
                        className="cursor-pointer px-3 md:px-3 lg:px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 group">
                        <div className="w-7 md:w-7 lg:w-8 h-7 md:h-7 lg:h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                            <Crown className="h-3 md:h-3 lg:h-4 w-3 md:w-3 lg:w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <span className="font-semibold text-slate-900 text-xs">아치셈틀 공홈관리</span>
                            <p className="text-xs text-slate-500">관리자 전용 기능</p>
                        </div>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-slate-200/50" />

                <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer px-3 md:px-3 lg:px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group">
                    <div className="w-7 md:w-7 lg:w-8 h-7 md:h-7 lg:h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <Power className="h-3 md:h-3 lg:h-4 w-3 md:w-3 lg:w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-red-600 text-xs">로그아웃</span>
                        <p className="text-xs text-slate-500">계정에서 로그아웃</p>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
