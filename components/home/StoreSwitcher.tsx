'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getUserStores } from '@/lib/actions/store';
import { useUser } from '@clerk/nextjs';

interface Store {
    id: string;
    name: string;
    slug: string;
}

// Cache stores outside component to persist across re-renders
let cachedStores: Store[] | null = null;
let cachePromise: Promise<void> | null = null;

export default function StoreSwitcher() {
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [stores, setStores] = useState<Store[]>(cachedStores || []);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(!cachedStores);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        // Skip if already loaded or currently loading
        if (hasLoadedRef.current || cachedStores) {
            if (cachedStores) {
                setStores(cachedStores);
                setLoading(false);
            }
            return;
        }

        // If another instance is already loading, wait for it
        if (cachePromise) {
            cachePromise.then(() => {
                if (cachedStores) {
                    setStores(cachedStores);
                    setLoading(false);
                }
            });
            return;
        }

        hasLoadedRef.current = true;
        loadStores();
    }, []);

    const loadStores = async () => {
        cachePromise = (async () => {
            try {
                const result = await getUserStores();
                if (result.success && result.stores) {
                    cachedStores = result.stores;
                    setStores(result.stores);

                    // Redirect to create page if no stores exist
                    if (result.stores.length === 0) {
                        router.push('/create');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error loading stores:', error);
            } finally {
                setLoading(false);
                cachePromise = null;
            }
        })();

        await cachePromise;
    };

    const handleStoreSwitch = (store: Store) => {
        setIsOpen(false);

        // Create new URLSearchParams with the selected store
        const params = new URLSearchParams(searchParams.toString());
        params.set('store', store.id);

        // Navigate to the same page with the new store parameter
        router.push(`${pathname}?${params.toString()}`);
    };

    const email = user?.primaryEmailAddress?.emailAddress || 'loading...';

    // Derive current store from URL search params
    const currentStoreId = searchParams.get('store');
    const currentStore = currentStoreId
        ? stores.find(s => s.id === currentStoreId) || stores[0]
        : stores[0];

    if (loading) {
        return (
            <div className="h-[88px] animate-pulse bg-gray-100 rounded-2xl mx-2"></div>
        );
    }

    // This should never show now because we redirect in loadStores
    if (stores.length === 0) {
        return null;
    }

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white rounded-2xl p-3 shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-gray-100 hover:shadow-md transition-all text-left flex items-start gap-4"
            >
                {/* Store Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 text-lg font-medium">
                    {currentStore?.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate pr-2">
                            {currentStore?.name}
                        </h3>
                        <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-2"></div>

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-xs text-gray-500 truncate font-medium">
                            {email}
                        </p>
                    </div>
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                            {stores.map((store) => (
                                <button
                                    key={store.id}
                                    onClick={() => handleStoreSwitch(store)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${currentStore?.id === store.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-medium text-gray-600">
                                        {store.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className={`text-sm truncate ${currentStore?.id === store.id ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                            {store.name}
                                        </p>
                                    </div>
                                    {currentStore?.id === store.id && (
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="p-2 border-t border-gray-100 bg-gray-50">
                            <a href="/home/store/new" className="w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors rounded-xl hover:bg-blue-50 block text-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Store
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
