'use server';

import { db } from '@/lib/db';
import { menuCategories } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/user';
import { getUserStores } from './store';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new menu category
 */
export async function createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
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

        const storeId = storesResult.stores[0].id;

        // Get the highest display order
        const existingCategories = await db.query.menuCategories.findMany({
            where: eq(menuCategories.storeId, storeId),
            orderBy: [asc(menuCategories.displayOrder)],
        });

        const maxOrder = existingCategories.length > 0
            ? Math.max(...existingCategories.map(c => c.displayOrder))
            : -1;

        const [category] = await db.insert(menuCategories).values({
            storeId,
            name: data.name,
            description: data.description,
            icon: data.icon,
            displayOrder: maxOrder + 1,
            isActive: true,
        }).returning();

        revalidatePath('/home/menu');
        return { success: true, category };
    } catch (error) {
        console.error('Error creating category:', error);
        return { success: false, error: 'Failed to create category' };
    }
}

/**
 * Updates an existing menu category
 */
export async function updateCategory(categoryId: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
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

        const storeId = storesResult.stores[0].id;

        // Verify category belongs to user's store
        const category = await db.query.menuCategories.findFirst({
            where: and(
                eq(menuCategories.id, categoryId),
                eq(menuCategories.storeId, storeId)
            ),
        });

        if (!category) {
            return { success: false, error: 'Category not found' };
        }

        const [updated] = await db.update(menuCategories)
            .set(data)
            .where(eq(menuCategories.id, categoryId))
            .returning();

        revalidatePath('/home/menu');
        return { success: true, category: updated };
    } catch (error) {
        console.error('Error updating category:', error);
        return { success: false, error: 'Failed to update category' };
    }
}

/**
 * Deletes a menu category
 */
export async function deleteCategory(categoryId: string) {
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

        // Verify category belongs to user's store
        const category = await db.query.menuCategories.findFirst({
            where: and(
                eq(menuCategories.id, categoryId),
                eq(menuCategories.storeId, storeId)
            ),
        });

        if (!category) {
            return { success: false, error: 'Category not found' };
        }

        await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));

        revalidatePath('/home/menu');
        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: 'Failed to delete category' };
    }
}

/**
 * Reorders menu categories
 */
export async function reorderCategories(categoryOrders: { id: string; displayOrder: number }[]) {
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

        // Update each category's display order
        for (const { id, displayOrder } of categoryOrders) {
            await db.update(menuCategories)
                .set({ displayOrder })
                .where(and(
                    eq(menuCategories.id, id),
                    eq(menuCategories.storeId, storeId)
                ));
        }

        revalidatePath('/home/menu');
        return { success: true };
    } catch (error) {
        console.error('Error reordering categories:', error);
        return { success: false, error: 'Failed to reorder categories' };
    }
}

/**
 * Gets all menu categories for the current user's store
 */
export async function getCategories() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Unauthorized', categories: [] };
        }

        const storesResult = await getUserStores();
        if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
            return { success: false, error: 'No restaurant found', categories: [] };
        }

        const storeId = storesResult.stores[0].id;

        const categories = await db.query.menuCategories.findMany({
            where: eq(menuCategories.storeId, storeId),
            orderBy: [asc(menuCategories.displayOrder)],
        });

        return { success: true, categories };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { success: false, error: 'Failed to fetch categories', categories: [] };
    }
}

/**
 * Gets categories by store slug (for public menu view)
 */
export async function getCategoriesByStoreSlug(storeSlug: string) {
    try {
        const store = await db.query.stores.findFirst({
            where: (stores, { eq }) => eq(stores.slug, storeSlug),
        });

        if (!store) {
            return { success: false, error: 'Restaurant not found', categories: [] };
        }

        const categories = await db.query.menuCategories.findMany({
            where: and(
                eq(menuCategories.storeId, store.id),
                eq(menuCategories.isActive, true)
            ),
            orderBy: [asc(menuCategories.displayOrder)],
        });

        return { success: true, categories };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { success: false, error: 'Failed to fetch categories', categories: [] };
    }
}
