import { getStoreBySlug, getProductById } from '@/lib/actions/storefront';
import { incrementProductViews } from '@/lib/actions/analytics';
import { notFound } from 'next/navigation';
import StoreHeader from '@/components/storefront/StoreHeader';
import ProductGallery from '@/components/storefront/ProductGallery';
import AddToCartButton from '@/components/storefront/AddToCartButton';

interface ProductPageProps {
    params: Promise<{ storeSlug: string; id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { storeSlug, id } = await params;

    // Fetch store data
    const storeResult = await getStoreBySlug(storeSlug);

    if (!storeResult.success || !storeResult.store) {
        notFound();
    }

    const store = storeResult.store;

    // Fetch product
    const productResult = await getProductById(id, store.id);

    if (!productResult.success || !productResult.product) {
        notFound();
    }

    const product = productResult.product;

    // Track product view
    await incrementProductViews(id);
    const price = parseFloat(product.price);

    return (
        <div className="min-h-screen bg-white">
            <StoreHeader store={store} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Images */}
                    <div>
                        <ProductGallery images={product.images} productName={product.name} />
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                        <div className="mb-6">
                            <p className="text-3xl font-bold text-gray-900">
                                {store.currency === 'USD' && '$'}
                                {store.currency === 'INR' && '₹'}
                                {store.currency === 'EUR' && '€'}
                                {store.currency === 'GBP' && '£'}
                                {price.toFixed(2)}
                            </p>
                        </div>

                        {product.description && (
                            <div className="mb-8">
                                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
                                    Description
                                </h2>
                                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <p className="text-sm text-gray-600">
                                {product.inventory > 0 ? (
                                    <span className="text-green-600 font-medium">In Stock ({product.inventory} available)</span>
                                ) : (
                                    <span className="text-red-600 font-medium">Out of Stock</span>
                                )}
                            </p>
                        </div>

                        <AddToCartButton
                            product={{
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.images.find(img => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl,
                            }}
                            storeSlug={storeSlug}
                            currency={store.currency}
                            inStock={product.inventory > 0}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
