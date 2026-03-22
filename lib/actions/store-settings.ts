'use server';

import { getCurrentUserId } from '@/lib/user';
import { db } from '@/lib/db';
import { stores } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface UpdateStoreInput {
    storeId: string;
    name?: string;
    bio?: string;
    bannerImage?: string;
    profileImage?: string;
}

interface UpdateStoreResult {
    success: boolean;
    error?: string;
    store?: {
        id: string;
        name: string;
        slug: string;
        bio: string | null;
        bannerImage: string | null;
        profileImage: string | null;
    };
}

/**
 * Update store details
 */
export async function updateStore(input: UpdateStoreInput): Promise<UpdateStoreResult> {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return {
                success: false,
                error: 'You must be signed in',
            };
        }

        // Get user from database
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.clerkId, userId),
        });

        if (!user) {
            return {
                success: false,
                error: 'User not found',
            };
        }

        // Verify store belongs to user
        const existingStore = await db.query.stores.findFirst({
            where: (stores, { eq, and }) => and(
                eq(stores.id, input.storeId),
                eq(stores.userId, user.id)
            ),
        });

        if (!existingStore) {
            return {
                success: false,
                error: 'Store not found or you do not have permission to edit it',
            };
        }

        // Build update object (only include provided fields)
        const updateData: Partial<typeof stores.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (input.name !== undefined) updateData.name = input.name;
        if (input.bio !== undefined) updateData.bio = input.bio;
        if (input.bannerImage !== undefined) updateData.bannerImage = input.bannerImage;
        if (input.profileImage !== undefined) updateData.profileImage = input.profileImage;

        // Update store
        const [updatedStore] = await db
            .update(stores)
            .set(updateData)
            .where(and(
                eq(stores.id, input.storeId),
                eq(stores.userId, user.id)
            ))
            .returning();

        // Revalidate storefront and settings pages
        revalidatePath(`/${existingStore.slug}`);
        revalidatePath('/home/settings/store');
        revalidatePath('/home');

        return {
            success: true,
            store: {
                id: updatedStore.id,
                name: updatedStore.name,
                slug: updatedStore.slug,
                bio: updatedStore.bio,
                bannerImage: updatedStore.bannerImage,
                profileImage: updatedStore.profileImage,
            },
        };
    } catch (error) {
        console.error('Error updating store:', error);
        return {
            success: false,
            error: 'Failed to update store. Please try again.',
        };
    }
}

/**
 * Get store details for settings
 */
export async function getStoreForSettings(storeId: string) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return {
                success: false,
                error: 'You must be signed in',
                store: null,
            };
        }

        // Get user from database
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.clerkId, userId),
        });

        if (!user) {
            return {
                success: false,
                error: 'User not found',
                store: null,
            };
        }

        // Get store
        const store = await db.query.stores.findFirst({
            where: (stores, { eq, and }) => and(
                eq(stores.id, storeId),
                eq(stores.userId, user.id)
            ),
        });

        if (!store) {
            return {
                success: false,
                error: 'Store not found',
                store: null,
            };
        }

        return {
            success: true,
            store: {
                id: store.id,
                name: store.name,
                slug: store.slug,
                bio: store.bio,
                bannerImage: store.bannerImage,
                profileImage: store.profileImage,
            },
        };
    } catch (error) {
        console.error('Error fetching store:', error);
        return {
            success: false,
            error: 'Failed to fetch store',
            store: null,
        };
    }
}
