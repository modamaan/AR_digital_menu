'use client';

import { useState } from 'react';
import Sidebar from '@/components/home/Sidebar';
import Header from '@/components/home/Header';

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative flex h-screen w-full bg-[#E9E7FF] overflow-hidden">
            {/* Sidebar - Handles both desktop (always visible) and mobile (toggle-based) */}
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Header - Full Width Overlapping Sidebar */}
            <div className="absolute top-0 left-0 right-0 z-20">
                <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
                {/* Spacer for header height */}
                <div className="h-[70px] sm:h-[80px] md:h-[90px]"></div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
