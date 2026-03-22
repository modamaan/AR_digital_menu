import { ReactNode } from 'react';
import { CartProvider } from '@/lib/context/CartContext';
import { getStoreBySlug } from '@/lib/actions/storefront';
import type { Metadata } from 'next';

interface StoreLayoutProps {
    children: ReactNode;
    params: Promise<{ storeSlug: string }>;
}

export async function generateMetadata(
    { params }: { params: Promise<{ storeSlug: string }> }
): Promise<Metadata> {
    const { storeSlug } = await params;
    const { store } = await getStoreBySlug(storeSlug);

    if (!store) {
        return {
            title: 'Store Not Found',
        };
    }

    const metadata: Metadata = {
        title: store.name,
        description: store.bio || `Welcome to ${store.name}`,
    };

    if (store.profileImage) {
        metadata.icons = {
            icon: store.profileImage,
        };
    }

    return metadata;
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
    const { storeSlug } = await params;

    return (
        <CartProvider storeSlug={storeSlug}>
            {children}
        </CartProvider>
    );
}
