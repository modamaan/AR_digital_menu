'use server';

import { db } from '@/lib/db';
import { paymentMethods } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/user';
import { getUserStores } from './store';
import { validateUpiId } from '@/lib/utils/upi-utils';

interface SaveUpiCredentialsInput {
    upiId: string;
    accountHolderName: string;
    bankName: string;
}

/**
 * Saves or updates UPI credentials for the merchant
 */
export async function saveUpiCredentials(input: SaveUpiCredentialsInput) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Validate UPI ID format
        if (!validateUpiId(input.upiId)) {
            return { success: false, error: 'Invalid UPI ID format. Use format: username@bankname' };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No store found' };
        }

        const storeId = storesResult.stores[0].id;

        // Check if UPI payment method already exists
        const existing = await db.query.paymentMethods.findFirst({
            where: (paymentMethods, { and, eq }) =>
                and(
                    eq(paymentMethods.storeId, storeId),
                    eq(paymentMethods.provider, 'upi')
                ),
        });

        if (existing) {
            // Update existing UPI credentials
            await db.update(paymentMethods)
                .set({
                    upiId: input.upiId,
                    accountHolderName: input.accountHolderName,
                    bankName: input.bankName,
                    connectionStatus: 'connected',
                    enabled: true,
                    updatedAt: new Date(),
                })
                .where(eq(paymentMethods.id, existing.id));
        } else {
            // Create new UPI payment method
            await db.insert(paymentMethods).values({
                storeId,
                provider: 'upi',
                name: 'UPI Payment',
                upiId: input.upiId,
                accountHolderName: input.accountHolderName,
                bankName: input.bankName,
                connectionStatus: 'connected',
                enabled: true,
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving UPI credentials:', error);
        return { success: false, error: 'Failed to save UPI credentials' };
    }
}

/**
 * Gets UPI payment method status for current store
 */
export async function getUpiStatus() {
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
                    eq(paymentMethods.provider, 'upi')
                ),
        });

        if (!method) {
            return { success: true, connected: false, enabled: false };
        }

        return {
            success: true,
            connected: method.connectionStatus === 'connected',
            enabled: method.enabled,
            upiId: method.upiId || '',
            accountHolderName: method.accountHolderName || '',
            bankName: method.bankName || '',
        };
    } catch (error) {
        console.error('Error getting UPI status:', error);
        return { success: false, error: 'Failed to get UPI status', connected: false };
    }
}

/**
 * Toggles UPI payment method on/off
 */
export async function toggleUpi(enabled: boolean) {
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
                    eq(paymentMethods.provider, 'upi')
                ),
        });

        if (!method) {
            return { success: false, error: 'UPI payment method not configured' };
        }

        await db.update(paymentMethods)
            .set({ enabled, updatedAt: new Date() })
            .where(eq(paymentMethods.id, method.id));

        return { success: true };
    } catch (error) {
        console.error('Error toggling UPI:', error);
        return { success: false, error: 'Failed to toggle UPI' };
    }
}

/**
 * Disconnects/removes UPI credentials
 */
export async function disconnectUpi() {
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
                    eq(paymentMethods.provider, 'upi')
                ),
        });

        if (!method) {
            return { success: false, error: 'UPI payment method not found' };
        }

        await db.update(paymentMethods)
            .set({
                upiId: null,
                accountHolderName: null,
                bankName: null,
                connectionStatus: 'disconnected',
                enabled: false,
                updatedAt: new Date(),
            })
            .where(eq(paymentMethods.id, method.id));

        return { success: true };
    } catch (error) {
        console.error('Error disconnecting UPI:', error);
        return { success: false, error: 'Failed to disconnect UPI' };
    }
}
