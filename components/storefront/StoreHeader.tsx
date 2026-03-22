'use client';

import Link from 'next/link';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';

interface StoreHeaderProps {
    store: {
        name: string;
        slug: string;
        bio?: string | null;
        bannerImage?: string | null;
        profileImage?: string | null;
    };
    onSearch?: (query: string) => void;
    showBanner?: boolean; // New prop to control banner visibility
}

export default function StoreHeader({ store, onSearch, showBanner = false }: StoreHeaderProps) {
    const { itemCount } = useCart();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo/Store Name with Profile Image */}
                        <Link href={`/${store.slug}`} className="flex items-center gap-3">
                            {store.profileImage ? (
                                <img
                                    src={store.profileImage}
                                    alt={store.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {store.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-900">{store.name}</span>
                                {store.bio && (
                                    <span className="text-xs text-gray-500 max-w-xs truncate hidden sm:block">
                                        {store.bio}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Search Bar - Desktop */}
                        {onSearch && (
                            <div className="hidden md:flex flex-1 max-w-md mx-8">
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        onChange={handleSearch}
                                        suppressHydrationWarning
                                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        )}

                        {/* Cart Icon */}
                        <Link
                            href={`/${store.slug}/cart`}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6 text-gray-700" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Search Bar - Mobile */}
                    {onSearch && (
                        <div className="md:hidden pb-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    onChange={handleSearch}
                                    suppressHydrationWarning
                                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Banner Image */}
            {showBanner && store.bannerImage && (
                <div className="w-full h-48 md:h-64 lg:h-80 overflow-hidden bg-gray-100">
                    <img
                        src={store.bannerImage}
                        alt={`${store.name} banner`}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
        </>
    );
}
