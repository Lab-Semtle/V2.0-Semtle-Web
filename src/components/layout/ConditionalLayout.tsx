'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    
    // 편집 페이지 경로 패턴
    const isEditPage = 
        pathname?.includes('/activities/write') ||
        pathname?.includes('/activities/edit/') ||
        pathname?.includes('/projects/write') ||
        pathname?.includes('/projects/edit/') ||
        pathname?.includes('/resources/write') ||
        pathname?.includes('/resources/edit/');
    
    return (
        <>
            {!isEditPage && <Navigation />}
            {children}
            {!isEditPage && <Footer />}
        </>
    );
}

