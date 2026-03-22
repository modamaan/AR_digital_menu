import { Suspense } from 'react';
import { getOrders } from '@/lib/actions/order';
import OrdersTable from '@/components/orders/OrdersTable';
import StatusFilterTabs from '@/components/orders/StatusFilterTabs';
import RefreshButton from '@/components/orders/RefreshButton';
import { getSelectedStoreId } from '@/lib/utils/store-selection';

interface OrdersPageProps {
    searchParams: Promise<{ status?: string; store?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    const params = await searchParams;
    const status = params.status || 'all';

    // Get selected store from URL or default to first store
    const storeId = await getSelectedStoreId(params);

    if (!storeId) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Please create a store first.</p>
            </div>
        );
    }

    // Fetch orders
    const { orders } = await getOrders(storeId, status);

    return (
        <div className="w-full h-full">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h1 className="text-[26px] font-normal text-black">Orders</h1>
                    </div>
                    <RefreshButton />
                </div>

                {/* Status Filters */}
                <StatusFilterTabs />
            </div>

            {/* Orders List */}
            <Suspense fallback={<div className="text-center py-10">Loading orders...</div>}>
                <OrdersTable orders={orders || []} />
            </Suspense>
        </div>
    );
}
