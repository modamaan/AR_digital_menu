'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const statuses = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'New Order', value: 'new_order' },
    { label: 'Order Confirmed', value: 'order_confirmed' },
    { label: 'Payment Confirmed', value: 'payment_confirmed' },
    { label: 'Packed', value: 'packed' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
];

export default function StatusFilterTabs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get('status') || 'all';

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === 'all') {
            params.delete('status');
        } else {
            params.set('status', status);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {statuses.map((status) => (
                <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentStatus === status.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {status.label}
                </button>
            ))}
        </div>
    );
}
