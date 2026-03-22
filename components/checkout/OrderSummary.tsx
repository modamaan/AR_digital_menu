'use client';

import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';

interface OrderSummaryProps {
    shippingCost: number;
    currency: string;
    onCheckout?: () => void;
    isSubmitting?: boolean;
    error?: string | null;
}

export default function OrderSummary({ shippingCost, currency, onCheckout, isSubmitting = false, error }: OrderSummaryProps) {
    const { items } = useCart();

    // Calculate subtotal
    const subtotal = items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    const total = subtotal + shippingCost;

    // Currency symbol
    const getCurrencySymbol = (curr: string) => {
        const symbols: Record<string, string> = {
            USD: '$',
            INR: '₹',
            EUR: '€',
            GBP: '£',
        };
        return symbols[curr] || curr;
    };

    const symbol = getCurrencySymbol(currency);

    return (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image && (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                            {symbol}{(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-gray-100 my-4 sm:my-6"></div>

            {/* Summary */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                    <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-medium">{symbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium">
                        {shippingCost === 0 ? (
                            <span className="text-green-600 font-bold">FREE</span>
                        ) : (
                            `${symbol}${shippingCost.toFixed(2)}`
                        )}
                    </span>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-100 my-3 sm:my-4"></div>

                {/* Total */}
                <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{symbol}{total.toFixed(2)}</span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Checkout Button */}
            {onCheckout && (
                <button
                    type="button"
                    onClick={onCheckout}
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#4E44FD] hover:bg-[#3d36ca] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-[#4E44FD]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-sm sm:text-base"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        'Checkout'
                    )}
                </button>
            )}

        </div>
    );
}
