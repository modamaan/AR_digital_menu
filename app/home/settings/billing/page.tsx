export default function BillingSettingsPage() {
    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Billing & Plans
                </h1>

                <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                            <div>
                                <h3 className="font-semibold text-gray-900">Free Plan</h3>
                                <p className="text-sm text-gray-600 mt-1">Perfect for getting started</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">₹0</p>
                                <p className="text-sm text-gray-600">per month</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Trial ends in 2 days</p>
                            <button className="px-6 py-2 bg-[#4E44FD] hover:bg-[#3d36ca] text-white font-semibold rounded-lg transition-colors">
                                Subscribe for ₹29
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                        <p className="text-sm text-gray-600 mb-4">No payment method added yet</p>
                        <button className="px-6 py-2 border-2 border-gray-300 hover:border-[#4E44FD] text-gray-700 font-semibold rounded-lg transition-colors">
                            Add Payment Method
                        </button>
                    </div>

                    {/* Billing History */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h2>
                        <p className="text-sm text-gray-600">No billing history yet</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
