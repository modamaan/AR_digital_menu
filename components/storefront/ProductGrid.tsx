'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';

interface ProductGridProps {
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
    store: {
        slug: string;
        currency: string;
    };
}

export default function ProductGrid({ products, store }: ProductGridProps) {
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

    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500">Check back soon for new products!</p>
            </div>
        );
    }

    return (
        <div>
          

            {filteredProducts.length === 0 ? (
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            storeSlug={store.slug}
                            currency={store.currency}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Export setSearchQuery for parent component
export function useProductSearch() {
    return useState('');
}
