import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface OrderConfirmationPageProps {
    params: Promise<{
        storeSlug: string;
        orderId: string;
    }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
    const { storeSlug, orderId } = await params;

    // Fetch order with store + orderItems (each item has its product)
    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: {
            store: true,
            orderItems: {
                with: {
                    product: true,
                },
            },
        },
    });

    if (!order || order.store.slug !== storeSlug) {
        notFound();
    }

    const orderNumber = orderId.slice(0, 8).toUpperCase();

    // Parse shipping address if exists
    const shippingAddress = order.shippingAddress
        ? JSON.parse(order.shippingAddress)
        : null;

    // Currency symbol
    const getCurrencySymbol = (curr: string) => {
        const symbols: Record<string, string> = {
            USD: '$', INR: '₹', EUR: '€', GBP: '£',
        };
        return symbols[curr] || curr;
    };

    const symbol = getCurrencySymbol(order.store.currency);

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-5">
            <div className="max-w-xl w-full text-center py-12 animate-in zoom-in duration-500">

                {/* Success Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3 flex items-center justify-center gap-3">
                    Order Placed Successfully! <span className="text-4xl">🎉</span>
                </h1>
                <p className="text-gray-600 mb-10">
                    Thank you for your order. We&apos;ll send you a confirmation shortly.
                </p>

                {/* Order Number Box */}
                <div className="mb-8 p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Order Number</div>
                    <div className="text-2xl font-bold text-[#4E44FD] font-mono">{orderNumber}</div>
                </div>

                {/* Order Details */}
                <div className="mb-8 p-6 bg-white border-2 border-gray-200 rounded-2xl text-left space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>

                    {/* Items list */}
                    <div className="space-y-3 text-sm">
                        {order.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between">
                                <span className="text-gray-600">
                                    {item.product.name}
                                    <span className="text-gray-400 ml-1">×{item.quantity}</span>
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {symbol}{parseFloat(item.subtotal).toFixed(2)}
                                </span>
                            </div>
                        ))}

                        {/* Shipping */}
                        <div className="flex justify-between pt-1">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-semibold text-gray-900">
                                {parseFloat(order.shippingCost || '0') === 0 ? (
                                    <span className="text-green-600">FREE</span>
                                ) : (
                                    `${symbol}${parseFloat(order.shippingCost || '0').toFixed(2)}`
                                )}
                            </span>
                        </div>

                        {/* Total */}
                        <div className="border-t-2 border-gray-100 pt-3 flex justify-between text-base">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-gray-900">
                                {symbol}{parseFloat(order.totalAmount).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border-t-2 border-gray-100 pt-4 mt-4">
                        <h3 className="font-bold text-gray-900 mb-3">Customer Information</h3>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-gray-600">Name: </span><span className="text-gray-900">{order.customerName}</span></div>
                            <div><span className="text-gray-600">Email: </span><span className="text-gray-900">{order.customerEmail}</span></div>
                            {order.customerPhone && (
                                <div><span className="text-gray-600">Phone: </span><span className="text-gray-900">{order.customerPhone}</span></div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingMethod === 'delivery' && shippingAddress && (
                        <div className="border-t-2 border-gray-100 pt-4 mt-4">
                            <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
                            <div className="text-sm text-gray-900">
                                <p>{shippingAddress.addressLine1}</p>
                                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                            </div>
                        </div>
                    )}

                    {order.shippingMethod === 'pickup' && (
                        <div className="border-t-2 border-gray-100 pt-4 mt-4">
                            <h3 className="font-bold text-gray-900 mb-2">Pickup</h3>
                            <p className="text-sm text-gray-600">You can collect your order from the store.</p>
                        </div>
                    )}
                </div>

                {/* Continue Shopping */}
                <Link
                    href={`/${storeSlug}`}
                    className="inline-block w-full bg-[#4E44FD] hover:bg-[#3d36ca] text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-lg shadow-[#4E44FD]/20 active:scale-[0.98]"
                >
                    Continue Shopping
                </Link>

                {/* Info Box */}
                <div className="mt-6 bg-[#4E44FD]/5 border border-[#4E44FD]/10 p-4 rounded-2xl flex items-center gap-4 text-left">
                    <div className="w-8 h-8 rounded-full bg-[#4E44FD] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold font-serif italic">i</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        We&apos;ve sent a confirmation to <span className="font-semibold text-gray-900">{order.customerEmail}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
