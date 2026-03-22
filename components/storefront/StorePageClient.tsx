'use client';

import { useState } from 'react';
import StoreHeader from '@/components/storefront/StoreHeader';
import ProductGrid from '@/components/storefront/ProductGrid';

interface StorePageClientProps {
    store: {
        id: string;
        name: string;
        slug: string;
        currency: string;
        bio: string | null;
        bannerImage: string | null;
        profileImage: string | null;
    };
    products: Array<{
        id: string;
        name: string;
        price: string;
        description?: string | null;
        images: Array<{
            imageUrl: string;
            isPrimary: boolean;
        }>;
    }>;
}

export default function StorePageClient({ store, products }: StorePageClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter products based on search query
    const filteredProducts = products.filter((product) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
    });

    return (
        <div className="min-h-screen bg-white">
            <StoreHeader store={store} onSearch={setSearchQuery} showBanner={true} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
                    <p className="text-gray-600 mt-1">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                        {searchQuery && ` found for "${searchQuery}"`}
                    </p>
                </div>

                {filteredProducts.length === 0 && searchQuery ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">Try searching with different keywords</p>
                    </div>
                ) : (
                    <ProductGrid products={filteredProducts} store={store} />
                )}
            </main>
        </div>
    );
}
