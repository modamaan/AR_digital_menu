import { getUserStores } from '@/lib/actions/store';

/**
 * Get the selected store ID from search params or default to the first store
 * @param searchParams - URL search parameters containing optional store ID
 * @returns The selected store ID or null if no stores exist
 */
export async function getSelectedStoreId(
    searchParams: { store?: string }
): Promise<string | null> {
    const storesResult = await getUserStores();

    if (!storesResult.success || !storesResult.stores || storesResult.stores.length === 0) {
        return null;
    }

    const stores = storesResult.stores;

    // If a store ID is provided in the URL, validate it exists
    if (searchParams.store) {
        const storeExists = stores.some(store => store.id === searchParams.store);
        if (storeExists) {
            return searchParams.store;
        }
    }

    // Default to the first store
    return stores[0].id;
}

/**
 * Get all user stores
 * @returns Array of stores or empty array if none exist
 */
export async function getAllStores() {
    const storesResult = await getUserStores();
    return storesResult.success && storesResult.stores ? storesResult.stores : [];
}
