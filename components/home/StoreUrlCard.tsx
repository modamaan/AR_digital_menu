'use client';

import { useState } from 'react';

interface StoreUrlCardProps {
    storeUrl: string;
}

export default function StoreUrlCard({ storeUrl }: StoreUrlCardProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(storeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">VisionDine Store URL</h2>
            <p className="text-xs text-gray-500 mb-4">Visit your store or share it across social media</p>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <span className="flex-1 text-sm text-[#4E44FD] font-medium truncate">
                    {storeUrl || 'Loading...'}
                </span>
                <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 text-gray-400 hover:text-[#4E44FD] transition-colors"
                    title="Copy link"
                >
                    {copied ? (
                        <svg className="w-5 h-5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
