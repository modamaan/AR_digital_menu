'use server';

import { db } from '@/lib/db';
import { orders, orderItems, stores, products } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface CartItem {
    productId: string;
    quantity: number;
    unitPrice: string; // price per unit as string
}

interface CreateOrderInput {
    storeSlug: string;
    items: CartItem[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    countryCode?: string;
    shippingMethod: 'pickup' | 'delivery';
    paymentMethod: 'cod' | 'razorpay' | 'upi';
    shippingAddress?: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        zipCode: string;
    };
}

export async function createOrder(input: CreateOrderInput) {
    try {
        if (!input.items || input.items.length === 0) {
            return { success: false, error: 'No items in cart' };
        }

        // Get store
        const store = await db.query.stores.findFirst({
            where: eq(stores.slug, input.storeSlug),
        });

        if (!store) {
            return { success: false, error: 'Store not found' };
        }

        // Validate stock for all items
        for (const item of input.items) {
            const product = await db.query.products.findFirst({
                where: eq(products.id, item.productId),
            });
            if (!product) {
                return { success: false, error: `Product not found` };
            }
            if (product.inventory < item.quantity) {
                return {
                    success: false,
                    error: `Sorry, only ${product.inventory} of "${product.name}" available in stock`,
                };
            }
        }

        // Calculate totals
        const shippingCost = input.shippingMethod === 'delivery'
            ? parseFloat(store.deliveryCost || '10.00')
            : 0;

        const subtotal = input.items.reduce(
            (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
            0
        );
        const totalAmount = subtotal + shippingCost;

        const shippingAddress = input.shippingMethod === 'delivery' && input.shippingAddress
            ? JSON.stringify(input.shippingAddress)
            : null;

        // Decrement inventory for each item atomically
        for (const item of input.items) {
            await db
                .update(products)
                .set({ inventory: sql`${products.inventory} - ${item.quantity}` })
                .where(
                    and(
                        eq(products.id, item.productId),
                        sql`${products.inventory} >= ${item.quantity}`
                    )
                );
        }

        // Create the order row
        const [newOrder] = await db.insert(orders).values({
            storeId: store.id,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            countryCode: input.countryCode || '',
            totalAmount: totalAmount.toFixed(2),
            shippingMethod: input.shippingMethod,
            shippingCost: shippingCost.toFixed(2),
            shippingAddress,
            paymentMethod: input.paymentMethod,
            status: 'pending',
            paymentStatus: input.paymentMethod === 'upi' ? 'pending' : 'paid',
            paymentVerifiedAt: input.paymentMethod === 'upi' ? null : new Date(),
        }).returning();

        // Insert all order items
        await db.insert(orderItems).values(
            input.items.map((item) => ({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unitPrice).toFixed(2),
                subtotal: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
            }))
        );

        revalidatePath(`/${input.storeSlug}`);
        revalidatePath('/home/orders');
        revalidatePath('/home');

        return {
            success: true,
            orderId: newOrder.id,
            orderNumber: newOrder.id.slice(0, 8).toUpperCase(),
        };
    } catch (error) {
        console.error('Error creating order:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to create order. Please try again.' };
    }
}
