'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import UserDropdownShadcn from "./UserDropdownShadcn";
import { useState, useEffect } from "react";
import { AnimatedTabs } from "./AnimatedTabs";
import { motion } from "framer-motion";

export default function Navigation() {
    const { user } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const tabs = [
        { label: "학회활동", value: "activities", href: "/activities" },
        { label: "프로젝트", value: "projects", href: "/projects" },
        { label: "자료실", value: "resources", href: "/resources" },
    ];

    return (
        <>
            {/* Desktop & Mobile Navigation - Animated Header 스타일 */}
            <header className="w-full bg-background relative">
                {/* Header content row - animated-header와 동일한 구조 */}
                <div className="flex items-center px-4 md:px-6 font-mono pt-2 md:pt-3 pb-1 md:pb-1.5 gap-3 md:gap-4">
                    {/* Logo */}
                    <motion.div 
                        className="flex-shrink-0"
                        animate={{
                            scale: Math.max(0.9, 1 - (scrollY * 0.003))
                        }}
                        transition={{
                            duration: 0.1,
                            ease: "linear"
                        }}
                    >
                        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
                            <Image
                                src="/logo/semtle-logo-bg-v2022.png"
                                alt="SEMTLE Logo"
                                width={40}
                                height={40}
                                className="w-8 h-8 md:w-10 md:h-10 object-contain"
                                priority
                                quality={100}
                                unoptimized={false}
                            />
                        </Link>
                    </motion.div>
                    
                    {/* Text content */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-medium text-muted-foreground">/</span>
                        <span className="text-sm md:text-base font-medium font-dunggeunmo text-foreground">한국해양대학교 인공지능공학부 아치셈틀</span>
                    </div>
                </div>
            </header>

            {/* Sticky Navigation with animated tabs */}
            <div className="sticky top-0 bg-background overflow-x-hidden border-b border-border z-40">
                <div className="flex items-center justify-between px-2 md:px-4">
                    {/* Center - Animated Tabs */}
                    <div className="flex-1 flex justify-center">
                        <AnimatedTabs tabs={tabs} />
                    </div>

                    {/* Right - Profile/Login Button */}
                    <div className="flex items-center justify-end gap-1 md:gap-2 pr-1 md:pr-2 flex-shrink-0 absolute right-2 md:right-4">
                        {!isClient ? (
                            <div className="w-16 md:w-20 h-7 md:h-8 bg-muted rounded animate-pulse"></div>
                        ) : user ? (
                            <UserDropdownShadcn />
                        ) : (
                            <div className="flex items-center space-x-1 md:space-x-2">
                                <Link
                                    href="/auth/login"
                                    className="text-xs md:text-sm font-medium text-foreground hover:text-foreground/80 transition-colors duration-200 px-2 md:px-3 py-1 md:py-1.5 rounded-md hover:bg-secondary"
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="text-xs md:text-sm font-medium text-foreground hover:text-foreground/80 transition-colors duration-200 px-2 md:px-3 py-1 md:py-1.5 rounded-md hover:bg-secondary"
                                >
                                    회원가입
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </>
    );
}
