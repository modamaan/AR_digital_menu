'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children, storeSlug }: { children: ReactNode; storeSlug: string }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(`cart_${storeSlug}`);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Ensure it's an array
                if (Array.isArray(parsed)) {
                    setItems(parsed);
                } else {
                    console.warn('Cart data is not an array, resetting');
                    setItems([]);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                setItems([]);
            }
        }
        setIsLoaded(true);
    }, [storeSlug]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(`cart_${storeSlug}`, JSON.stringify(items));
        }
    }, [items, storeSlug, isLoaded]);

    const addItem = (item: Omit<CartItem, 'id' | 'quantity'>) => {
        setItems((currentItems) => {
            // Check if item already exists
            const existingItem = currentItems.find((i) => i.productId === item.productId);

            if (existingItem) {
                // Increase quantity
                return currentItems.map((i) =>
                    i.productId === item.productId
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            } else {
                // Add new item
                return [
                    ...currentItems,
                    {
                        ...item,
                        id: `${item.productId}_${Date.now()}`,
                        quantity: 1,
                    },
                ];
            }
        });
    };

    const removeItem = (itemId: string) => {
        setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const itemCount = Array.isArray(items) ? items.reduce((total, item) => total + item.quantity, 0) : 0;
    const subtotal = Array.isArray(items) ? items.reduce((total, item) => total + item.price * item.quantity, 0) : 0;

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                itemCount,
                subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
