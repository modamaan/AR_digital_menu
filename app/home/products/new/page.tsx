'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createProduct } from '@/lib/actions/product';
import { getUserStores } from '@/lib/actions/store';
import { getCategories } from '@/lib/actions/menu-categories';
import { uploadGlbAction } from '@/lib/actions/upload-glb';
import type { MenuCategory } from '@/lib/db/schema';

export default function AddProductPage() {
    const router = useRouter();
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discount, setDiscount] = useState('');
    const [inventory, setInventory] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [storeId, setStoreId] = useState('');

    // Uploaded image URLs (up to 4) + per-slot loading state
    const [imageUrls, setImageUrls] = useState<string[]>(['', '', '', '']);
    const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState('');

    const handleImageFile = async (file: File, slot: number) => {
        if (!file.type.startsWith('image/')) { setUploadError('Please select an image file'); return; }
        setUploadingSlot(slot);
        setUploadError('');
        try {
            const form = new FormData();
            form.append('image', file);
            const res = await fetch('/api/upload-image', { method: 'POST', body: form });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
            const updated = [...imageUrls];
            updated[slot] = data.url;
            setImageUrls(updated);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploadingSlot(null);
        }
    };

    // GLB URL input + 3D generation state
    const [glbUrl, setGlbUrl] = useState('');
    const [is3DGenerating, setIs3DGenerating] = useState(false);
    const [generate3DError, setGenerate3DError] = useState('');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Elapsed-time timer while generating
    useEffect(() => {
        if (!is3DGenerating) { setElapsedSeconds(0); return; }
        const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [is3DGenerating]);

    const [isGlbUploading, setIsGlbUploading] = useState(false);
    const [glbUploadError, setGlbUploadError] = useState('');

    const handleUploadGlb = async (file: File) => {
        if (!file.name.endsWith('.glb')) {
            setGlbUploadError('Please select a .glb file');
            return;
        }
        setIsGlbUploading(true);
        setGlbUploadError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const data = await uploadGlbAction(formData);
            if (!data.success) throw new Error(data.error || 'Upload failed');
            setGlbUrl(data.url || '');
        } catch (err) {
            setGlbUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsGlbUploading(false);
        }
    };

    const handleGenerate3D = async (file: File) => {
        if (!file) return;
        setIs3DGenerating(true);
        setGenerate3DError('');
        try {
            const form = new FormData();
            form.append('image', file);
            form.append('output_name', `${productName || 'model'}_${Date.now()}.glb`);

            const res = await fetch('/api/generate-3d', { method: 'POST', body: form });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || '3D generation failed');
            }
            setGlbUrl(data.glb_url || '');
        } catch (err) {
            setGenerate3DError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setIs3DGenerating(false);
        }
    };

    // Get store ID and categories on mount
    useEffect(() => {
        async function fetchData() {
            const storeResult = await getUserStores();
            if (storeResult.success && storeResult.stores && storeResult.stores.length > 0) {
                setStoreId(storeResult.stores[0].id);
            }
            const categoriesResult = await getCategories();
            if (categoriesResult.success) {
                setCategories(categoriesResult.categories);
            }
        }
        fetchData();
    }, []);

    const filledImages = imageUrls.filter(u => u.trim() !== '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!storeId) {
            setError('No store found. Please create a store first.');
            return;
        }

        if (filledImages.length === 0) {
            setError('Please add at least one food photo');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', productName);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('discount', discount || '0');
            formData.append('inventory', inventory);
            formData.append('storeId', storeId);
            if (categoryId) formData.append('categoryId', categoryId);
            formData.append('images', JSON.stringify(filledImages));
            if (glbUrl.trim()) formData.append('glbUrl', glbUrl.trim());

            const result = await createProduct(formData);
            if (result.success) {
                router.push('/home/products');
            } else {
                setError(result.error || 'Failed to create food item');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full">
            {/* Header with Back Button */}
            <div className="mb-6 md:mb-8 flex items-center gap-4">
                <Link href="/home/products">
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </Link>
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h1 className="text-[26px] font-normal text-black">Add food</h1>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Form Container */}
            <div className="bg-white rounded-3xl shadow-sm p-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Food Name */}
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                            Food Name *
                        </label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E44FD] focus:border-transparent outline-none transition-all"
                            placeholder="Enter food name"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E44FD] focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Enter food description"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            id="category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E44FD] focus:border-transparent outline-none transition-all"
                        >
                            <option value="">Select a category (optional)</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.icon} {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price and Discount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                Price *
                            </label>
                            <input
                                type="number"
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E44FD] focus:border-transparent outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                                Discount (%)
                            </label>
                            <input
                                type="number"
                                id="discount"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                min="0"
                                max="100"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E44FD] focus:border-transparent outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Inventory */}
                    <div>
                        <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-2">
                            Inventory *
                        </label>
                        <input
                            type="number"
                            id="inventory"
                            value={inventory}
                            onChange={(e) => setInventory(e.target.value)}
                            required
                            min="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E44FD] focus:border-transparent outline-none transition-all"
                            placeholder="0"
                        />
                    </div>

                    {/* Photos — upload grid */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photos * <span className="text-gray-400 font-normal">(up to 4)</span>
                        </label>
                        {/* 4-slot photo upload grid */}
                        {uploadError && (
                            <p className="text-xs text-red-600 mb-2">{uploadError}</p>
                        )}
                        <div className="grid grid-cols-4 gap-3">
                            {[0, 1, 2, 3].map((slot) => (
                                <label
                                    key={slot}
                                    className={`relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors
                                        ${imageUrls[slot] ? 'border-transparent' : 'border-gray-300 hover:border-[#4E44FD] bg-gray-50'}`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingSlot !== null}
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleImageFile(f, slot);
                                            e.target.value = '';
                                        }}
                                    />
                                    {uploadingSlot === slot ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-6 h-6 border-2 border-[#4E44FD] border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs text-gray-400">Uploading…</span>
                                        </div>
                                    ) : imageUrls[slot] ? (
                                        <>
                                            <Image src={imageUrls[slot]} alt={`Photo ${slot + 1}`} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-medium">Replace</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 p-2 text-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="text-xs text-gray-400">{slot === 0 ? 'Required' : 'Optional'}</span>
                                        </div>
                                    )}
                                    {/* Slot number badge */}
                                    {!imageUrls[slot] && uploadingSlot !== slot && (
                                        <span className="absolute top-1.5 left-1.5 text-[10px] text-gray-400 font-medium">{slot + 1}</span>
                                    )}
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Click a slot to upload from your device. Slot 1 is required.</p>
                    </div>

                    {/* 3D Model — Generate from photo or paste URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            3D Model <span className="text-gray-400 font-normal">(optional — .glb for AR view)</span>
                        </label>

                        {/* Generate from photo */}
                        <div className="border border-dashed border-[#4E44FD] rounded-lg p-4 mb-3 bg-[#4E44FD]/5">
                            <p className="text-xs font-medium text-[#4E44FD] mb-2">✨ Auto-generate 3D from a food photo</p>
                            {is3DGenerating ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-[#4E44FD] border-t-transparent rounded-full animate-spin shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-700 font-medium">Generating 3D mesh…</p>
                                        <p className="text-xs text-gray-400">{elapsedSeconds}s elapsed · usually 1–3 min</p>
                                    </div>
                                </div>
                            ) : (
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#4E44FD] text-white text-sm rounded-lg hover:bg-[#3d36ca] transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleGenerate3D(f);
                                            e.target.value = '';
                                        }}
                                    />
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Upload food photo to generate 3D
                                </label>
                            )}
                            {generate3DError && (
                                <p className="mt-2 text-xs text-red-600">{generate3DError}</p>
                            )}
                            {glbUrl && !is3DGenerating && !isGlbUploading && (
                                <p className="mt-2 text-xs text-green-600">✓ 3D model generated/uploaded and URL filled below</p>
                            )}
                        </div>

                        {/* Local .glb Upload */}
                        {/* <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-3 bg-gray-50/50">
                            <p className="text-xs font-medium text-gray-700 mb-2">📁 Upload an existing 3D model (.glb only)</p>
                            {isGlbUploading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-700 font-medium">Uploading 3D model…</p>
                                    </div>
                                </div>
                            ) : (
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="file"
                                        accept=".glb"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleUploadGlb(f);
                                            e.target.value = '';
                                        }}
                                    />
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Upload .glb file
                                </label>
                            )}
                            {glbUploadError && (
                                <p className="mt-2 text-xs text-red-600">{glbUploadError}</p>
                            )}
                        </div> */}

                        {/* Manual URL fallback */}
                        <p className="text-xs text-gray-400 mb-1">Or paste a direct .glb URL (or Modal filename):</p>
                        <input
                            type="text"
                            id="glbUrl"
                            value={glbUrl}
                            onChange={(e) => setGlbUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E44FD] focus:border-transparent outline-none transition-all"
                            placeholder="https://... or icecreame_177...glb"
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-[#4E44FD] text-white rounded-lg font-medium text-sm hover:bg-[#5B52FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Add Food'}
                        </button>
                        <Link href="/home/products">
                            <button
                                type="button"
                                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
