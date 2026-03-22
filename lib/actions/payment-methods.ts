'use server';

import { db } from '@/lib/db';
import { paymentMethods, stores } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/user';
import { getUserStores } from './store';

/**
 * Enables or disables Cash on Delivery for a store
 */
export async function toggleCOD(enabled: boolean) {
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

        // Check if COD payment method exists
        const existing = await db.query.paymentMethods.findFirst({
            where: (paymentMethods, { and, eq }) =>
                and(
                    eq(paymentMethods.storeId, storeId),
                    eq(paymentMethods.provider, 'cod')
                ),
        });

        if (existing) {
            // Update existing
            await db.update(paymentMethods)
                .set({ enabled })
                .where(eq(paymentMethods.id, existing.id));
        } else {
            // Create new COD payment method
            await db.insert(paymentMethods).values({
                storeId,
                provider: 'cod',
                name: 'Cash on Delivery',
                connectionStatus: 'connected', // COD doesn't need OAuth
                enabled,
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error toggling COD:', error);
        return { success: false, error: 'Failed to toggle COD' };
    }
}

/**
 * Gets COD status for current store
 */
export async function getCODStatus() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized', enabled: false };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No store found', enabled: false };
        }

        const storeId = storesResult.stores[0].id;

        const codMethod = await db.query.paymentMethods.findFirst({
            where: (paymentMethods, { and, eq }) =>
                and(
                    eq(paymentMethods.storeId, storeId),
                    eq(paymentMethods.provider, 'cod')
                ),
        });

        return { success: true, enabled: codMethod?.enabled || false };
    } catch (error) {
        console.error('Error getting COD status:', error);
        return { success: false, error: 'Failed to get COD status', enabled: false };
    }
}

/**
 * Gets all payment methods for a store by slug (for storefront)
 */
export async function getPaymentMethodsByStoreSlug(storeSlug: string) {
    try {
        // First get the store
        const store = await db.query.stores.findFirst({
            where: eq(stores.slug, storeSlug),
        });

        if (!store) {
            return { success: false, error: 'Store not found', methods: [] };
        }

        // Get payment methods for this store
        const methods = await db.query.paymentMethods.findMany({
            where: and(
                eq(paymentMethods.storeId, store.id),
                eq(paymentMethods.enabled, true),
                eq(paymentMethods.connectionStatus, 'connected')
            ),
        });

        return { success: true, methods };
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return { success: false, error: 'Failed to fetch payment methods', methods: [] };
    }
}
