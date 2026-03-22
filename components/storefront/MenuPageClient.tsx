'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StoreHeader from '@/components/storefront/StoreHeader';
import ModelViewerModal from '@/components/storefront/ModelViewerModal';
import { ShoppingCart, Leaf, Wheat, Flame, Box } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';

interface MenuPageClientProps {
    store: {
        id: string;
        name: string;
        slug: string;
        currency: string;
        bio: string | null;
        bannerImage: string | null;
        profileImage: string | null;
    };
    categories: Array<{
        id: string;
        name: string;
        description: string | null;
        icon: string | null;
        displayOrder: number;
    }>;
    products: Array<{
        id: string;
        name: string;
        price: string;
        description?: string | null;
        categoryId?: string | null;
        isVegetarian?: boolean | null;
        isVegan?: boolean | null;
        isGlutenFree?: boolean | null;
        spiceLevel?: string | null;
        preparationTime?: number | null;
        isAvailable?: boolean | null;
        glbUrl?: string | null;
        images: Array<{
            imageUrl: string;
            isPrimary: boolean;
        }>;
    }>;
}

export default function MenuPageClient({ store, categories, products }: MenuPageClientProps) {
    const searchParams = useSearchParams();
    const tableNumber = searchParams.get('table');
    const { addItem, items, itemCount } = useCart();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'vegan' | 'gf'>('all');
    const [modalProduct, setModalProduct] = useState<(typeof products)[0] | null>(null);

    // Save table number to localStorage
    useEffect(() => {
        if (tableNumber) {
            localStorage.setItem(`table_${store.slug}`, tableNumber);
        }
    }, [tableNumber, store.slug]);

    const cartItemCount = itemCount;

    // Filter products
    const filteredProducts = products.filter((product) => {
        if (product.isAvailable === false) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                product.name.toLowerCase().includes(query) ||
                (product.description && product.description.toLowerCase().includes(query));
            if (!matchesSearch) return false;
        }
        if (selectedCategory && product.categoryId !== selectedCategory) return false;
        if (dietaryFilter === 'veg' && !product.isVegetarian) return false;
        if (dietaryFilter === 'vegan' && !product.isVegan) return false;
        if (dietaryFilter === 'gf' && !product.isGlutenFree) return false;
        return true;
    });

    const productsByCategory = categories.map(category => ({
        category,
        products: filteredProducts.filter(p => p.categoryId === category.id)
    })).filter(group => group.products.length > 0);

    const uncategorizedProducts = filteredProducts.filter(p => !p.categoryId);

    const addToCart = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
        addItem({
            productId: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: primaryImage?.imageUrl
        });
    };

    const getSpiceIcon = (level?: string) => {
        if (!level || level === 'none') return null;
        const count = level === 'mild' ? 1 : level === 'medium' ? 2 : 3;
        return (
            <div className="flex gap-0.5">
                {Array.from({ length: count }).map((_, i) => (
                    <Flame key={i} size={14} className="text-red-500 fill-red-500" />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <StoreHeader store={store} onSearch={setSearchQuery} showBanner={true} />

            {tableNumber && (
                <div className="bg-blue-600 text-white py-3 px-4 text-center font-medium">
                    🪑 Table {tableNumber} • Scan complete! Browse our menu below
                </div>
            )}

            {/* Filters Bar */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 overflow-x-auto scrollbar-hide">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${selectedCategory === null
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    All Items
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${selectedCategory === category.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {category.icon} {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
                                className={`p-2 rounded-lg transition-colors ${dietaryFilter === 'veg'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title="Vegetarian"
                            >
                                <Leaf size={20} />
                            </button>
                            <button
                                onClick={() => setDietaryFilter(dietaryFilter === 'gf' ? 'all' : 'gf')}
                                className={`p-2 rounded-lg transition-colors ${dietaryFilter === 'gf'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title="Gluten Free"
                            >
                                <Wheat size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No items found</p>
                    </div>
                ) : selectedCategory === null ? (
                    <>
                        {productsByCategory.map(({ category, products: catProducts }) => (
                            <div key={category.id} className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    {category.icon && <span className="text-3xl">{category.icon}</span>}
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                                        {category.description && (
                                            <p className="text-gray-600 text-sm">{category.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {catProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            store={store}
                                            onAddToCart={addToCart}
                                            cartQuantity={items.find(item => item.productId === product.id)?.quantity || 0}
                                            getSpiceIcon={getSpiceIcon}
                                            onOpen3D={() => setModalProduct(product)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                        {uncategorizedProducts.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Items</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {uncategorizedProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            store={store}
                                            onAddToCart={addToCart}
                                            cartQuantity={items.find(item => item.productId === product.id)?.quantity || 0}
                                            getSpiceIcon={getSpiceIcon}
                                            onOpen3D={() => setModalProduct(product)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                store={store}
                                onAddToCart={addToCart}
                                cartQuantity={items.find(item => item.productId === product.id)?.quantity || 0}
                                getSpiceIcon={getSpiceIcon}
                                onOpen3D={() => setModalProduct(product)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Cart Button */}
            {cartItemCount > 0 && (
                <Link
                    href={`/${store.slug}/cart`}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-3 font-semibold z-50"
                >
                    <ShoppingCart size={24} />
                    <span>View Cart ({cartItemCount})</span>
                </Link>
            )}

            {/* 3D / AR Modal */}
            {modalProduct && (
                <ModelViewerModal
                    product={modalProduct}
                    store={store}
                    cartQuantity={items.find(item => item.productId === modalProduct.id)?.quantity || 0}
                    onClose={() => setModalProduct(null)}
                    onAddToCart={addToCart}
                />
            )}
        </div>
    );
}

function ProductCard({ product, store, onAddToCart, cartQuantity, getSpiceIcon, onOpen3D }: {
    product: {
        id: string;
        name: string;
        price: string;
        description?: string | null;
        isVegan?: boolean | null;
        isVegetarian?: boolean | null;
        isGlutenFree?: boolean | null;
        spiceLevel?: string | null;
        preparationTime?: number | null;
        glbUrl?: string | null;
        images: Array<{ imageUrl: string; isPrimary: boolean }>;
    };
    store: { currency: string };
    onAddToCart: (id: string) => void;
    cartQuantity: number;
    getSpiceIcon: (level?: string) => React.ReactNode;
    onOpen3D: () => void;
}) {
    const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

    return (
        <div
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 cursor-pointer"
            onClick={onOpen3D}
        >
            {primaryImage && (
                <div className="relative h-48 bg-gray-100">
                    <Image
                        src={primaryImage.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                    {/* Dietary Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                        {product.isVegan && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                🌱 Vegan
                            </span>
                        )}
                        {product.isVegetarian && !product.isVegan && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                🥬 Veg
                            </span>
                        )}
                        {product.isGlutenFree && (
                            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                🌾 GF
                            </span>
                        )}
                    </div>
                    {/* 3D Badge */}
                    {product.glbUrl && (
                        <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
                            <Box size={10} /> 3D
                        </div>
                    )}
                </div>
            )}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 flex-1">{product.name}</h3>
                    {getSpiceIcon(product.spiceLevel ?? undefined)}
                </div>
                {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {store.currency === 'USD' ? '$' : store.currency === 'INR' ? '₹' : store.currency === 'EUR' ? '€' : '£'}{product.price}
                        </p>
                        {product.preparationTime && (
                            <p className="text-xs text-gray-500">~{product.preparationTime} min</p>
                        )}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
                        suppressHydrationWarning
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Add {cartQuantity > 0 && `(${cartQuantity})`}
                    </button>
                </div>
                {/* 3D hint */}
                {product.glbUrl && (
                    <p className="mt-2 text-xs text-indigo-500 font-medium flex items-center gap-1">
                        <Box size={11} /> Tap to view in 3D &amp; AR
                    </p>
                )}
            </div>
        </div>
    );
}
