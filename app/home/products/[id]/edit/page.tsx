import EditProductForm from '@/components/products/EditProductForm';
import { getProduct } from '@/lib/actions/product';
import { redirect } from 'next/navigation';


interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;

    // Fetch product data
    const result = await getProduct(id);

    if (!result.success || !result.product) {
        redirect('/home/products');
    }

    return (
        <div className="w-full h-full">
            <EditProductForm product={result.product} />
        </div>
    );
}
