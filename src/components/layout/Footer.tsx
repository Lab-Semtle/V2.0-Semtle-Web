"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import {
    Mail, Globe, Phone, ExternalLink, Github, Instagram, Youtube,
    Facebook, Twitter, Linkedin, Twitch,
    BookOpen, Calendar, MapPin, Users, MessageSquare
} from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [representativeAdmin, setRepresentativeAdmin] = useState<{
        name: string;
        email: string;
    } | null>(null);
    const [footerLinks, setFooterLinks] = useState<Array<{
        id: string;
        name: string;
        url: string;
        icon: string;
        color: string;
    }>>([]);

    useEffect(() => {
        const fetchRepresentativeAdmin = async () => {
            try {
                const response = await fetch('/api/admin/representative');
                if (response.ok) {
                    const data = await response.json();
                    setRepresentativeAdmin(data.representativeAdmin);
                }
            } catch (error) {
            }
        };

        const fetchFooterLinks = async () => {
            try {
                const response = await fetch('/api/admin/footer-links');
                if (response.ok) {
                    const data = await response.json();
                    setFooterLinks(data.links || []);
                }
            } catch (error) {
            }
        };

        fetchRepresentativeAdmin();
        fetchFooterLinks();
    }, []);

    // SNS 링크 데이터 (기존 하드코딩된 링크 - 이제 동적으로 관리됨)
    // const SNS_LINKS = [...]; // 제거됨 - 이제 footerLinks 상태로 관리

    return (
        <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                    backgroundSize: '30px 30px'
                }}></div>
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-48 -translate-x-48"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-emerald-500/10 to-teal-500/10 rounded-full translate-y-40 translate-x-40"></div>

            <div className="relative z-10 pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* 로고 및 소개 */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                                    <Image
                                        src="/logo/semtle-logo-bg-square-v2022.png"
                                        alt="SEMTLE Logo"
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">아치셈틀</span>
                                    <p className="text-slate-400 text-sm">Archi Semtle Lab</p>
                                </div>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                                국립한국해양대학교 인공지능공학부 소속 학술연구회로,
                                인공지능과 컴퓨터과학 분야의 연구와 학습을 통해 함께 성장합니다.
                            </p>

                        </div>

                        {/* 빠른 링크 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white">빠른 링크</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/activities" className="group flex items-center text-slate-300 hover:text-white transition-all duration-300 text-sm">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                                    활동게시판
                                </Link>
                                <Link href="/projects" className="group flex items-center text-slate-300 hover:text-white transition-all duration-300 text-sm">
                                    <div className="w-1 h-1 bg-purple-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                                    프로젝트
                                </Link>
                                <Link href="/resources" className="group flex items-center text-slate-300 hover:text-white transition-all duration-300 text-sm">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                                    자료실
                                </Link>
                            </div>
                        </div>

                        {/* 연락처 및 SNS */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white">연락처</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                {representativeAdmin ? (
                                    <>
                                        <div className="flex items-start space-x-3">
                                            <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Mail className="w-3 h-3 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-slate-300 text-sm font-medium">대표 이메일</p>
                                                <p className="text-slate-400 text-xs">{representativeAdmin.email}</p>
                                                <p className="text-slate-500 text-xs">{representativeAdmin.name}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Mail className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium">이메일</p>
                                            <p className="text-slate-400 text-xs">semtle@kmou.ac.kr</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Globe className="w-3 h-3 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-300 text-sm font-medium">위치</p>
                                        <p className="text-slate-400 text-xs">부산광역시 영도구 태종로 727</p>
                                        <p className="text-slate-400 text-xs">국립한국해양대학교 공학1관 308호</p>
                                    </div>
                                </div>
                            </div>

                            {/* SNS 링크 */}
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-3">
                                    {footerLinks.map((link) => {
                                        // 아이콘 매핑 객체
                                        const iconMap: { [key: string]: React.ComponentType<any> } = {
                                            Github,
                                            Instagram,
                                            Youtube,
                                            Mail,
                                            Globe,
                                            Phone,
                                            MessageSquare,
                                            ExternalLink,
                                            Facebook,
                                            Twitter,
                                            Linkedin,
                                            Twitch,
                                            BookOpen,
                                            Calendar,
                                            MapPin,
                                            Users
                                        };

                                        const IconComponent = iconMap[link.icon] || ExternalLink;

                                        return (
                                            <Link
                                                key={link.id}
                                                href={link.url}
                                                aria-label={link.name}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                            >
                                                <IconComponent
                                                    className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors duration-300"
                                                    style={{ color: link.color }}
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 하단 구분선 및 저작권 */}
                    <div className="border-t border-slate-700/50 mt-16 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm text-slate-400">
                                <Link href="/terms" className="hover:text-white transition-colors duration-300 hover:underline">
                                    이용약관
                                </Link>
                                <Link href="/privacy" className="hover:text-white transition-colors duration-300 hover:underline">
                                    개인정보처리방침
                                </Link>
                                <Link href="/contact" className="hover:text-white transition-colors duration-300 hover:underline">
                                    문의하기
                                </Link>
                            </div>
                            <p className="text-slate-400 text-sm">
                                © {currentYear} 아치셈틀. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
