import { getStoreBySlug, getStoreProducts } from '@/lib/actions/storefront';
import { getCategoriesByStoreSlug } from '@/lib/actions/menu-categories';
import { notFound } from 'next/navigation';
import MenuPageClient from '@/components/storefront/MenuPageClient';

interface StorePageProps {
    params: Promise<{ storeSlug: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
    const { storeSlug } = await params;

    // Fetch store data
    const storeResult = await getStoreBySlug(storeSlug);

    if (!storeResult.success || !storeResult.store) {
        notFound();
    }

    const store = storeResult.store;

    // Fetch products
    const productsResult = await getStoreProducts(store.id);
    const products = productsResult.success ? productsResult.products : [];

    // Fetch menu categories
    const categoriesResult = await getCategoriesByStoreSlug(storeSlug);
    const categories = categoriesResult.success ? categoriesResult.categories : [];

    return <MenuPageClient store={store} products={products} categories={categories} />;
}
