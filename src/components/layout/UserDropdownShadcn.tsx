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
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { User, Settings, LogOut, ChevronDown, ChevronUp, UserCircle, Cog } from "lucide-react";

export default function UserDropdownShadcn() {
    const { profile, signOut } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleMyPageClick = () => {
        console.log('🖱️ 마이페이지 클릭됨!');
        router.push('/mypage');
    };

    const handleSettingsClick = () => {
        console.log('🖱️ 개인설정 클릭됨!');
        router.push('/settings');
    };

    const handleLogoutClick = async () => {
        console.log('🖱️ 로그아웃 클릭됨!');
        await signOut();
    };

    return (
        <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="group flex items-center space-x-3 px-4 py-2 rounded-2xl hover:bg-gray-50 transition-all duration-200 w-48 focus:outline-none focus:ring-0">
                    {/* 사용자 이름 */}
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 flex-1 text-left truncate">
                        {profile?.nickname || profile?.name || '사용자'}
                    </span>

                    {/* 아바타 */}
                    <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        {/* 온라인 상태 표시 */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>

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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-5 h-5 text-white" />
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
                        <span className="font-semibold text-slate-900">마이페이지</span>
                        <p className="text-xs text-slate-500">프로필 관리</p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <Cog className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-slate-900">개인설정</span>
                        <p className="text-xs text-slate-500">계정 설정</p>
                    </div>
                </DropdownMenuItem>

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
