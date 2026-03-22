import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { stores } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import CheckoutClient from '@/components/checkout/CheckoutClient';
import { getPaymentMethodsByStoreSlug } from '@/lib/actions/payment-methods';

interface CheckoutPageProps {
    params: Promise<{
        storeSlug: string;
    }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
    const { storeSlug } = await params;

    // Fetch store details
    const store = await db.query.stores.findFirst({
        where: eq(stores.slug, storeSlug),
    });

    if (!store) {
        notFound();
    }

    // Fetch available payment methods
    const paymentMethodsResult = await getPaymentMethodsByStoreSlug(storeSlug);
    const paymentMethods = paymentMethodsResult.success ? paymentMethodsResult.methods : [];

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Header */}
            <header className="bg-white border-b-2 border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Checkout</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Progress Indicator */}
                <CheckoutProgress currentStep="checkout" />

                <CheckoutClient
                    storeSlug={storeSlug}
                    storeCurrency={store.currency}
                    deliveryCost={store.deliveryCost || '10.00'}
                    paymentMethods={paymentMethods}
                />
            </main>
        </div>
    );
}
