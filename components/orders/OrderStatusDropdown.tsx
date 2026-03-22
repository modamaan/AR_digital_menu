'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/lib/actions/order';

interface OrderStatusDropdownProps {
    orderId: string;
    currentStatus: string;
}

const statusOptions = [
    { label: 'Pending', value: 'pending', color: 'text-yellow-600' },
    { label: 'New Order', value: 'new_order', color: 'text-blue-600' },
    { label: 'Order Confirmed', value: 'order_confirmed', color: 'text-purple-600' },
    { label: 'Payment Confirmed', value: 'payment_confirmed', color: 'text-indigo-600' },
    { label: 'Packed', value: 'packed', color: 'text-yellow-600' },
    { label: 'Shipped', value: 'shipped', color: 'text-orange-600' },
    { label: 'Delivered', value: 'delivered', color: 'text-green-600' },
    { label: 'Cancelled', value: 'cancelled', color: 'text-red-600' },
];

export default function OrderStatusDropdown({ orderId, currentStatus }: OrderStatusDropdownProps) {
    const [status, setStatus] = useState(currentStatus);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Don't show dropdown for final states
    const finalStates = ['shipped', 'delivered', 'cancelled'];
    if (finalStates.includes(currentStatus)) {
        return null;
    }

    const handleStatusUpdate = async (newStatus: string) => {
        setIsLoading(true);
        setStatus(newStatus); // Optimistic update
        setIsOpen(false);

        const result = await updateOrderStatus(orderId, newStatus);

        if (!result.success) {
            // Revert on failure
            setStatus(currentStatus);
            alert('Failed to update status');
        }
        setIsLoading(false);
    };

    const currentOption = statusOptions.find(opt => opt.value === status) || statusOptions[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all w-full md:w-auto justify-between"
            >
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${currentOption.color.replace('text-', 'bg-')}`} />
                    <span className="text-sm font-medium text-gray-700">{currentOption.label}</span>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden min-w-[200px]">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleStatusUpdate(option.value)}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${status === option.value ? 'bg-gray-50 font-medium' : 'text-gray-600'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${option.color.replace('text-', 'bg-')}`} />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
