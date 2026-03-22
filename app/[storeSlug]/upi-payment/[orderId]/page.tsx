import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { orders, stores } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import UpiPaymentClient from '@/components/checkout/UpiPaymentClient';
import { getStoreUpiDetails } from '@/lib/actions/order-payment';

interface UpiPaymentPageProps {
    params: Promise<{
        storeSlug: string;
        orderId: string;
    }>;
}

export default async function UpiPaymentPage({ params }: UpiPaymentPageProps) {
    const { storeSlug, orderId } = await params;

    // Get order details
    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
    });

    if (!order) {
        notFound();
    }

    // Check if order uses UPI payment
    if (order.paymentMethod !== 'upi') {
        notFound();
    }

    // Check if payment already completed
    if (order.paymentStatus === 'paid') {
        // Redirect to order confirmation
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Already Completed</h2>
                    <p className="text-gray-600 mb-6">This order has already been paid.</p>
                    <a
                        href={`/${storeSlug}/order-confirmation/${orderId}`}
                        className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
                    >
                        View Order Details
                    </a>
                </div>
            </div>
        );
    }

    // Get store UPI details
    const upiResult = await getStoreUpiDetails(storeSlug);

    if (!upiResult.success || !upiResult.upiDetails) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">UPI Not Available</h2>
                    <p className="text-gray-600">UPI payment is not configured for this store.</p>
                </div>
            </div>
        );
    }

    const totalAmount = parseFloat(order.totalAmount);

    return (
        <UpiPaymentClient
            orderId={orderId}
            storeSlug={storeSlug}
            upiDetails={upiResult.upiDetails}
            orderAmount={totalAmount}
            orderNumber={orderId.slice(0, 8).toUpperCase()}
        />
    );
}
