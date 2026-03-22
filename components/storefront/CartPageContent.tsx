'use client';

import { useCart } from '@/lib/context/CartContext';
import Link from 'next/link';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { ShoppingBag } from 'lucide-react';

interface CartPageContentProps {
    store: {
        slug: string;
        currency: string;
        name: string;
    };
}

export default function CartPageContent({ store }: CartPageContentProps) {
    const { items } = useCart();

    if (items.length === 0) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Add some products to get started!</p>
                    <Link
                        href={`/${store.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Continue Shopping →
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                            ✓
                        </div>
                        <span className="font-semibold text-green-600">Cart</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-semibold">
                            2
                        </div>
                        <span className="text-gray-500">Checkout</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-semibold">
                            3
                        </div>
                        <span className="text-gray-500">Confirmation</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                            <Link
                                href={`/${store.slug}`}
                                className="text-green-600 hover:text-green-700 font-medium text-sm"
                            >
                                Continue Shopping →
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartItem key={item.id} item={item} currency={store.currency} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <CartSummary store={store} />
                </div>
            </div>
        </main>
    );
}
