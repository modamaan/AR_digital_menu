'use client';

import { useCart, CartItem as CartItemType } from '@/lib/context/CartContext';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';

interface CartItemProps {
    item: CartItemType;
    currency: string;
}

export default function CartItem({ item, currency }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();

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
        <div className="flex gap-4 py-4 border-b border-gray-200 last:border-0">
            {/* Product Image */}
            <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                    <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0 ml-2"
                        aria-label="Remove item"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                <p className="text-lg font-bold text-gray-900 mb-3">
                    {getCurrencySymbol(currency)}{item.price.toFixed(2)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
