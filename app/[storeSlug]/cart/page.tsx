import { getStoreBySlug } from '@/lib/actions/storefront';
import { notFound } from 'next/navigation';
import StoreHeader from '@/components/storefront/StoreHeader';
import CartPageContent from '@/components/storefront/CartPageContent';

interface CartPageProps {
    params: Promise<{ storeSlug: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
    const { storeSlug } = await params;

    // Fetch store data
    const storeResult = await getStoreBySlug(storeSlug);

    if (!storeResult.success || !storeResult.store) {
        notFound();
    }

    const store = storeResult.store;

    return (
        <div className="min-h-screen bg-gray-50">
            <StoreHeader store={store} />
            <CartPageContent store={store} />
        </div>
    );
}
