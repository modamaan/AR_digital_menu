'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Store, CreditCard, Shield, LogOut, Wallet } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { useState } from 'react';

const settingsMenuItems = [
    {
        name: 'Store',
        href: '/home/settings/store',
        icon: Store,
    },
    {
        name: 'Payment',
        href: '/home/settings/payment',
        icon: Wallet,
    },
    {
        name: 'Billing & Plans',
        href: '/home/settings/billing',
        icon: CreditCard,
    },
    {
        name: 'Privacy & Policy',
        href: '/home/settings/privacy',
        icon: Shield,
    },
];

export default function SettingsSidebar() {
    const pathname = usePathname();
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

    return (
        <aside className="hidden lg:flex w-60 bg-[#E8E7FA] h-full flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-300/30">
                <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className="font-semibold text-sm">Settings</h2>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-3">
                <ul className="space-y-1">
                    {settingsMenuItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        const Icon = item.icon;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-[#4E44FD] text-white font-medium shadow-md'
                                        : 'text-gray-700 hover:bg-white/50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-3 border-t border-gray-300/30">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
            </div>
        </aside>
    );
}
