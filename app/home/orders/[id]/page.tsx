import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getOrderDetails } from '@/lib/actions/order';
import OrderStatusDropdown from '@/components/orders/OrderStatusDropdown';
import OrderActionButtons from '@/components/orders/OrderActionButtons';
import { format } from 'date-fns';

interface OrderDetailsPageProps {
    params: Promise<{ id: string }>;
}

function getStatusDisplayText(status: string): string {
    const statusMap: Record<string, string> = {
        'pending': 'Order Pending',
        'new_order': 'New Order',
        'order_confirmed': 'Order Confirmed',
        'payment_confirmed': 'Payment Confirmed',
        'packed': 'Order Packed',
        'shipped': 'Order Shipped',
        'delivered': 'Order Delivered',
        'cancelled': 'Order Cancelled',
    };
    return statusMap[status] || 'Status Updated';
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
    const { id } = await params;
    const result = await getOrderDetails(id);

    if (!result.success || !result.order) {
        notFound();
    }

    const { order } = result;
    const orderItems = order.orderItems ?? [];

    // Calculate subtotal from all items
    const subtotal = orderItems.reduce(
        (sum, item) => sum + parseFloat(item.subtotal),
        0
    );
    const shippingCost = parseFloat(order.shippingCost || '0');

    return (
        <div className="w-full h-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href="/home/orders">
                        <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Order #{order.id.slice(0, 8)}</h1>
                        <span className="text-xs sm:text-sm text-gray-500 block mt-1">
                            {format(new Date(order.createdAt), 'dd MMMM yyyy, h:mm a')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <OrderActionButtons orderId={order.id} currentStatus={order.status} />
                    <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Items Card */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6 lg:p-8">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Order Items</h2>

                        <div className="space-y-4">
                            {orderItems.length === 0 ? (
                                <p className="text-gray-500 text-sm">No items found.</p>
                            ) : orderItems.map((item) => {
                                const primaryImage =
                                    item.product?.images?.find(img => img.isPrimary)?.imageUrl ||
                                    item.product?.images?.[0]?.imageUrl;
                                return (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
                                            {primaryImage ? (
                                                <Image
                                                    src={primaryImage}
                                                    alt={item.product?.name || 'Product'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 text-base sm:text-lg">{item.product?.name}</h3>
                                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap mt-1">
                                                <span>Qty: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>Price: <span className="font-medium text-gray-900">${parseFloat(item.unitPrice).toFixed(2)}</span></span>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0">
                                            <span className="text-base sm:text-lg font-semibold text-gray-900">
                                                ${parseFloat(item.subtotal).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-gray-600">
                                    Shipping ({order.shippingMethod === 'delivery' ? 'Delivery' : 'Pickup'})
                                </span>
                                <span className="font-medium text-gray-900">
                                    {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'FREE'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-gray-600">Payment Method</span>
                                <span className="font-medium text-gray-900 capitalize">
                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                                </span>
                            </div>
                            <div className="pt-2 sm:pt-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-semibold text-gray-900 text-sm sm:text-base">Total</span>
                                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                    ${parseFloat(order.totalAmount).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6 lg:p-8">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Order Timeline</h2>
                        <div className="space-y-4 sm:space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            <div className="relative pl-8 sm:pl-10">
                                <span className="absolute left-1 top-1.5 w-5 h-5 rounded-full border-4 border-white bg-[#4E44FD] ring-4 ring-[#4E44FD]/10"></span>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">Order Placed</p>
                                <p className="text-xs text-gray-500">{format(new Date(order.createdAt), 'MMM dd, h:mm a')}</p>
                            </div>
                            {order.updatedAt > order.createdAt && (
                                <div className="relative pl-8 sm:pl-10">
                                    <span className={`absolute left-1 top-1.5 w-5 h-5 rounded-full border-4 border-white ${order.status === 'cancelled'
                                        ? 'bg-red-500 ring-4 ring-red-500/10'
                                        : order.status === 'delivered'
                                            ? 'bg-green-500 ring-4 ring-green-500/10'
                                            : order.status === 'shipped'
                                                ? 'bg-blue-500 ring-4 ring-blue-500/10'
                                                : 'bg-gray-300'
                                        }`}></span>
                                    <p className="text-xs sm:text-sm font-medium text-gray-900">{getStatusDisplayText(order.status)}</p>
                                    <p className="text-xs text-gray-500">{format(new Date(order.updatedAt), 'MMM dd, h:mm a')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Customer Card */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6">
                        <h2 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4">Customer</h2>
                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {order.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{order.customerName}</p>
                                <p className="text-xs text-gray-500">{orderItems.length} item{orderItems.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-600">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" />
                                </svg>
                                <span className="break-all">{order.customerEmail}</span>
                            </div>
                            {order.customerPhone && (
                                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-600">
                                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="break-all">{order.customerPhone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingMethod === 'delivery' && order.shippingAddress && (() => {
                        try {
                            const addr = JSON.parse(order.shippingAddress);
                            return (
                                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6">
                                    <h2 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Delivery Address</h2>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p>{addr.addressLine1}</p>
                                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                        <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                                    </div>
                                </div>
                            );
                        } catch { return null; }
                    })()}
                </div>
            </div>
        </div>
    );
}
