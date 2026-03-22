'use server';

import { db } from '@/lib/db';
import { products, orders, productImages, orderItems } from '@/lib/db/schema';
import { eq, and, gte, desc, sum, count, sql } from 'drizzle-orm';

export type DateRange = 'today' | 'week' | 'month' | 'all';

/**
 * Get date range for filtering
 */
function getDateRangeFilter(range: DateRange): Date | null {
    const now = new Date();

    switch (range) {
        case 'today':
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            return today;

        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            weekAgo.setHours(0, 0, 0, 0);
            return weekAgo;

        case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            monthAgo.setHours(0, 0, 0, 0);
            return monthAgo;

        case 'all':
        default:
            return null;
    }
}

/**
 * Get store analytics (visitors, orders, sales)
 */
export async function getStoreAnalytics(storeId: string, dateRange: DateRange = 'all') {
    try {
        const startDate = getDateRangeFilter(dateRange);

        // 1. Daily Visitors (sum of product views)
        const visitorsQuery = db
            .select({ total: sum(products.viewCount) })
            .from(products)
            .where(eq(products.storeId, storeId));

        const visitorsResult = await visitorsQuery;
        const dailyVisitors = parseInt(visitorsResult[0]?.total || '0');

        // 2. Total Orders (all orders)
        const ordersConditions = [
            eq(orders.storeId, storeId),
            // Removed status filter to include all orders
        ];

        if (startDate) {
            ordersConditions.push(gte(orders.createdAt, startDate));
        }

        const ordersResult = await db
            .select({ count: count() })
            .from(orders)
            .where(and(...ordersConditions));

        const totalOrders = ordersResult[0]?.count || 0;

        // 3. Total Sales (sum of all order amounts)
        const salesResult = await db
            .select({ total: sum(orders.totalAmount) })
            .from(orders)
            .where(and(...ordersConditions));

        const totalSales = parseFloat(salesResult[0]?.total || '0');

        return {
            success: true,
            data: {
                dailyVisitors,
                totalOrders,
                totalSales,
            },
        };
    } catch (error) {
        console.error('Error fetching store analytics:', error);
        return {
            success: false,
            error: 'Failed to fetch analytics',
            data: {
                dailyVisitors: 0,
                totalOrders: 0,
                totalSales: 0,
            },
        };
    }
}

/**
 * Get top products by sales
 */
export async function getTopProducts(storeId: string, limit = 5, dateRange: DateRange = 'all') {
    try {
        const startDate = getDateRangeFilter(dateRange);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Since we now use order_items, we need to query differently
        // Get products with their sales through order_items
        const topProductsQuery = db
            .select({
                id: products.id,
                name: products.name,
                image: productImages.imageUrl,
                inventory: products.inventory,
            })
            .from(products)
            .leftJoin(productImages, and(
                eq(products.id, productImages.productId),
                eq(productImages.isPrimary, true)
            ))
            .where(eq(products.storeId, storeId));

        const allProducts = await topProductsQuery;

        // For each product, calculate sales from order_items
        const productsWithSales = await Promise.all(
            allProducts.map(async (product) => {

                const salesQuery = db
                    .select({
                        totalOrders: count(orderItems.id),
                        totalSales: sum(orderItems.subtotal),
                    })
                    .from(orderItems)
                    .innerJoin(orders, eq(orderItems.orderId, orders.id))
                    .where(
                        and(
                            eq(orderItems.productId, product.id),
                            eq(orders.storeId, storeId),
                            startDate ? gte(orders.createdAt, startDate) : undefined
                        )
                    );

                const salesResult = await salesQuery;
                const totalSales = parseFloat(salesResult[0]?.totalSales || '0');
                const totalOrders = salesResult[0]?.totalOrders || 0;

                // Get today's sales
                const todaySalesQuery = db
                    .select({
                        todaySales: sum(orderItems.subtotal),
                    })
                    .from(orderItems)
                    .innerJoin(orders, eq(orderItems.orderId, orders.id))
                    .where(
                        and(
                            eq(orderItems.productId, product.id),
                            eq(orders.storeId, storeId),
                            gte(orders.createdAt, today)
                        )
                    );

                const todayResult = await todaySalesQuery;
                const todaySales = parseFloat(todayResult[0]?.todaySales || '0');

                return {
                    ...product,
                    totalOrders,
                    totalSales,
                    todaySales,
                };
            })
        );

        // Filter products with sales > 0 and sort by total sales
        const topProducts = productsWithSales
            .filter(p => p.totalSales > 0)
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, limit);

        return {
            success: true,
            products: topProducts,
        };
    } catch (error) {
        console.error('Error fetching top products:', error);
        return {
            success: false,
            error: 'Failed to fetch top products',
            products: [],
        };
    }
}

/**
 * Increment product view count
 */
export async function incrementProductViews(productId: string) {
    try {
        await db
            .update(products)
            .set({
                viewCount: sql`${products.viewCount} + 1`,
            })
            .where(eq(products.id, productId));

        return { success: true };
    } catch (error) {
        console.error('Error incrementing product views:', error);
        return {
            success: false,
            error: 'Failed to update view count',
        };
    }
}
