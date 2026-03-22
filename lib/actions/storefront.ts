'use server';

import { db } from '@/lib/db';
import { stores, products, productImages } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Get store by slug (for customer storefront)
 */
export async function getStoreBySlug(slug: string) {
    try {
        const store = await db.query.stores.findFirst({
            where: eq(stores.slug, slug),
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
                currency: store.currency,
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

/**
 * Get all active products for a store (for customer storefront)
 */
export async function getStoreProducts(storeId: string) {
    try {
        const storeProducts = await db.query.products.findMany({
            where: and(
                eq(products.storeId, storeId),
                eq(products.status, 'active')
            ),
            with: {
                images: {
                    orderBy: [desc(productImages.isPrimary), productImages.displayOrder],
                },
            },
            orderBy: [desc(products.createdAt)],
        });

        return {
            success: true,
            products: storeProducts,
        };
    } catch (error) {
        console.error('Error fetching store products:', error);
        return {
            success: false,
            error: 'Failed to fetch products',
            products: [],
        };
    }
}

/**
 * Get single product details (for product detail page)
 */
export async function getProductById(productId: string, storeId: string) {
    try {
        const product = await db.query.products.findFirst({
            where: and(
                eq(products.id, productId),
                eq(products.storeId, storeId),
                eq(products.status, 'active')
            ),
            with: {
                images: {
                    orderBy: [desc(productImages.isPrimary), productImages.displayOrder],
                },
            },
        });

        if (!product) {
            return {
                success: false,
                error: 'Product not found',
                product: null,
            };
        }

        return {
            success: true,
            product,
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        return {
            success: false,
            error: 'Failed to fetch product',
            product: null,
        };
    }
}

/**
 * Search products in a store
 */
export async function searchProducts(storeId: string, query: string) {
    try {
        // Simple search - can be enhanced with full-text search later
        const results = await db.query.products.findMany({
            where: and(
                eq(products.storeId, storeId),
                eq(products.status, 'active')
            ),
            with: {
                images: {
                    where: eq(productImages.isPrimary, true),
                    limit: 1,
                },
            },
        });

        // Filter by query on client side for now
        const filtered = results.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
        );

        return {
            success: true,
            products: filtered,
        };
    } catch (error) {
        console.error('Error searching products:', error);
        return {
            success: false,
            error: 'Failed to search products',
            products: [],
        };
    }
}
