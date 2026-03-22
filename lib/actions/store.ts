'use server';

import { getCurrentUserId } from '@/lib/user';
import { db } from '@/lib/db';
import { stores, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Generate a URL-friendly slug from a store name
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Check if a slug is already taken
 */
async function isSlugTaken(slug: string): Promise<boolean> {
    const existing = await db.query.stores.findFirst({
        where: eq(stores.slug, slug),
    });
    return !!existing;
}

/**
 * Generate a unique slug by appending numbers if necessary
 */
async function generateUniqueSlug(name: string): Promise<string> {
    let slug = generateSlug(name);
    let counter = 1;

    while (await isSlugTaken(slug)) {
        slug = `${generateSlug(name)}-${counter}`;
        counter++;
    }

    return slug;
}

interface CreateStoreInput {
    storeName: string;
    templateId: string;
    currency: string;
    notifications: {
        whatsapp: boolean;
        email: boolean;
    };
    whatsappPhone?: string;
    bio?: string;
}

interface CreateStoreResult {
    success: boolean;
    store?: {
        id: string;
        slug: string;
        name: string;
    };
    error?: string;
}

/**
 * Create a new store for the authenticated user
 */
export async function createStore(input: CreateStoreInput): Promise<CreateStoreResult> {
    try {
        // Get authenticated user from Firebase
        const userId = await getCurrentUserId();

        if (!userId) {
            return {
                success: false,
                error: 'You must be signed in to create a store',
            };
        }

        // Validate input
        if (!input.storeName || input.storeName.trim().length === 0) {
            return {
                success: false,
                error: 'Store name is required',
            };
        }

        if (!input.templateId) {
            return {
                success: false,
                error: 'Template selection is required',
            };
        }

        // Get user from database
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.clerkId, userId),
        });

        if (!user) {
            return {
                success: false,
                error: 'User not found. Please sign in again.',
            };
        }

        // Generate unique slug
        const slug = await generateUniqueSlug(input.storeName);

        // Create store
        const [newStore] = await db.insert(stores).values({
            userId: user.id,
            name: input.storeName.trim(),
            slug,
            templateId: input.templateId,
            currency: input.currency,
            notificationWhatsapp: input.notifications.whatsapp,
            whatsappPhone: input.whatsappPhone,
            notificationEmail: input.notifications.email,
            bio: input.bio,
        }).returning();

        return {
            success: true,
            store: {
                id: newStore.id,
                slug: newStore.slug,
                name: newStore.name,
            },
        };
    } catch (error) {
        console.error('Error creating store:', error);
        return {
            success: false,
            error: 'Failed to create store. Please try again.',
        };
    }
}

/**
 * Get all stores for the authenticated user
 */
export async function getUserStores() {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return {
                success: false,
                error: 'You must be signed in',
                stores: [],
            };
        }

        // Get user from database
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.clerkId, userId),
        });

        if (!user) {
            return {
                success: false,
                error: 'User not found. Please sign in again.',
                stores: [],
            };
        }

        // Get all stores for this user
        const userStores = await db.query.stores.findMany({
            where: (stores, { eq }) => eq(stores.userId, user.id),
            orderBy: (stores, { desc }) => [desc(stores.createdAt)],
        });

        return {
            success: true,
            stores: userStores.map(store => ({
                id: store.id,
                name: store.name,
                slug: store.slug,
            })),
        };
    } catch (error) {
        console.error('Error fetching user stores:', error);
        return {
            success: false,
            error: 'Failed to fetch stores',
            stores: [],
        };
    }
}
