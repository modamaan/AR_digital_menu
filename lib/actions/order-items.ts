'use server';

import { db } from '@/lib/db';
import { orders, orderItems, products, tables } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new order with multiple items (cart)
 */
export async function createOrder(data: {
    storeId: string;
    tableId?: string;
    tableNumber?: string;
    orderType: 'dine_in' | 'takeout' | 'delivery';
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    countryCode?: string;
    items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        specialInstructions?: string;
    }>;
    shippingMethod?: string;
    shippingCost?: number;
    shippingAddress?: string;
    specialInstructions?: string;
    paymentMethod: 'cod' | 'razorpay' | 'upi';
}) {
    try {
        // Calculate total amount
        const totalAmount = data.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0) + (data.shippingCost || 0);

        // Create the order
        const [order] = await db.insert(orders).values({
            storeId: data.storeId,
            tableId: data.tableId,
            tableNumber: data.tableNumber,
            orderType: data.orderType,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            countryCode: data.countryCode,
            totalAmount: totalAmount.toFixed(2),
            shippingMethod: data.shippingMethod || 'pickup',
            shippingCost: (data.shippingCost || 0).toFixed(2),
            shippingAddress: data.shippingAddress,
            specialInstructions: data.specialInstructions,
            paymentMethod: data.paymentMethod,
            status: 'pending',
            paymentStatus: 'pending',
        }).returning();

        // Create order items
        const orderItemsData = data.items.map(item => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toFixed(2),
            subtotal: (item.quantity * item.unitPrice).toFixed(2),
            specialInstructions: item.specialInstructions,
        }));

        await db.insert(orderItems).values(orderItemsData);

        // Update table status if dine-in
        if (data.tableId && data.orderType === 'dine_in') {
            await db.update(tables)
                .set({ status: 'occupied' })
                .where(eq(tables.id, data.tableId));
        }

        revalidatePath('/home/orders');
        return { success: true, order };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: 'Failed to create order' };
    }
}

/**
 * Updates order status
 */
export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const [updated] = await db.update(orders)
            .set({ status })
            .where(eq(orders.id, orderId))
            .returning();

        if (!updated) {
            return { success: false, error: 'Order not found' };
        }

        // If order is completed/cancelled, free up the table
        if ((status === 'completed' || status === 'cancelled') && updated.tableId) {
            await db.update(tables)
                .set({ status: 'available' })
                .where(eq(tables.id, updated.tableId));
        }

        revalidatePath('/home/orders');
        return { success: true, order: updated };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: 'Failed to update order status' };
    }
}

/**
 * Gets order with items
 */
export async function getOrderWithItems(orderId: string) {
    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                orderItems: {
                    with: {
                        product: true,
                    },
                },
                table: true,
            },
        });

        if (!order) {
            return { success: false, error: 'Order not found', order: null };
        }

        return { success: true, order };
    } catch (error) {
        console.error('Error fetching order:', error);
        return { success: false, error: 'Failed to fetch order', order: null };
    }
}

/**
 * Gets all orders for a store
 */
export async function getStoreOrders(storeId: string, filters?: {
    status?: string;
    orderType?: string;
    limit?: number;
}) {
    try {
        let query = db.query.orders.findMany({
            where: eq(orders.storeId, storeId),
            with: {
                orderItems: {
                    with: {
                        product: true,
                    },
                },
                table: true,
            },
            orderBy: [desc(orders.createdAt)],
            limit: filters?.limit || 50,
        });

        const storeOrders = await query;

        // Apply filters
        let filteredOrders = storeOrders;
        if (filters?.status) {
            filteredOrders = filteredOrders.filter(o => o.status === filters.status);
        }
        if (filters?.orderType) {
            filteredOrders = filteredOrders.filter(o => o.orderType === filters.orderType);
        }

        return { success: true, orders: filteredOrders };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: 'Failed to fetch orders', orders: [] };
    }
}

/**
 * Updates payment status
 */
export async function updatePaymentStatus(orderId: string, data: {
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentScreenshotUrl?: string;
}) {
    try {
        const updateData: any = {
            paymentStatus: data.paymentStatus,
        };

        if (data.paymentScreenshotUrl) {
            updateData.paymentScreenshotUrl = data.paymentScreenshotUrl;
            updateData.screenshotUploadedAt = new Date();
        }

        if (data.paymentStatus === 'paid') {
            updateData.paymentVerifiedAt = new Date();
        }

        const [updated] = await db.update(orders)
            .set(updateData)
            .where(eq(orders.id, orderId))
            .returning();

        if (!updated) {
            return { success: false, error: 'Order not found' };
        }

        revalidatePath('/home/orders');
        return { success: true, order: updated };
    } catch (error) {
        console.error('Error updating payment status:', error);
        return { success: false, error: 'Failed to update payment status' };
    }
}

/**
 * Gets order statistics for a store
 */
export async function getOrderStats(storeId: string) {
    try {
        const allOrders = await db.query.orders.findMany({
            where: eq(orders.storeId, storeId),
            with: {
                orderItems: true,
            },
        });

        const stats = {
            total: allOrders.length,
            pending: allOrders.filter(o => o.status === 'pending').length,
            confirmed: allOrders.filter(o => o.status === 'confirmed').length,
            preparing: allOrders.filter(o => o.status === 'preparing').length,
            ready: allOrders.filter(o => o.status === 'ready').length,
            completed: allOrders.filter(o => o.status === 'completed').length,
            cancelled: allOrders.filter(o => o.status === 'cancelled').length,
            totalRevenue: allOrders
                .filter(o => o.paymentStatus === 'paid')
                .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
            todayOrders: allOrders.filter(o => {
                const today = new Date();
                const orderDate = new Date(o.createdAt);
                return orderDate.toDateString() === today.toDateString();
            }).length,
        };

        return { success: true, stats };
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return { success: false, error: 'Failed to fetch stats', stats: null };
    }
}
