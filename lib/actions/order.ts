'use server';

import { db } from '@/lib/db';
import { orders, products, productImages, orderItems } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getOrders(storeId: string, status?: string) {
    try {
        const conditions = [eq(orders.storeId, storeId)];

        if (status && status !== 'all') {
            conditions.push(eq(orders.status, status));
        }

        // Fetch orders with their items
        const ordersList = await db.query.orders.findMany({
            where: and(...conditions),
            with: {
                orderItems: {
                    with: {
                        product: {
                            with: {
                                images: {
                                    limit: 1,
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [desc(orders.createdAt)],
        });

        return {
            success: true,
            orders: ordersList,
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return {
            success: false,
            error: 'Failed to fetch orders',
            orders: [],
        };
    }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        await db
            .update(orders)
            .set({
                status: newStatus,
                updatedAt: new Date()
            })
            .where(eq(orders.id, orderId));

        revalidatePath('/home/orders');
        revalidatePath('/home');
        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            success: false,
            error: 'Failed to update order status',
        };
    }
}

export async function getOrderDetails(orderId: string) {
    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                orderItems: {
                    with: {
                        product: {
                            with: {
                                images: true,
                            },
                        },
                    },
                },
                table: true,
            },
        });

        if (!order) {
            return {
                success: false,
                error: 'Order not found',
            };
        }

        return {
            success: true,
            order,
        };
    } catch (error) {
        console.error('Error fetching order details:', error);
        return {
            success: false,
            error: 'Failed to fetch order details',
        };
    }
}

export async function shipOrder(orderId: string) {
    try {
        await db
            .update(orders)
            .set({
                status: 'shipped',
                updatedAt: new Date()
            })
            .where(eq(orders.id, orderId));

        revalidatePath('/home/orders');
        revalidatePath(`/home/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        console.error('Error shipping order:', error);
        return {
            success: false,
            error: 'Failed to ship order',
        };
    }
}

export async function cancelOrder(orderId: string) {
    try {
        // Get order with items first to restore inventory
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                orderItems: true,
            },
        });

        if (!order) {
            return {
                success: false,
                error: 'Order not found',
            };
        }

        // Only restore inventory if order is not already cancelled
        if (order.status === 'cancelled') {
            return {
                success: false,
                error: 'Order is already cancelled',
            };
        }

        // Update order status to cancelled
        await db
            .update(orders)
            .set({
                status: 'cancelled',
                updatedAt: new Date()
            })
            .where(eq(orders.id, orderId));

        // Restore inventory for each order item
        for (const item of order.orderItems) {
            await db
                .update(products)
                .set({
                    inventory: sql`${products.inventory} + ${item.quantity}`
                })
                .where(eq(products.id, item.productId));
        }

        revalidatePath('/home/orders');
        revalidatePath(`/home/orders/${orderId}`);
        revalidatePath('/home');
        return { success: true };
    } catch (error) {
        console.error('Error cancelling order:', error);
        return {
            success: false,
            error: 'Failed to cancel order',
        };
    }
}
