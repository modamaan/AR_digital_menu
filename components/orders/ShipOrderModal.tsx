'use client';

import { useState } from 'react';

interface ShipOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export default function ShipOrderModal({ isOpen, onClose, onConfirm, isLoading }: ShipOrderModalProps) {
    const [sendNote, setSendNote] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Change status to shipped
                </h2>

                <p className="text-gray-600 mb-6">
                    This action will change the order status to shipped and notify the customer.
                </p>

                {/* Checkbox */}
                <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={sendNote}
                        onChange={(e) => setSendNote(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#4E44FD] focus:ring-[#4E44FD] cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                        Send a custom note to the customer
                    </span>
                </label>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Confirming...
                            </>
                        ) : (
                            'Confirm'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
