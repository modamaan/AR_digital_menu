'use server';

import { db } from '@/lib/db';
import { products, productImages, type Product, type ProductImage } from '@/lib/db/schema';
import { productSchema, productStatusSchema } from '@/lib/validations/product';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Create a new product
 */
export async function createProduct(formData: FormData) {
    try {
        // Extract form data
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: formData.get('price') as string,
            discount: formData.get('discount') as string || '0',
            inventory: formData.get('inventory') as string,
            storeId: formData.get('storeId') as string,
            categoryId: formData.get('categoryId') as string || null,
            images: JSON.parse(formData.get('images') as string || '[]'),
            glbUrl: formData.get('glbUrl') as string || null,
        };

        if (data.glbUrl && !data.glbUrl.startsWith('http') && !data.glbUrl.startsWith('/')) {
            const modalBaseUrl = process.env.MODAL_SERVE_BASE_URL || 'https://aitester876--hunyuan3d-image-to-3d-serve-glb.modal.run';
            data.glbUrl = `${modalBaseUrl.replace(/\/$/, '')}/?filename=${data.glbUrl}`;
        }

        // Validate data
        const validatedData = productSchema.parse(data);

        // Create product
        const [newProduct] = await db.insert(products).values({
            storeId: validatedData.storeId,
            categoryId: validatedData.categoryId || null,
            name: validatedData.name,
            description: validatedData.description || null,
            price: validatedData.price,
            discount: validatedData.discount || '0',
            inventory: parseInt(validatedData.inventory),
            status: 'active',
            glbUrl: data.glbUrl || null,
        }).returning();

        // Create product images
        if (validatedData.images.length > 0) {
            await db.insert(productImages).values(
                validatedData.images.map((imageUrl, index) => ({
                    productId: newProduct.id,
                    imageUrl,
                    isPrimary: index === 0,
                    displayOrder: index,
                }))
            );
        }

        // Revalidate products page
        revalidatePath('/home/products');

        return {
            success: true,
            product: newProduct,
            message: 'Product created successfully',
        };
    } catch (error) {
        console.error('Error creating product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create product',
        };
    }
}

/**
 * Get all products for a store
 */
export async function getProducts(storeId: string) {
    try {
        const storeProducts = await db.query.products.findMany({
            where: eq(products.storeId, storeId),
            with: {
                images: {
                    orderBy: (images, { asc }) => [asc(images.displayOrder)],
                },
            },
            orderBy: [desc(products.createdAt)],
        });

        return {
            success: true,
            products: storeProducts,
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            success: false,
            error: 'Failed to fetch products',
            products: [],
        };
    }
}

/**
 * Update product status (active/disabled)
 */
export async function updateProductStatus(productId: string, status: 'active' | 'disabled') {
    try {
        // Validate input
        const validatedData = productStatusSchema.parse({ id: productId, status });

        // Update product status
        const [updatedProduct] = await db
            .update(products)
            .set({
                status: validatedData.status,
                updatedAt: new Date(),
            })
            .where(eq(products.id, validatedData.id))
            .returning();

        if (!updatedProduct) {
            return {
                success: false,
                error: 'Product not found',
            };
        }

        // Revalidate products page
        revalidatePath('/home/products');

        return {
            success: true,
            product: updatedProduct,
            message: `Product ${status === 'active' ? 'activated' : 'disabled'} successfully`,
        };
    } catch (error) {
        console.error('Error updating product status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update product status',
        };
    }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
    try {
        // Delete product (images will be cascade deleted)
        await db.delete(products).where(eq(products.id, productId));

        // Revalidate products page
        revalidatePath('/home/products');

        return {
            success: true,
            message: 'Product deleted successfully',
        };
    } catch (error) {
        console.error('Error deleting product:', error);
        return {
            success: false,
            error: 'Failed to delete product',
        };
    }
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string) {
    try {
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
            with: {
                images: {
                    orderBy: (images, { asc }) => [asc(images.displayOrder)],
                },
            },
        });

        if (!product) {
            return {
                success: false,
                error: 'Product not found',
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
        };
    }
}
