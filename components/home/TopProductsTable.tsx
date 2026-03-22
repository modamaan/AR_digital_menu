'use client';

import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    image?: string | null;
    inventory: number;
    totalOrders: number;
    totalSales: number;
    todaySales: number;
}

interface TopProductsTableProps {
    products: Product[];
}

export default function TopProductsTable({ products }: TopProductsTableProps) {
    if (products.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sales data yet</h3>
                <p className="text-gray-500">Start selling products to see your top performers here</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[400px]">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Orders
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Inventory
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Sales
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Today
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr
                                key={product.id}
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                                            {product.image ? (
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-900">{product.totalOrders}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm ${product.inventory === 0 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                        {product.inventory}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-gray-900">
                                        ${product.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-gray-900">
                                        ${product.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
                {products.map((product) => (
                    <div key={product.id} className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Orders:</span>
                                <span className="ml-2 text-gray-900 font-medium">{product.totalOrders}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Inventory:</span>
                                <span className={`ml-2 font-medium ${product.inventory === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {product.inventory}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Total Sales:</span>
                                <span className="ml-2 text-gray-900 font-semibold">
                                    ${product.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Today:</span>
                                <span className="ml-2 text-gray-900 font-semibold">
                                    ${product.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
