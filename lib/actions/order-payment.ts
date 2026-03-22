'use server';

import { db } from '@/lib/db';
import { orders, stores, paymentMethods } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface UploadPaymentScreenshotInput {
    orderId: string;
    imageUrl: string;
}

/**
 * Uploads payment screenshot and automatically marks order as paid
 * This is called after the buyer uploads a screenshot from the UPI payment page
 */
export async function uploadPaymentScreenshot(input: UploadPaymentScreenshotInput) {
    try {
        // Get the order
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, input.orderId),
        });

        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        // Check if order is UPI payment
        if (order.paymentMethod !== 'upi') {
            return { success: false, error: 'This order does not use UPI payment' };
        }

        // Check if screenshot already uploaded (prevent re-upload)
        if (order.paymentScreenshotUrl) {
            return { success: false, error: 'Payment screenshot already uploaded for this order' };
        }

        // Check if order is within 24 hours
        const orderAge = Date.now() - new Date(order.createdAt).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (orderAge > twentyFourHours) {
            return { success: false, error: 'Screenshot upload window has expired (24 hours)' };
        }

        // Update order with screenshot and mark as paid
        const now = new Date();
        await db.update(orders)
            .set({
                paymentScreenshotUrl: input.imageUrl,
                screenshotUploadedAt: now,
                paymentStatus: 'paid',
                paymentVerifiedAt: now,
                updatedAt: now,
            })
            .where(eq(orders.id, input.orderId));

        // Revalidate relevant paths
        revalidatePath('/home/orders');
        revalidatePath(`/home/orders/${input.orderId}`);

        return { success: true };
    } catch (error) {
        console.error('Error uploading payment screenshot:', error);
        return { success: false, error: 'Failed to upload payment screenshot' };
    }
}

/**
 * Gets order payment details including screenshot
 */
export async function getOrderPaymentDetails(orderId: string) {
    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
        });

        if (!order) {
            return { success: false, error: 'Order not found', paymentDetails: null };
        }

        return {
            success: true,
            paymentDetails: {
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                paymentScreenshotUrl: order.paymentScreenshotUrl,
                paymentVerifiedAt: order.paymentVerifiedAt,
                screenshotUploadedAt: order.screenshotUploadedAt,
            },
        };
    } catch (error) {
        console.error('Error getting order payment details:', error);
        return { success: false, error: 'Failed to get payment details', paymentDetails: null };
    }
}

/**
 * Gets UPI payment details for a store (for displaying on payment page)
 */
export async function getStoreUpiDetails(storeSlug: string) {
    try {
        // Get store
        const store = await db.query.stores.findFirst({
            where: eq(stores.slug, storeSlug),
        });

        if (!store) {
            return { success: false, error: 'Store not found', upiDetails: null };
        }

        // Get UPI payment method
        const upiMethod = await db.query.paymentMethods.findFirst({
            where: and(
                eq(paymentMethods.storeId, store.id),
                eq(paymentMethods.provider, 'upi'),
                eq(paymentMethods.enabled, true),
                eq(paymentMethods.connectionStatus, 'connected')
            ),
        });

        if (!upiMethod) {
            return { success: false, error: 'UPI payment not configured', upiDetails: null };
        }

        return {
            success: true,
            upiDetails: {
                upiId: upiMethod.upiId || '',
                accountHolderName: upiMethod.accountHolderName || '',
                bankName: upiMethod.bankName || '',
            },
        };
    } catch (error) {
        console.error('Error getting store UPI details:', error);
        return { success: false, error: 'Failed to get UPI details', upiDetails: null };
    }
}
