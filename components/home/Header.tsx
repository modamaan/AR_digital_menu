'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserStores } from '@/lib/actions/store';

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const [storeSlug, setStoreSlug] = useState<string | null>(null);

    useEffect(() => {
        const fetchStore = async () => {
            const result = await getUserStores();
            if (result.success && result.stores && result.stores.length > 0) {
                setStoreSlug(result.stores[0].slug);
            }
        };
        fetchStore();
    }, []);

    return (
        <header className="relative w-full h-[70px] sm:h-[80px] md:h-[90px] bg-gradient-to-r from-[#5B52FF] to-[#4E44FD] rounded-b-2xl sm:rounded-b-3xl">
            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-center lg:justify-between px-3 sm:px-6 md:px-12 lg:px-16">
                {/* Mobile Menu Button - Only visible on mobile - Positioned absolutely on left */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden absolute left-3 sm:left-4 md:left-6 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo and Brand - Centered on mobile, left on desktop */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <Image
                        src="/logo.png"
                        alt="VisionDine Logo"
                        width={32}
                        height={32}
                        className="rounded-lg w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10"
                    />
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide">VisionDine</span>
                </div>

                {/* Right Side - Store Link and Explore Plans Button */}
                <div className="absolute lg:relative right-3 sm:right-4 md:right-12 lg:right-0 flex items-center gap-2 sm:gap-3">
                    {/* Store Link - Visible on all screens */}
                    {storeSlug && (
                        <Link
                            href={`/${storeSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-xs sm:text-sm md:text-base transition-all whitespace-nowrap backdrop-blur-sm"
                        >
                            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Store</span>
                        </Link>
                    )}

                    {/* Explore Plans Button - Hidden on mobile */}
                    <Link href="/plans" className="hidden sm:block">
                        <button className="px-3 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-2.5 lg:py-3 border-2 border-white text-white rounded-lg font-medium text-xs sm:text-sm md:text-base hover:bg-white hover:text-[#4E44FD] transition-all whitespace-nowrap">
                            Explore plans
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
