'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';

interface OrderItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        images: Array<{ imageUrl: string; isPrimary: boolean }>;
    };
}

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    totalAmount: string;
    status: string;
    paymentMethod: string | null;
    paymentStatus: string | null;
    createdAt: Date;
    tableNumber?: string | null;
    orderItems: OrderItem[];
}

interface OrdersTableProps {
    orders: Order[];
}

function MobileOrderCard({ order }: { order: Order }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const firstItem = order.orderItems[0];
    const firstImage = firstItem?.product?.images?.find(img => img.isPrimary)?.imageUrl
        || firstItem?.product?.images?.[0]?.imageUrl;

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
                            {firstImage ? (
                                <Image
                                    src={firstImage}
                                    alt={firstItem?.product?.name || 'Product'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                                {order.tableNumber && ` • Table ${order.tableNumber}`}
                            </p>
                            <p className="text-xs text-gray-500">
                                {format(new Date(order.createdAt), 'dd MMM, h:mm a')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-900">
                            ${parseFloat(order.totalAmount).toLocaleString()}
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
                                <span className="text-gray-500">Order ID:</span>
                                <p className="font-medium text-gray-900 mt-1">#{order.id.slice(0, 8)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Items:</span>
                                <p className="font-medium text-gray-900 mt-1">{totalItems}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Customer:</span>
                                <p className="font-medium text-gray-900 mt-1">{order.customerName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{order.customerEmail}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <div className="mt-1">
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500">Payment:</span>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {order.paymentStatus === 'paid' ? '✓ Paid' : '○ Pending'}
                                    </span>
                                    {order.paymentMethod && (
                                        <p className="text-xs text-gray-500 uppercase mt-1">{order.paymentMethod}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Link
                            href={`/home/orders/${order.id}`}
                            className="block w-full text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            View Details
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OrdersTable({ orders }: OrdersTableProps) {
    if (orders.length === 0) {
        return (
            <div className="py-16 text-center bg-white rounded-3xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">There are no orders with this status yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]">
                <table className="w-full">
                    <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200">
                            <th className="px-6 py-4 text-left w-10 bg-white">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 bg-white">Order ID</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 bg-white">Date</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 bg-white">Items</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 bg-white">Customer</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 bg-white">Table</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 bg-white">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 bg-white">Payment</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-600 bg-white">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
                            const firstItem = order.orderItems[0];
                            const firstImage = firstItem?.product?.images?.find(img => img.isPrimary)?.imageUrl
                                || firstItem?.product?.images?.[0]?.imageUrl;

                            return (
                                <tr
                                    key={order.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/orders/${order.id}`} className="block">
                                            <span className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/orders/${order.id}`} className="block">
                                            <span className="text-sm text-gray-600 whitespace-nowrap">
                                                {format(new Date(order.createdAt), 'dd MMM')} at {format(new Date(order.createdAt), 'h:mm a')}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/orders/${order.id}`} className="block flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-gray-100 relative overflow-hidden flex-shrink-0">
                                                {firstImage ? (
                                                    <Image
                                                        src={firstImage}
                                                        alt={firstItem?.product?.name || 'Product'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-900 font-medium">
                                                {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''} ({totalItems} qty)
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/orders/${order.id}`} className="block">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{order.customerName}</span>
                                                <span className="text-xs text-gray-500">{order.customerEmail}</span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/orders/${order.id}`} className="block">
                                            <span className="text-sm text-gray-600">
                                                {order.tableNumber || '-'}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/orders/${order.id}`} className="block">
                                            <StatusBadge status={order.status} />
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/home/orders/${order.id}`} className="block">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${order.paymentStatus === 'paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {order.paymentStatus === 'paid' ? '✓ Paid' : '○ Pending'}
                                                </span>
                                                {order.paymentMethod && (
                                                    <span className="text-xs text-gray-500 uppercase">
                                                        {order.paymentMethod}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/home/orders/${order.id}`} className="block">
                                            <span className="text-sm font-semibold text-gray-900">
                                                ${parseFloat(order.totalAmount).toLocaleString()}
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
                {orders.map((order) => (
                    <MobileOrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
}
