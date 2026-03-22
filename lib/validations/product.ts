import { z } from 'zod';

/**
 * Product validation schema
 */
export const productSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(255, 'Product name is too long'),
    description: z.string().optional(),
    price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Price must be a positive number',
    }),
    discount: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
    }, {
        message: 'Discount must be between 0 and 100',
    }).optional(),
    inventory: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
        message: 'Inventory must be a non-negative number',
    }),
    storeId: z.string().uuid('Invalid store ID'),
    categoryId: z.string().uuid('Invalid category ID').nullable().optional(),
    images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').max(4, 'Maximum 4 images allowed'),
});

/**
 * Product update schema (all fields optional except id)
 */
export const productUpdateSchema = z.object({
    id: z.string().uuid('Invalid product ID'),
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0).optional(),
    discount: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
    }).optional(),
    inventory: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0).optional(),
    status: z.enum(['active', 'disabled']).optional(),
});

/**
 * Product status update schema
 */
export const productStatusSchema = z.object({
    id: z.string().uuid('Invalid product ID'),
    status: z.enum(['active', 'disabled']),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;
export type ProductStatusData = z.infer<typeof productStatusSchema>;
