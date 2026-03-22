'use server';

import { db } from '@/lib/db';
import { products, productImages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, formData: FormData) {
    try {
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: formData.get('price') as string,
            discount: formData.get('discount') as string || '0',
            inventory: formData.get('inventory') as string,
            categoryId: formData.get('categoryId') as string || null,
            images: JSON.parse(formData.get('images') as string || '[]'),
            existingImages: JSON.parse(formData.get('existingImages') as string || '[]'),
            glbUrl: formData.get('glbUrl') as string || null,
        };

        if (data.glbUrl && !data.glbUrl.startsWith('http') && !data.glbUrl.startsWith('/')) {
            const modalBaseUrl = process.env.MODAL_SERVE_BASE_URL || 'https://aitester876--hunyuan3d-image-to-3d-serve-glb.modal.run';
            data.glbUrl = `${modalBaseUrl.replace(/\/$/, '')}/?filename=${data.glbUrl}`;
        }

        // Update product details
        const [updatedProduct] = await db
            .update(products)
            .set({
                name: data.name,
                description: data.description || null,
                price: data.price,
                discount: data.discount,
                inventory: parseInt(data.inventory),
                categoryId: data.categoryId || null,
                glbUrl: data.glbUrl || null,
                updatedAt: new Date(),
            })
            .where(eq(products.id, productId))
            .returning();

        if (!updatedProduct) {
            return {
                success: false,
                error: 'Product not found',
            };
        }

        // Handle image updates
        if (data.images.length > 0 || data.existingImages.length > 0) {
            // Delete old images
            await db.delete(productImages).where(eq(productImages.productId, productId));

            // Add existing images back
            const allImages = [...data.existingImages, ...data.images];

            if (allImages.length > 0) {
                await db.insert(productImages).values(
                    allImages.map((imageUrl: string, index: number) => ({
                        productId: updatedProduct.id,
                        imageUrl,
                        isPrimary: index === 0,
                        displayOrder: index,
                    }))
                );
            }
        }

        // Revalidate products pages
        revalidatePath('/home/products');
        revalidatePath(`/home/products/${productId}/edit`);

        return {
            success: true,
            product: updatedProduct,
            message: 'Product updated successfully',
        };
    } catch (error) {
        console.error('Error updating product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update product',
        };
    }
}
