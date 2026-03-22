'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductStatusToggle from '@/components/products/ProductStatusToggle';
import type { Product, ProductImage } from '@/lib/db/schema';

interface ProductsTableProps {
    products: (Product & { images?: ProductImage[] })[];
}

function MobileProductCard({ product }: { product: Product & { images?: ProductImage[] } }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

    return (
        <div className="border-b border-gray-100 last:border-0">
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Collapsed View */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0">
                            {primaryImage ? (
                                <Image
                                    src={primaryImage.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            {product.description && (
                                <p className="text-xs text-gray-500 truncate">{product.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-900">
                            ${parseFloat(product.price).toFixed(2)}
                        </span>
                        <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Expanded View */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Price:</span>
                                <p className="font-medium text-gray-900 mt-1">
                                    ${parseFloat(product.price).toFixed(2)}
                                    {product.discount && parseFloat(product.discount) > 0 && (
                                        <span className="ml-2 text-xs text-green-600">
                                            -{product.discount}%
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Inventory:</span>
                                <p className={`font-medium mt-1 ${product.inventory === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {product.inventory}
                                </p>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <span className="text-gray-500">Status:</span>
                                <div className="mt-1">
                                    <ProductStatusToggle
                                        productId={product.id}
                                        initialStatus={product.status}
                                    />
                                </div>
                            </div>
                        </div>
                        <Link
                            href={`/home/products/${product.id}/edit`}
                            className="block w-full text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Edit Product
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProductsTable({ products }: ProductsTableProps) {
    if (products.length === 0) {
        return (
            <div className="py-16 text-center">
                <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first product</p>
                <Link href="/home/products/new">
                    <button className="px-6 py-2.5 bg-[#4E44FD] text-white rounded-lg font-medium text-sm hover:bg-[#5B52FF] transition-all">
                        Add Product
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-6 py-4 text-left">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Preview</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Product</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Price</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Inventory</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

                            return (
                                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/products/${product.id}/edit`} className="block">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                {primaryImage ? (
                                                    <Image
                                                        src={primaryImage.imageUrl}
                                                        alt={product.name}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/products/${product.id}/edit`} className="block">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                                {product.description && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                                                )}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/products/${product.id}/edit`} className="block">
                                            <span className="text-sm font-medium text-gray-900">
                                                ${parseFloat(product.price).toFixed(2)}
                                            </span>
                                            {product.discount && parseFloat(product.discount) > 0 && (
                                                <span className="ml-2 text-xs text-green-600">
                                                    -{product.discount}%
                                                </span>
                                            )}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <ProductStatusToggle
                                            productId={product.id}
                                            initialStatus={product.status}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/home/products/${product.id}/edit`} className="block">
                                            <span className={`text-sm font-medium ${product.inventory === 0 ? 'text-red-600' : 'text-gray-900'
                                                }`}>
                                                {product.inventory}
                                            </span>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden max-h-[calc(100vh-280px)] overflow-y-auto">
                {products.map((product) => (
                    <MobileProductCard key={product.id} product={product} />
                ))}
            </div>
        </>
    );
}
