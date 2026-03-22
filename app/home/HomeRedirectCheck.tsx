import { getUserStores } from '@/lib/actions/store';
import { ensureUserExists } from '@/lib/actions/user';
import { redirect } from 'next/navigation';

/**
 * Server component that checks if user has stores
 * Redirects to /create if no stores exist
 */
export default async function HomeRedirectCheck({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auto-create user in DB if signing in for the first time
    try {
        await ensureUserExists();
    } catch (error) {
        console.error('[HomeRedirectCheck] Error ensuring user exists:', error);
    }

    const storesResult = await getUserStores();

    // Redirect to create page if user has no stores
    if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
        redirect('/create');
    }

    return <>{children}</>;
}
