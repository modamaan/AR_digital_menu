'use client';

import { useState, useCallback } from 'react';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';

interface CheckoutClientProps {
    storeSlug: string;
    storeCurrency: string;
    deliveryCost: string;
    paymentMethods: any[];
}

export default function CheckoutClient({ storeSlug, storeCurrency, deliveryCost, paymentMethods }: CheckoutClientProps) {
    const [submitFn, setSubmitFn] = useState<(() => void) | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Memoize callbacks to prevent infinite loops
    const handleSubmitReady = useCallback((fn: () => void) => {
        setSubmitFn(() => fn);
    }, []);

    const handleErrorChange = useCallback((err: string | null) => {
        setError(err);
    }, []);

    const handleSubmittingChange = useCallback((submitting: boolean) => {
        setIsSubmitting(submitting);
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
            {/* Left: Checkout Form */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CheckoutForm
                    storeSlug={storeSlug}
                    storeCurrency={storeCurrency}
                    deliveryCost={deliveryCost}
                    paymentMethods={paymentMethods}
                    onSubmitReady={handleSubmitReady}
                    onErrorChange={handleErrorChange}
                    onSubmittingChange={handleSubmittingChange}
                />
            </div>

            {/* Right: Order Summary (Visible on all devices) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <OrderSummary
                    shippingCost={0} // This will be updated dynamically by the form
                    currency={storeCurrency}
                    onCheckout={submitFn || undefined}
                    isSubmitting={isSubmitting}
                    error={error}
                />
            </div>
        </div>
    );
}
