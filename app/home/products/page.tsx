import Link from 'next/link';
import { getProducts } from '@/lib/actions/product';
import ProductsTable from '@/components/products/ProductsTable';
import { getSelectedStoreId } from '@/lib/utils/store-selection';
import { getSubscriptionStatus } from '@/lib/actions/subscription';

interface ProductsPageProps {
    searchParams: Promise<{ store?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams;

    // Get selected store from URL or default to first store
    const storeId = await getSelectedStoreId(params);

    const productsResult = storeId ? await getProducts(storeId) : { success: false, products: [] };
    const products = productsResult.success ? productsResult.products : [];

    // Check subscription status for view-only mode
    const subscriptionStatus = await getSubscriptionStatus();
    const canEdit = subscriptionStatus?.hasAccess || false;

    return (
        <div className="w-full h-full">
            {/* Products Header */}
            <div className="mb-6 md:mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h1 className="text-[26px] font-normal text-black">Food</h1>
                </div>
                {canEdit ? (
                    <Link href="/home/products/new">
                        <button className="px-6 py-2.5 bg-[#4E44FD] text-white rounded-lg font-medium text-sm hover:bg-[#5B52FF] transition-all">
                            Add Food
                        </button>
                    </Link>
                ) : (
                    <Link href="/plans">
                        <button className="px-6 py-2.5 bg-gray-300 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-400 transition-all">
                            🔒 Upgrade to Add Food
                        </button>
                    </Link>
                )}
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <ProductsTable products={products} />
            </div>
        </div>
    );
}
