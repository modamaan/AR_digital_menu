export default function PrivacySettingsPage() {
    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Privacy & Policy
                </h1>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="prose max-w-none">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Policy</h2>

                        <div className="space-y-4 text-sm text-gray-600">
                            <p>
                                Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.
                            </p>

                            <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">Information We Collect</h3>
                            <p>
                                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
                            </p>

                            <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">How We Use Your Information</h3>
                            <p>
                                We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                            </p>

                            <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">Data Security</h3>
                            <p>
                                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction.
                            </p>

                            <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">Your Rights</h3>
                            <p>
                                You have the right to access, update, or delete your personal information at any time. Contact us if you have any questions or concerns.
                            </p>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    Last updated: January 14, 2026
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
