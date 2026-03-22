'use client';

import { useState, useEffect, useRef } from 'react';
import { Wallet, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { saveRazorpayCredentials, getRazorpayStatus, disconnectRazorpay } from '@/lib/actions/razorpay-merchant';
import { toggleCOD, getCODStatus } from '@/lib/actions/payment-methods';
import { saveUpiCredentials, getUpiStatus, disconnectUpi } from '@/lib/actions/upi-payment';

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [razorpayConnected, setRazorpayConnected] = useState(false);
    const [razorpayApiKey, setRazorpayApiKey] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ apiKey: '', apiSecret: '' });
    const [showSecret, setShowSecret] = useState(false);
    const [saving, setSaving] = useState(false);
    const [codEnabled, setCodEnabled] = useState(false);
    const [codToggling, setCodToggling] = useState(false);

    // UPI state
    const [upiConnected, setUpiConnected] = useState(false);
    const [upiData, setUpiData] = useState({ upiId: '', accountHolderName: '', bankName: '' });
    const [showUpiForm, setShowUpiForm] = useState(false);
    const [upiFormData, setUpiFormData] = useState({ upiId: '', accountHolderName: '', bankName: '' });
    const [savingUpi, setSavingUpi] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Prevent duplicate API calls during React Strict Mode double-mounting
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadPaymentMethods();
        }
    }, []);

    const loadPaymentMethods = async () => {
        setLoading(true);
        try {
            const razorpayResult = await getRazorpayStatus();
            if (razorpayResult.success && razorpayResult.connected) {
                setRazorpayConnected(true);
                setRazorpayApiKey(razorpayResult.apiKey || '');
            }

            const codResult = await getCODStatus();
            if (codResult.success) {
                setCodEnabled(codResult.enabled);
            }

            const upiResult = await getUpiStatus();
            if (upiResult.success && upiResult.connected) {
                setUpiConnected(true);
                setUpiData({
                    upiId: upiResult.upiId || '',
                    accountHolderName: upiResult.accountHolderName || '',
                    bankName: upiResult.bankName || '',
                });
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRazorpay = async () => {
        // Prevent duplicate calls
        if (saving) return;

        if (!formData.apiKey || !formData.apiSecret) {
            setMessage({ type: 'error', text: 'Please enter both API Key and Secret' });
            return;
        }

        setSaving(true);
        try {
            const result = await saveRazorpayCredentials(formData);
            if (result.success) {
                setRazorpayConnected(true);
                setRazorpayApiKey(formData.apiKey);
                setShowForm(false);
                setFormData({ apiKey: '', apiSecret: '' });
                setMessage({ type: 'success', text: 'Razorpay credentials saved successfully!' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to save credentials' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = async () => {
        // Prevent duplicate calls
        if (saving) return;

        if (!confirm('Are you sure you want to remove Razorpay credentials?')) {
            return;
        }

        setSaving(true);
        try {
            const result = await disconnectRazorpay();
            if (result.success) {
                setRazorpayConnected(false);
                setRazorpayApiKey('');
                setMessage({ type: 'success', text: 'Razorpay disconnected' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to disconnect' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleCOD = async (enabled: boolean) => {
        // Prevent duplicate calls
        if (codToggling) return;

        setCodToggling(true);
        try {
            const result = await toggleCOD(enabled);
            if (result.success) {
                setCodEnabled(enabled);
                setMessage({ type: 'success', text: `Cash on Delivery ${enabled ? 'enabled' : 'disabled'}` });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to toggle COD' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setCodToggling(false);
        }
    };

    const handleSaveUpi = async () => {
        // Prevent duplicate calls
        if (savingUpi) return;

        if (!upiFormData.upiId || !upiFormData.accountHolderName || !upiFormData.bankName) {
            setMessage({ type: 'error', text: 'Please fill in all UPI details' });
            return;
        }

        setSavingUpi(true);
        try {
            const result = await saveUpiCredentials(upiFormData);
            if (result.success) {
                setUpiConnected(true);
                setUpiData(upiFormData);
                setShowUpiForm(false);
                setUpiFormData({ upiId: '', accountHolderName: '', bankName: '' });
                setMessage({ type: 'success', text: 'UPI details saved successfully!' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to save UPI details' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSavingUpi(false);
        }
    };

    const handleDisconnectUpi = async () => {
        // Prevent duplicate calls
        if (savingUpi) return;

        if (!confirm('Are you sure you want to remove UPI credentials?')) {
            return;
        }

        setSavingUpi(true);
        try {
            const result = await disconnectUpi();
            if (result.success) {
                setUpiConnected(false);
                setUpiData({ upiId: '', accountHolderName: '', bankName: '' });
                setMessage({ type: 'success', text: 'UPI disconnected' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to disconnect' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSavingUpi(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4E44FD]" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    Payment Methods
                </h1>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Razorpay Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                        <rect width="24" height="24" rx="4" fill="#3395FF" />
                                        <path d="M8 8h8v8H8z" fill="white" />
                                    </svg>
                                    Razorpay
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Accept online payments via Razorpay
                                </p>
                            </div>
                        </div>

                        {!razorpayConnected ? (
                            !showForm ? (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="w-full px-6 py-3 bg-[#3395FF] hover:bg-[#2980e6] text-white rounded-xl transition-colors font-medium"
                                >
                                    Add Razorpay Credentials
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            API Key ID
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.apiKey}
                                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                            placeholder="rzp_test_xxxxx or rzp_live_xxxxx"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4E44FD] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            API Key Secret
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showSecret ? 'text' : 'password'}
                                                value={formData.apiSecret}
                                                onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                                                placeholder="Enter your API secret"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4E44FD] focus:outline-none pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSecret(!showSecret)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveRazorpay}
                                            disabled={saving}
                                            className="flex-1 px-6 py-3 bg-[#3395FF] hover:bg-[#2980e6] text-white rounded-xl transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Credentials'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowForm(false);
                                                setFormData({ apiKey: '', apiSecret: '' });
                                            }}
                                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-5 h-5 text-green-600" />
                                        <p className="text-sm text-green-900 font-medium">Connected</p>
                                    </div>
                                    <p className="text-sm text-green-700">
                                        <strong>API Key:</strong> {razorpayApiKey.substring(0, 15)}...
                                    </p>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    disabled={saving}
                                    className="w-full px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium border-2 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Remove Credentials
                                </button>
                            </div>
                        )}
                    </div>

                    {/* UPI Payment Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                        <rect width="24" height="24" rx="4" fill="#097939" />
                                        <path d="M8 8h8v8H8z" fill="white" />
                                    </svg>
                                    UPI Payment
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Accept payments via UPI (PhonePe, Google Pay, etc.)
                                </p>
                            </div>
                        </div>

                        {!upiConnected ? (
                            !showUpiForm ? (
                                <button
                                    onClick={() => setShowUpiForm(true)}
                                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium"
                                >
                                    Add UPI Details
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            UPI ID
                                        </label>
                                        <input
                                            type="text"
                                            value={upiFormData.upiId}
                                            onChange={(e) => setUpiFormData({ ...upiFormData, upiId: e.target.value })}
                                            placeholder="yourname@paytm or yourname@oksbi"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4E44FD] focus:outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Format: username@bankname</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Holder Name
                                        </label>
                                        <input
                                            type="text"
                                            value={upiFormData.accountHolderName}
                                            onChange={(e) => setUpiFormData({ ...upiFormData, accountHolderName: e.target.value })}
                                            placeholder="Enter account holder name"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4E44FD] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bank Name
                                        </label>
                                        <input
                                            type="text"
                                            value={upiFormData.bankName}
                                            onChange={(e) => setUpiFormData({ ...upiFormData, bankName: e.target.value })}
                                            placeholder="Enter bank name"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4E44FD] focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveUpi}
                                            disabled={savingUpi}
                                            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {savingUpi ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save UPI Details'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowUpiForm(false);
                                                setUpiFormData({ upiId: '', accountHolderName: '', bankName: '' });
                                            }}
                                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-5 h-5 text-green-600" />
                                        <p className="text-sm text-green-900 font-medium">Connected</p>
                                    </div>
                                    <div className="space-y-1 text-sm text-green-700">
                                        <p><strong>UPI ID:</strong> {upiData.upiId}</p>
                                        <p><strong>Account Holder:</strong> {upiData.accountHolderName}</p>
                                        <p><strong>Bank:</strong> {upiData.bankName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDisconnectUpi}
                                    disabled={savingUpi}
                                    className="w-full px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium border-2 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Remove UPI Details
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Cash on Delivery Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Cash on Delivery</h2>
                                    <p className="text-sm text-gray-500">Accept cash payments on delivery</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={codEnabled}
                                    onChange={(e) => handleToggleCOD(e.target.checked)}
                                    disabled={codToggling}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-purple-900 mb-2">
                            💡 How to get Razorpay API Keys
                        </h3>
                        <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Go to Razorpay Dashboard → Settings → API Keys</li>
                            <li>• Generate Test/Live keys for your merchant account</li>
                            <li>• Copy both Key ID and Key Secret</li>
                            <li>• Paste them here to enable online payments</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
