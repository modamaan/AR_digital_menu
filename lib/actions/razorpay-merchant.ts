'use server';

import { db } from '@/lib/db';
import { paymentMethods } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/user';
import { getUserStores } from './store';

/**
 * Saves Razorpay API credentials for merchant account
 */
export async function saveRazorpayCredentials(data: {
    apiKey: string;
    apiSecret: string;
}) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No store found' };
        }

        const storeId = storesResult.stores[0].id;

        // Check if Razorpay payment method exists
        const existing = await db.query.paymentMethods.findFirst({
            where: (paymentMethods, { and, eq }) =>
                and(
                    eq(paymentMethods.storeId, storeId),
                    eq(paymentMethods.provider, 'razorpay')
                ),
        });

        if (existing) {
            // Update existing
            await db.update(paymentMethods)
                .set({
                    apiKey: data.apiKey,
                    apiSecret: data.apiSecret,
                    connectionStatus: 'connected',
                    enabled: true,
                })
                .where(eq(paymentMethods.id, existing.id));
        } else {
            // Create new
            await db.insert(paymentMethods).values({
                storeId,
                provider: 'razorpay',
                name: 'Razorpay',
                apiKey: data.apiKey,
                apiSecret: data.apiSecret,
                connectionStatus: 'connected',
                enabled: true,
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving Razorpay credentials:', error);
        return { success: false, error: 'Failed to save credentials' };
    }
}

/**
 * Gets Razorpay credentials status
 */
export async function getRazorpayStatus() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized', connected: false };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No store found', connected: false };
        }

        const storeId = storesResult.stores[0].id;

        const method = await db.query.paymentMethods.findFirst({
            where: (paymentMethods, { and, eq }) =>
                and(
                    eq(paymentMethods.storeId, storeId),
                    eq(paymentMethods.provider, 'razorpay')
                ),
        });

        if (!method || !method.apiKey) {
            return { success: true, connected: false };
        }

        return {
            success: true,
            connected: method.connectionStatus === 'connected',
            apiKey: method.apiKey,
            enabled: method.enabled,
        };
    } catch (error) {
        console.error('Error getting Razorpay status:', error);
        return { success: false, error: 'Failed to get status', connected: false };
    }
}

/**
 * Disconnects/removes Razorpay credentials
 */
export async function disconnectRazorpay() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No store found' };
        }

        const storeId = storesResult.stores[0].id;

        const method = await db.query.paymentMethods.findFirst({
            where: (paymentMethods, { and, eq }) =>
                and(
                    eq(paymentMethods.storeId, storeId),
                    eq(paymentMethods.provider, 'razorpay')
                ),
        });

        if (!method) {
            return { success: false, error: 'No Razorpay connection found' };
        }

        await db.update(paymentMethods)
            .set({
                apiKey: null,
                apiSecret: null,
                connectionStatus: 'disconnected',
                enabled: false,
            })
            .where(eq(paymentMethods.id, method.id));

        return { success: true };
    } catch (error) {
        console.error('Error disconnecting Razorpay:', error);
        return { success: false, error: 'Failed to disconnect' };
    }
}
