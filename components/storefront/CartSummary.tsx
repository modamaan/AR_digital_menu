'use client';

import { useCart } from '@/lib/context/CartContext';
import Link from 'next/link';

interface CartSummaryProps {
    store: {
        slug: string;
        currency: string;
    };
}

export default function CartSummary({ store }: CartSummaryProps) {
    const { subtotal, itemCount } = useCart();

    const getCurrencySymbol = (curr: string) => {
        switch (curr) {
            case 'USD': return '$';
            case 'INR': return '₹';
            case 'EUR': return '€';
            case 'GBP': return '£';
            default: return curr;
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-medium text-gray-900">
                        {getCurrencySymbol(store.currency)}{subtotal.toFixed(2)}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-500">Calculated at next step</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-gray-900 text-lg">
                            {getCurrencySymbol(store.currency)}{subtotal.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <Link
                href={`/${store.slug}/checkout`}
                className="block w-full bg-[#4E44FD] hover:bg-[#3d36ca] text-white font-bold py-4 px-6 rounded-2xl text-center transition-all shadow-lg shadow-[#4E44FD]/20 active:scale-[0.98]"
            >
                Proceed to Checkout
            </Link>
        </div>
    );
}
