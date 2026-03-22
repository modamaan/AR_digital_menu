import { getUserStores } from '@/lib/actions/store';
import { redirect } from 'next/navigation';
import HomeLayout from './layout';

/**
 * Root layout wrapper that checks for stores before rendering
 */
export default async function HomeLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const storesResult = await getUserStores();

    // Redirect to create page if user has no stores
    if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
        redirect('/create');
    }

    return <HomeLayout>{children}</HomeLayout>;
}
