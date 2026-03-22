'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TemplateSidebar from '@/components/create/TemplateSidebar';
import { createStore } from '@/lib/actions/store';

export default function CreatePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [storeData, setStoreData] = useState<{
        storeName: string;
        bio: string;
        slug?: string;
    } | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Form state for step 1
    const [storeName, setStoreName] = useState('');
    const [bio, setBio] = useState('');

    const handleStoreSetupComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeName.trim()) {
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const result = await createStore({
                storeName: storeName.trim(),
                templateId: 'blank', // Default template
                currency: 'USD',
                notifications: {
                    whatsapp: false,
                    email: false,
                },
                bio: bio.trim(),
            });

            if (result.success && result.store) {
                // Store the data and slug for display
                setStoreData({
                    storeName: storeName.trim(),
                    bio: bio.trim(),
                    slug: result.store.slug,
                });
                setCurrentStep(2);
                setIsCreating(false);
            } else {
                setError(result.error || 'Failed to create store');
                setIsCreating(false);
            }
        } catch (err) {
            console.error('Error creating store:', err);
            setError('An unexpected error occurred');
            setIsCreating(false);
        }
    };

    const handleFinish = () => {
        // Just redirect to dashboard
        router.push('/home');
    };

    const getStoreUrl = () => {
        if (storeData?.slug) {
            return `${window.location.origin}/${storeData.slug}`;
        }
        return `${window.location.origin}/${storeData?.storeName?.toLowerCase().replace(/\s+/g, '-')}`;
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(getStoreUrl());
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleOpenLink = () => {
        window.open(getStoreUrl(), '_blank');
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFDFD]">
            {/* Sidebar / Header */}
            <TemplateSidebar currentStep={currentStep} />

            {/* Main Content */}
            <main className="flex-1 p-5 sm:p-8 md:p-12 lg:p-20 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {/* Step 1: Setup Store - Name & Bio */}
                    {currentStep === 1 && (
                        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <form onSubmit={handleStoreSetupComplete} className="space-y-6">
                                {/* Store Name */}
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        placeholder="Store Name"
                                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#4E44FD] focus:outline-none bg-white transition-all text-lg text-gray-900 placeholder:text-gray-400 shadow-sm"
                                        required
                                    />
                                </div>

                                {/* Bio */}
                                <div className="relative group">
                                    <textarea
                                        rows={4}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell customers about your store..."
                                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#4E44FD] focus:outline-none bg-white transition-all text-lg text-gray-900 placeholder:text-gray-400 shadow-sm resize-none"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="w-full bg-[#4E44FD] hover:bg-[#3d36ca] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-[#4E44FD]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                    >
                                        {isCreating ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Store...
                                            </span>
                                        ) : (
                                            'Continue'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 2: All Done */}
                    {currentStep === 2 && (
                        <div className="max-w-xl mx-auto text-center py-12 animate-in zoom-in duration-500">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
                                    Your store is ready <span className="text-4xl">🥳</span>
                                </h1>
                            </div>

                            {/* URL Box */}
                            <div className="mb-6 flex items-center gap-2 p-1 bg-white border-2 border-gray-100 rounded-xl shadow-sm group focus-within:border-[#4E44FD] transition-all">
                                <div className="flex-1 px-4 py-3 text-left overflow-hidden">
                                    <span className="text-gray-400 font-mono text-xs uppercase tracking-widest mr-2">URL:</span>
                                    <span className="text-gray-600 font-mono text-sm font-bold break-all">
                                        {getStoreUrl()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 pr-1">
                                    <button
                                        onClick={handleCopyLink}
                                        className="p-2.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#4E44FD] transition-all relative"
                                        title={copySuccess ? "Copied!" : "Copy link"}
                                    >
                                        {copySuccess ? (
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleOpenLink}
                                        className="p-2.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#4E44FD] transition-all"
                                        title="Open in new tab"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Main CTA */}
                            <button
                                onClick={handleFinish}
                                className="w-full bg-[#4E44FD] hover:bg-[#3d36ca] text-white font-bold py-4 px-12 rounded-xl text-lg transition-all shadow-xl shadow-[#4E44FD]/20 active:scale-95 mb-6"
                            >
                                Go to Dashboard
                            </button>

                            {/* Info Box */}
                            <div className="bg-[#4E44FD]/5 border border-[#4E44FD]/10 p-4 rounded-xl flex items-center gap-4 text-left">
                                <div className="w-8 h-8 rounded-full bg-[#4E44FD] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold font-serif italic text-sm">i</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                    You can claim your branded <span className="font-bold text-[#4E44FD]">VisionDine</span> from <span className="text-[#4E44FD] hover:underline cursor-pointer">settings</span> later.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
