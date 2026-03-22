import React from 'react';

const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    new_order: { label: 'New Order', className: 'bg-blue-100 text-blue-700' },
    order_confirmed: { label: 'Order Confirmed', className: 'bg-purple-100 text-purple-700' },
    payment_confirmed: { label: 'Payment Confirmed', className: 'bg-indigo-100 text-indigo-700' },
    packed: { label: 'Packed', className: 'bg-yellow-100 text-yellow-700' },
    shipped: { label: 'Shipped', className: 'bg-orange-100 text-orange-700' },
    delivered: { label: 'Delivered', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
};

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.className}`}>
            {config.label}
        </span>
    );
}
