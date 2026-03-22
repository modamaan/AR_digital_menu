'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { updateStore, getStoreForSettings } from '@/lib/actions/store-settings';
import { getUserStores } from '@/lib/actions/store';
import Image from 'next/image';

function StoreSettingsContent() {
    const searchParams = useSearchParams();
    const storeIdFromUrl = searchParams.get('store');

    const [storeId, setStoreId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [bio, setBio] = useState('');
    const [bannerImage, setBannerImage] = useState('');
    const [profileImage, setProfileImage] = useState('');

    useEffect(() => {
        initializeStore();
    }, [storeIdFromUrl]);

    const initializeStore = async () => {
        if (storeIdFromUrl) {
            setStoreId(storeIdFromUrl);
            loadStoreData(storeIdFromUrl);
            return;
        }
        try {
            const result = await getUserStores();
            if (result.success && result.stores && result.stores.length > 0) {
                const firstStoreId = result.stores[0].id;
                setStoreId(firstStoreId);
                loadStoreData(firstStoreId);
            } else {
                setError('No stores found');
                setLoading(false);
            }
        } catch (err) {
            setError('Failed to load stores');
            setLoading(false);
        }
    };

    const loadStoreData = async (id: string) => {
        try {
            const result = await getStoreForSettings(id);
            if (result.success && result.store) {
                setName(result.store.name);
                setSlug(result.store.slug);
                setBio(result.store.bio || '');
                setBannerImage(result.store.bannerImage || '');
                setProfileImage(result.store.profileImage || '');
            } else {
                setError(result.error || 'Failed to load store');
            }
        } catch (err) {
            setError('Failed to load store data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) return;

        setError(null);
        setSuccess(false);
        setSaving(true);

        try {
            const result = await updateStore({
                storeId,
                name,
                bio,
                bannerImage,
                profileImage,
            });

            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to update store');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveBanner = async () => {
        if (!storeId) return;

        setError(null);
        setSaving(true);
        setBannerImage('');

        try {
            const result = await updateStore({
                storeId,
                bannerImage: '',
            });

            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to remove banner');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveProfile = async () => {
        if (!storeId) return;

        setError(null);
        setSaving(true);
        setProfileImage('');

        try {
            const result = await updateStore({
                storeId,
                profileImage: '',
            });

            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to remove profile image');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="max-w-4xl">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Store
                </h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Store updated successfully!
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Banner Image */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Banner image
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            We recommend to use an image that's at least 1584 x 396 pixels and 6MB or less.
                        </p>

                        {/* Banner Image URL input + preview */}
                        <div className="space-y-2">
                            <input
                                type="url"
                                value={bannerImage}
                                onChange={(e) => setBannerImage(e.target.value)}
                                placeholder="https://... (paste a direct image URL)"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4E44FD] focus:outline-none transition-colors text-sm"
                            />
                            {bannerImage && (
                                <div className="relative w-full h-40 border-2 border-gray-200 rounded-lg overflow-hidden">
                                    <Image src={bannerImage} alt="Banner preview" fill className="object-cover" />
                                </div>
                            )}
                            <p className="text-xs text-gray-400">
                                Upload to <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-[#4E44FD] underline">imgbb.com</a> (free), then paste the URL.
                            </p>
                        </div>
                    </div>

                    {/* Profile Image */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Profile image
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            We recommend to use a picture that's at least 96 x 96 pixels and 4MB or less.
                        </p>

                        {/* Profile Image URL input + preview */}
                        <div className="space-y-2">
                            <input
                                type="url"
                                value={profileImage}
                                onChange={(e) => setProfileImage(e.target.value)}
                                placeholder="https://... (paste a direct image URL)"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4E44FD] focus:outline-none transition-colors text-sm"
                            />
                            {profileImage && (
                                <div className="relative w-24 h-24 border-2 border-gray-200 rounded-full overflow-hidden">
                                    <Image src={profileImage} alt="Profile preview" fill className="object-cover" />
                                </div>
                            )}
                            <p className="text-xs text-gray-400">
                                Upload to <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-[#4E44FD] underline">imgbb.com</a> (free), then paste the URL.
                            </p>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Name
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            Choose a changed name that represents you and your Store. You can change your name twice in 14 days.
                        </p>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Store name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4E44FD] focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    {/* Username (Read-only) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Username
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            Your store URL slug. This cannot be changed after creation.
                        </p>
                        <input
                            type="text"
                            value={`@${slug}`}
                            disabled
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Bio
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            Write a short bio that describes you or your store. This will be visible to customers and helps them understand who you are and what you offer.
                        </p>
                        <textarea
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell customers about your store..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4E44FD] focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-[#4E44FD] hover:bg-[#3d36ca] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function StoreSettingsPage() {
    return (
        <Suspense fallback={
            <div className="p-8">
                <div className="max-w-4xl">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        }>
            <StoreSettingsContent />
        </Suspense>
    );
}
