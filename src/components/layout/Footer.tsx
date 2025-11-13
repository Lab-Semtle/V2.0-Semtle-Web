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
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

                const response = await fetch('/api/admin/representative', {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    setRepresentativeAdmin(data.representative);
                }
            } catch {
                // API 호출 실패 시 기본값 유지
            }
        };

        const fetchFooterLinks = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

                const response = await fetch('/api/admin/footer-links', {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    setFooterLinks(data.links || []);
                }
            } catch {
                // API 호출 실패 시 기본값 유지
            }
        };

        // 비동기로 호출하되 에러가 발생해도 페이지 로딩을 방해하지 않음
        fetchRepresentativeAdmin().catch(() => { });
        fetchFooterLinks().catch(() => { });
    }, []);

    // SNS 링크 데이터 (기존 하드코딩된 링크 - 이제 동적으로 관리됨)
    // const SNS_LINKS = [...]; // 제거됨 - 이제 footerLinks 상태로 관리

    return (
        <footer className="bg-slate-50 border-t border-slate-200">
            <div className="pt-12 md:pt-16 pb-8 md:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 메인 콘텐츠 */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-12 lg:gap-16">
                        {/* 로고 및 소개 */}
                        <div className="flex-1 md:max-w-md">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:flex-col md:items-start md:gap-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <Image
                                            src="/logo/semtle-logo-bg-square-v2022.png"
                                            alt="SEMTLE Logo"
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xl font-bold text-slate-900 block">아치셈틀</span>
                                        <p className="text-slate-500 text-sm">Archi Semtle Lab</p>
                                    </div>
                                </div>
                                {/* SNS 링크 */}
                                {footerLinks.length > 0 && (
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        {footerLinks.map((link) => {
                                            const iconMap: { [key: string]: React.ComponentType } = {
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

                                            const IconComponent = (iconMap[link.icon] || ExternalLink) as React.ComponentType<{ className?: string }>;

                                            return (
                                                <Link
                                                    key={link.id}
                                                    href={link.url}
                                                    aria-label={link.name}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
                                                >
                                                    <IconComponent className="h-5 w-5" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 연락처 */}
                        <div className="flex-1 md:max-w-sm">
                            <h3 className="text-base font-semibold text-slate-900 mb-4 md:mb-5">연락처</h3>
                            <div className="space-y-4">
                                {representativeAdmin ? (
                                    <div>
                                        <p className="text-slate-600 text-sm font-medium mb-1.5">아치셈틀 회장</p>
                                        <p className="text-slate-500 text-sm leading-relaxed">{representativeAdmin.email}</p>
                                        <p className="text-slate-500 text-sm">{representativeAdmin.name}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-slate-600 text-sm font-medium mb-1.5">이메일</p>
                                        <p className="text-slate-500 text-sm leading-relaxed">semtle@kmou.ac.kr</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-slate-600 text-sm font-medium mb-1.5">위치</p>
                                    <p className="text-slate-500 text-sm leading-relaxed">부산광역시 영도구 태종로 727</p>
                                    <p className="text-slate-500 text-sm leading-relaxed">국립한국해양대학교 공학1관 308호</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 하단 구분선 및 저작권 */}
                    <div className="border-t border-slate-200 mt-10 md:mt-12 pt-6 md:pt-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
                            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-slate-600">
                                <Link href="/terms" className="hover:text-slate-900 transition-colors">
                                    이용약관
                                </Link>
                                <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                                    개인정보처리방침
                                </Link>
                                <Link href="/contact" className="hover:text-slate-900 transition-colors">
                                    문의하기
                                </Link>
                            </div>
                            <p className="text-slate-500 text-sm text-center sm:text-right">
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
