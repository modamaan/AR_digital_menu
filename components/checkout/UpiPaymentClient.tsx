'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Check, AlertCircle, Smartphone } from 'lucide-react';
import { generatePhonePeLink, generateGooglePayLink } from '@/lib/utils/upi-utils';
import { validatePaymentScreenshot } from '@/lib/utils/image-validation';
import { uploadPaymentScreenshot } from '@/lib/actions/order-payment';

interface UpiPaymentClientProps {
    orderId: string;
    storeSlug: string;
    upiDetails: {
        upiId: string;
        accountHolderName: string;
        bankName: string;
    };
    orderAmount: number;
    orderNumber: string;
}

export default function UpiPaymentClient({
    orderId,
    storeSlug,
    upiDetails,
    orderAmount,
    orderNumber,
}: UpiPaymentClientProps) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validate the file
        const validation = await validatePaymentScreenshot(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // In a real implementation, you would upload the file to cloud storage (e.g., Cloudinary, S3)
            // For now, we'll simulate the upload with the preview URL
            // TODO: Implement actual file upload to cloud storage

            const imageUrl = previewUrl || ''; // In production, this would be the uploaded URL

            const result = await uploadPaymentScreenshot({
                orderId,
                imageUrl,
            });

            if (result.success) {
                setSuccess(true);
                // Redirect to order confirmation after a short delay
                setTimeout(() => {
                    router.push(`/${storeSlug}/order-confirmation/${orderId}`);
                }, 2000);
            } else {
                setError(result.error || 'Failed to upload screenshot');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('An error occurred while uploading');
        } finally {
            setUploading(false);
        }
    };

    const handleOpenPhonePe = () => {
        const link = generatePhonePeLink(
            upiDetails.upiId,
            orderAmount,
            upiDetails.accountHolderName,
            `Payment for Order #${orderNumber}`
        );
        window.location.href = link;
    };

    const handleOpenGooglePay = () => {
        const link = generateGooglePayLink(
            upiDetails.upiId,
            orderAmount,
            upiDetails.accountHolderName,
            `Payment for Order #${orderNumber}`
        );
        window.location.href = link;
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verified!</h2>
                    <p className="text-gray-600 mb-4">Your payment has been confirmed. Redirecting...</p>
                    <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete UPI Payment</h1>
                    <p className="text-gray-600">Order #{orderNumber}</p>
                </div>

                {/* Payment Amount */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-6 text-white">
                    <p className="text-sm opacity-90 mb-1">Amount to Pay</p>
                    <p className="text-4xl font-bold">₹{orderAmount.toFixed(2)}</p>
                </div>

                {/* UPI Details */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Merchant UPI Details</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">UPI ID</span>
                            <span className="font-semibold text-gray-900">{upiDetails.upiId}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Account Holder</span>
                            <span className="font-semibold text-gray-900">{upiDetails.accountHolderName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Bank</span>
                            <span className="font-semibold text-gray-900">{upiDetails.bankName}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Apps */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Pay with UPI App
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleOpenPhonePe}
                            className="flex flex-col items-center gap-3 p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all"
                        >
                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                P
                            </div>
                            <span className="font-semibold text-gray-900">PhonePe</span>
                        </button>
                        <button
                            onClick={handleOpenGooglePay}
                            className="flex flex-col items-center gap-3 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                G
                            </div>
                            <span className="font-semibold text-gray-900">Google Pay</span>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-4 text-center">
                        Click to open the app with prefilled payment details
                    </p>
                </div>

                {/* Screenshot Upload */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Upload Payment Screenshot</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        After completing the payment, upload a screenshot to verify your payment
                    </p>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {!previewUrl ? (
                        <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50 transition-all">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-700 font-medium mb-1">Click to upload screenshot</p>
                                <p className="text-sm text-gray-500">PNG, JPG, JPEG or WebP (max 5MB)</p>
                            </div>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                                <img
                                    src={previewUrl}
                                    alt="Payment screenshot preview"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Confirm Payment
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                        setError(null);
                                    }}
                                    disabled={uploading}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-900 font-medium mb-2">📝 Important Notes:</p>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Screenshot must be clear and readable</li>
                            <li>• Upload within 24 hours of order creation</li>
                            <li>• You can only upload once per order</li>
                            <li>• Payment will be automatically verified upon upload</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
