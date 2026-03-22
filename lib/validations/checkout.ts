import { z } from 'zod';

/**
 * Shipping address schema
 */
export const shippingAddressSchema = z.object({
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
});

/**
 * Checkout form schema
 */
export const checkoutFormSchema = z.object({
    // Customer details
    customerName: z.string().min(1, 'Name is required'),
    customerEmail: z.string().email('Invalid email address'),
    customerPhone: z.string().min(1, 'Phone number is required'),
    countryCode: z.string().min(1, 'Country code is required'),

    // Shipping method
    shippingMethod: z.enum(['pickup', 'delivery']),

    // Shipping address (conditional - required only for delivery)
    shippingAddress: shippingAddressSchema.optional(),

    // Payment method
    paymentMethod: z.enum(['cod', 'razorpay', 'upi']),
}).refine(
    (data) => {
        // If delivery is selected, shipping address is required
        if (data.shippingMethod === 'delivery') {
            return data.shippingAddress !== undefined;
        }
        return true;
    },
    {
        message: 'Shipping address is required for delivery',
        path: ['shippingAddress'],
    }
);

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
