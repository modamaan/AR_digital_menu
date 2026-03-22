'use server';

import { db } from '@/lib/db';
import { paymentMethods, stores } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface CreateRazorpayOrderInput {
    storeSlug: string;
    amount: number; // in INR
    currency: string;
    receipt: string;
}

export async function createRazorpayOrder(input: CreateRazorpayOrderInput) {
    try {
        // Get store
        const store = await db.query.stores.findFirst({
            where: eq(stores.slug, input.storeSlug),
        });

        if (!store) {
            return { success: false, error: 'Store not found' };
        }

        // Get Razorpay payment method for this store
        const razorpayMethod = await db.query.paymentMethods.findFirst({
            where: and(
                eq(paymentMethods.storeId, store.id),
                eq(paymentMethods.provider, 'razorpay'),
                eq(paymentMethods.enabled, true),
                eq(paymentMethods.connectionStatus, 'connected')
            ),
        });

        if (!razorpayMethod || !razorpayMethod.apiKey || !razorpayMethod.apiSecret) {
            return { success: false, error: 'Razorpay not configured for this store' };
        }

        // Import Razorpay
        const Razorpay = (await import('razorpay')).default;

        // Initialize Razorpay instance
        const razorpay = new Razorpay({
            key_id: razorpayMethod.apiKey,
            key_secret: razorpayMethod.apiSecret,
        });

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(input.amount * 100), // Convert to paise
            currency: input.currency,
            receipt: input.receipt,
        });

        return {
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: razorpayMethod.apiKey,
        };
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return { success: false, error: 'Failed to create Razorpay order' };
    }
}

export async function verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    storeSlug: string
) {
    try {
        // Get store
        const store = await db.query.stores.findFirst({
            where: eq(stores.slug, storeSlug),
        });

        if (!store) {
            return { success: false, error: 'Store not found' };
        }

        // Get Razorpay payment method
        const razorpayMethod = await db.query.paymentMethods.findFirst({
            where: and(
                eq(paymentMethods.storeId, store.id),
                eq(paymentMethods.provider, 'razorpay')
            ),
        });

        if (!razorpayMethod || !razorpayMethod.apiSecret) {
            return { success: false, error: 'Razorpay not configured' };
        }

        // Verify signature
        const crypto = await import('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', razorpayMethod.apiSecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        if (expectedSignature === razorpaySignature) {
            return { success: true, verified: true };
        } else {
            return { success: false, error: 'Invalid payment signature' };
        }
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        return { success: false, error: 'Failed to verify payment' };
    }
}
