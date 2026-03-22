'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, Suspense } from 'react';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import UserProfile from './UserProfile';
import PlanCard from './PlanCard';
import StoreSwitcher from './StoreSwitcher';
import { useClerk } from '@clerk/nextjs';

const menuItems = [
    {
        name: 'Overview',
        href: '/home',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        name: 'Products',
        href: '/home/products',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
    },
    {
        name: 'Categories',
        href: '/home/categories',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
    },
    {
        name: 'Tables',
        href: '/home/tables',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
        ),
    },
    {
        name: 'Orders',
        href: '/home/orders',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
    },
    {
        name: 'Settings',
        href: '/home/settings',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        subItems: [
            {
                name: 'Store',
                href: '/home/settings/store',
            },
            {
                name: 'Payment',
                href: '/home/settings/payment',
            },
            {
                name: 'Billing & Plans',
                href: '/home/settings/billing',
            },
            {
                name: 'Privacy & Policy',
                href: '/home/settings/privacy',
            },
        ],
    },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [settingsOpen, setSettingsOpen] = useState(pathname?.startsWith('/home/settings') || false);
    const { signOut } = useClerk();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await signOut();
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoggingOut(false);
        }
    };

    const SidebarContent = () => (
        <>
            {/* Store Switcher Section */}
            <div className="p-4 border-b border-gray-200/50">
                <Suspense fallback={<div className="h-[88px] animate-pulse bg-gray-100 rounded-2xl"></div>}>
                    <StoreSwitcher />
                </Suspense>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isSettingsActive = pathname?.startsWith('/home/settings');
                        const hasSubItems = item.subItems && item.subItems.length > 0;

                        return (
                            <li key={item.name}>
                                {hasSubItems ? (
                                    <>
                                        {/* Settings - Regular link on desktop, dropdown on mobile */}
                                        <div className="relative">
                                            {/* Desktop: Regular link without dropdown */}
                                            <Link
                                                href={item.href}
                                                className={`hidden lg:flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isSettingsActive
                                                    ? 'bg-white text-gray-900 font-semibold shadow-sm'
                                                    : 'text-gray-700 hover:bg-white/50'
                                                    }`}
                                            >
                                                {item.icon}
                                                <span className="text-sm">{item.name}</span>
                                            </Link>

                                            {/* Mobile: Dropdown button */}
                                            <button
                                                onClick={() => setSettingsOpen(!settingsOpen)}
                                                className={`lg:hidden w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-all ${isSettingsActive
                                                    ? 'bg-white text-gray-900 font-semibold shadow-sm'
                                                    : 'text-gray-700 hover:bg-white/50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon}
                                                    <span className="text-sm">{item.name}</span>
                                                </div>
                                                {settingsOpen ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Sub-items - Only on mobile */}
                                        {settingsOpen && (
                                            <ul className="lg:hidden mt-1 ml-8 space-y-1">
                                                {item.subItems.map((subItem) => {
                                                    const isSubActive = pathname === subItem.href;
                                                    return (
                                                        <li key={subItem.name}>
                                                            <Link
                                                                href={subItem.href}
                                                                onClick={onClose}
                                                                className={`block px-3 py-2 rounded-lg text-sm transition-all ${isSubActive
                                                                    ? 'bg-[#4E44FD] text-white font-medium'
                                                                    : 'text-gray-600 hover:bg-white/50'
                                                                    }`}
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                                {/* Logout Button */}
                                                <li>
                                                    <button
                                                        onClick={handleLogout}
                                                        disabled={isLoggingOut}
                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    /* Regular menu items */
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-white text-gray-900 font-semibold shadow-sm'
                                            : 'text-gray-700 hover:bg-white/50'
                                            }`}
                                    >
                                        {item.icon}
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Plan Card at Bottom */}
            <div className="mt-auto">
                <PlanCard />
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar - Always visible on lg+ screens */}
            <aside className="hidden lg:flex w-60 h-full bg-[#D4D2F5] flex-col pt-[100px]">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer - Only visible when isOpen is true */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <aside className="fixed top-0 left-0 h-full w-60 bg-[#D4D2F5] z-50 flex flex-col shadow-xl lg:hidden transform transition-transform duration-300 ease-in-out">
                        {/* Back Button */}
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors text-gray-700"
                                aria-label="Close sidebar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>

                        <SidebarContent />
                    </aside>
                </>
            )}
        </>
    );
}
