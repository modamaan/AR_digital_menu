'use server';

import { db } from '@/lib/db';
import { tables } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/user';
import { getUserStores } from './store';
import { revalidatePath } from 'next/cache';
import QRCode from 'qrcode';

/**
 * Generates a QR code data URL for a table
 */
async function generateQRCodeDataURL(url: string): Promise<string> {
    try {
        return await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Creates a new table with QR code
 */
export async function createTable(data: {
    tableNumber: string;
    seatingCapacity?: number;
}) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No restaurant found' };
        }

        const store = storesResult.stores[0];
        const storeId = store.id;

        // Check if table number already exists
        const existingTable = await db.query.tables.findFirst({
            where: and(
                eq(tables.storeId, storeId),
                eq(tables.tableNumber, data.tableNumber)
            ),
        });

        if (existingTable) {
            return { success: false, error: 'Table number already exists' };
        }

        // Generate QR code URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const menuUrl = `${baseUrl}/${store.slug}/menu?table=${encodeURIComponent(data.tableNumber)}`;

        // Generate QR code data URL
        const qrCodeData = await generateQRCodeDataURL(menuUrl);

        const [table] = await db.insert(tables).values({
            storeId,
            tableNumber: data.tableNumber,
            qrCode: qrCodeData,
            seatingCapacity: data.seatingCapacity || 4,
            status: 'available',
        }).returning();

        revalidatePath('/home/tables');
        return { success: true, table };
    } catch (error) {
        console.error('Error creating table:', error);
        return { success: false, error: 'Failed to create table' };
    }
}

/**
 * Updates an existing table
 */
export async function updateTable(tableId: string, data: {
    tableNumber?: string;
    seatingCapacity?: number;
    status?: 'available' | 'occupied' | 'reserved';
}) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No restaurant found' };
        }

        const store = storesResult.stores[0];
        const storeId = store.id;

        // Verify table belongs to user's store
        const table = await db.query.tables.findFirst({
            where: and(
                eq(tables.id, tableId),
                eq(tables.storeId, storeId)
            ),
        });

        if (!table) {
            return { success: false, error: 'Table not found' };
        }

        // If table number is being changed, regenerate QR code
        let updateData: any = { ...data };
        if (data.tableNumber && data.tableNumber !== table.tableNumber) {
            // Check if new table number already exists
            const existingTable = await db.query.tables.findFirst({
                where: and(
                    eq(tables.storeId, storeId),
                    eq(tables.tableNumber, data.tableNumber)
                ),
            });

            if (existingTable && existingTable.id !== tableId) {
                return { success: false, error: 'Table number already exists' };
            }

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const menuUrl = `${baseUrl}/${store.slug}/menu?table=${encodeURIComponent(data.tableNumber)}`;
            updateData.qrCode = await generateQRCodeDataURL(menuUrl);
        }

        const [updated] = await db.update(tables)
            .set(updateData)
            .where(eq(tables.id, tableId))
            .returning();

        revalidatePath('/home/tables');
        return { success: true, table: updated };
    } catch (error) {
        console.error('Error updating table:', error);
        return { success: false, error: 'Failed to update table' };
    }
}

/**
 * Deletes a table
 */
export async function deleteTable(tableId: string) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No restaurant found' };
        }

        const storeId = storesResult.stores[0].id;

        // Verify table belongs to user's store
        const table = await db.query.tables.findFirst({
            where: and(
                eq(tables.id, tableId),
                eq(tables.storeId, storeId)
            ),
        });

        if (!table) {
            return { success: false, error: 'Table not found' };
        }

        await db.delete(tables).where(eq(tables.id, tableId));

        revalidatePath('/home/tables');
        return { success: true };
    } catch (error) {
        console.error('Error deleting table:', error);
        return { success: false, error: 'Failed to delete table' };
    }
}

/**
 * Gets all tables for the current user's store
 */
export async function getTables() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized', tables: [] };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No restaurant found', tables: [] };
        }

        const storeId = storesResult.stores[0].id;

        const storeTables = await db.query.tables.findMany({
            where: eq(tables.storeId, storeId),
            orderBy: (tables, { asc }) => [asc(tables.tableNumber)],
        });

        return { success: true, tables: storeTables };
    } catch (error) {
        console.error('Error fetching tables:', error);
        return { success: false, error: 'Failed to fetch tables', tables: [] };
    }
}

/**
 * Regenerates QR code for a table
 */
export async function regenerateQRCode(tableId: string) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No restaurant found' };
        }

        const store = storesResult.stores[0];
        const storeId = store.id;

        // Verify table belongs to user's store
        const table = await db.query.tables.findFirst({
            where: and(
                eq(tables.id, tableId),
                eq(tables.storeId, storeId)
            ),
        });

        if (!table) {
            return { success: false, error: 'Table not found' };
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const menuUrl = `${baseUrl}/${store.slug}/menu?table=${encodeURIComponent(table.tableNumber)}`;
        const qrCodeData = await generateQRCodeDataURL(menuUrl);

        const [updated] = await db.update(tables)
            .set({ qrCode: qrCodeData })
            .where(eq(tables.id, tableId))
            .returning();

        revalidatePath('/home/tables');
        return { success: true, table: updated };
    } catch (error) {
        console.error('Error regenerating QR code:', error);
        return { success: false, error: 'Failed to regenerate QR code' };
    }
}

/**
 * Updates table status
 */
export async function updateTableStatus(tableId: string, status: 'available' | 'occupied' | 'reserved') {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No restaurant found' };
        }

        const storeId = storesResult.stores[0].id;

        const [updated] = await db.update(tables)
            .set({ status })
            .where(and(
                eq(tables.id, tableId),
                eq(tables.storeId, storeId)
            ))
            .returning();

        if (!updated) {
            return { success: false, error: 'Table not found' };
        }

        revalidatePath('/home/tables');
        return { success: true, table: updated };
    } catch (error) {
        console.error('Error updating table status:', error);
        return { success: false, error: 'Failed to update table status' };
    }
}
