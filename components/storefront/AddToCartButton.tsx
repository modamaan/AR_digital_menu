'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useState } from 'react';

interface AddToCartButtonProps {
    product: {
        id: string;
        name: string;
        price: string;
        image?: string;
    };
    storeSlug: string;
    currency: string;
    inStock: boolean;
}

export default function AddToCartButton({ product, storeSlug, currency, inStock }: AddToCartButtonProps) {
    const { addItem } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);
        addItem({
            productId: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
        });

        // Show feedback
        setTimeout(() => setIsAdding(false), 500);
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${inStock
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl active:scale-95'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
        >
            <ShoppingCart className="w-5 h-5" />
            {isAdding ? 'Added!' : inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
    );
}
