import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        price: string;
        images: Array<{
            imageUrl: string;
            isPrimary: boolean;
        }>;
    };
    storeSlug: string;
    currency: string;
}

export default function ProductCard({ product, storeSlug, currency }: ProductCardProps) {
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    const price = parseFloat(product.price);

    return (
        <Link
            href={`/${storeSlug}/product/${product.id}`}
            className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100">
                {primaryImage ? (
                    <Image
                        src={primaryImage.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                    {product.name}
                </h3>
                <p className="text-lg font-bold text-gray-900">
                    {currency === 'USD' && '$'}
                    {currency === 'INR' && '₹'}
                    {currency === 'EUR' && '€'}
                    {currency === 'GBP' && '£'}
                    {price.toFixed(2)}
                </p>
            </div>
        </Link>
    );
}
