'use client';

import { Template } from '@/lib/templates';
import { useState } from 'react';

interface TemplateCardProps {
    template: Template;
    onSelect: (templateId: string) => void;
}

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
    return (
        <div
            className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-[#4E44FD] transition-all hover:shadow-lg group flex flex-col items-center text-center sm:items-start sm:text-left"
        >
            {/* Icon/Illustration */}
            <div className="mb-6 w-full flex justify-center sm:justify-start">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    {template.icon}
                </div>
            </div>

            {/* Content */}
            <div className="mb-6 flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{template.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full">
                <button
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    title="Preview template"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                    </svg>
                </button>
                <button
                    onClick={() => onSelect(template.id)}
                    className="flex-1 bg-[#4E44FD] hover:bg-[#3d36ca] text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#4E44FD]/10"
                >
                    Select
                </button>
            </div>
        </div>
    );
}
