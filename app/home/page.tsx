import { getStoreAnalytics, getTopProducts, type DateRange } from '@/lib/actions/analytics';
import AnalyticsCard from '@/components/home/AnalyticsCard';
import TopProductsTable from '@/components/home/TopProductsTable';
import DateRangeFilter from '@/components/home/DateRangeFilter';
import { getSelectedStoreId } from '@/lib/utils/store-selection';
import { redirect } from 'next/navigation';

interface HomePageProps {
    searchParams: Promise<{ range?: DateRange; store?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
    const params = await searchParams;
    const dateRange = params.range || 'all';

    // Get selected store from URL or default to first store
    const storeId = await getSelectedStoreId(params);

    // Redirect immediately if no stores exist
    if (!storeId) {
        redirect('/create');
    }

    // Fetch analytics data
    const analytics = await getStoreAnalytics(storeId, dateRange);
    const topProductsResult = await getTopProducts(storeId, 5, dateRange);

    const analyticsData = analytics?.data || { dailyVisitors: 0, totalOrders: 0, totalSales: 0 };
    const topProducts = topProductsResult?.products || [];

    return (
        <div className="w-full h-full">
            {/* Overview Header with Date Filter */}
            <div className="mb-4 sm:mb-6 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-normal text-black">Overview</h1>
                </div>

                {/* Date Range Filter */}
                <DateRangeFilter />
            </div>

            {/* White Container with Analytics and Top Products */}
            <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    {/* Daily Visitors */}
                    <AnalyticsCard
                        title="Product Views"
                        value={analyticsData.dailyVisitors.toLocaleString()}
                        icon={
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        }
                    />

                    {/* Total Orders */}
                    <AnalyticsCard
                        title="Total Orders"
                        value={analyticsData.totalOrders.toLocaleString()}
                        icon={
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        }
                    />

                    {/* Total Sales */}
                    <AnalyticsCard
                        title="Total Sales"
                        value={`$${analyticsData.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Top Products Section */}
                <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Top Products</h2>
                    <TopProductsTable products={topProducts} />
                </div>
            </div>
        </div>
    );
}
