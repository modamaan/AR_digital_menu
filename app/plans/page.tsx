'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSubscription, startFreeTrial, getSubscriptionStatus } from '@/lib/actions/subscription';
import Script from 'next/script';
import { useUser } from '@clerk/nextjs';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const plans = [
    {
        name: 'Lite',
        slug: 'lite',
        monthlyPrice: 10,
        yearlyPrice: 100,
        tier: 'lite',
        features: [
            'Order management',
            'Unlimited product listings',
            'Basic analytics',
            'Customer chat',
            'VisionDine.com branding',
        ],
    },
    {
        name: 'Standard',
        slug: 'standard',
        monthlyPrice: 25,
        yearlyPrice: 250,
        tier: 'standard',
        isPopular: true,
        features: [
            'Everything in Lite',
            '✨ Custom domain support',
            '✨ Advanced analytics',
            '✨ Remove VisionDine branding',
            '✨ Priority support',
        ],
    },
];

export default function PlansPage() {
    const router = useRouter();
    const { user } = useUser();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState<string | null>(null);
    const [trialLoading, setTrialLoading] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

    // Fetch subscription status on mount
    useEffect(() => {
        async function fetchStatus() {
            const status = await getSubscriptionStatus();
            setSubscriptionStatus(status);

            // Redirect users with active subscription/trial to home
            if (status?.hasAccess) {
                router.push('/home');
            }
        }
        fetchStatus();
    }, [router]);

    // Calculate days remaining in trial
    const getDaysRemaining = () => {
        if (!subscriptionStatus?.trialEndsAt) return 0;
        const now = new Date();
        const endDate = new Date(subscriptionStatus.trialEndsAt);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const daysRemaining = getDaysRemaining();

    const handleFreeTrial = async () => {
        setTrialLoading(true);
        try {
            // Check if user already has an active trial
            if (subscriptionStatus?.trialActive) {
                // Existing trial — check if they already have a store
                const { getUserStores } = await import('@/lib/actions/store');
                const storesResult = await getUserStores();
                if (storesResult.success && storesResult.stores && storesResult.stores.length > 0) {
                    router.push('/home');
                } else {
                    router.push('/create');
                }
                return;
            }

            // Start free trial
            const result = await startFreeTrial('lite_monthly');

            if (!result.success) {
                // If user already has a trial (race condition), redirect
                if (result.error?.includes('already have')) {
                    router.push('/home');
                    return;
                }
                alert(result.error || 'Failed to start trial');
                setTrialLoading(false);
                return;
            }

            // Brand-new trial — user cannot have a store yet, go straight to /create
            router.push('/create');
        } catch (error) {
            console.error('Error starting trial:', error);
            alert('An error occurred. Please try again.');
            setTrialLoading(false);
        }
    };


    const handleSelectPlan = async (planSlug: string) => {
        const fullSlug = `${planSlug}_${billingCycle}`;
        setLoading(fullSlug);

        try {
            // Create Razorpay subscription directly (no trial for paid subscriptions)
            const subResult = await createSubscription(fullSlug);

            // If payment isn't configured, show error
            if (!subResult.success) {
                alert(subResult.error || 'Payment processing is not available yet');
                setLoading(null);
                return;
            }

            // If payment is configured, proceed with Razorpay checkout
            if (subResult.subscriptionId) {
                // Initialize Razorpay checkout
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    subscription_id: subResult.subscriptionId,
                    name: 'VisionDine',
                    description: `${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} Plan - ${billingCycle}`,
                    handler: async function (response: any) {
                        // Payment successful, redirect to create page
                        router.push('/create');
                    },
                    prefill: {
                        email: user?.primaryEmailAddress?.emailAddress || '',
                        name: user?.fullName || '',
                    },
                    theme: {
                        color: '#4E44FD',
                    },
                    modal: {
                        ondismiss: function () {
                            setLoading(null);
                        }
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
            setLoading(null);
        }
    };

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
                {/* Header */}
                <header className="bg-[#4E44FD] text-white py-4 px-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-[#4E44FD] font-bold text-lg">C</span>
                            </div>
                            <span className="text-xl font-bold">VisionDine</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-6xl mx-auto px-6 py-16">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                            Choose your plan
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Everything you need to run your business
                        </p>

                        {/* Billing Toggle */}
                        <div className="inline-flex items-center gap-4 bg-gray-100 rounded-full p-1">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full transition font-medium ${billingCycle === 'monthly'
                                    ? 'bg-white text-[#4E44FD] shadow-sm'
                                    : 'text-gray-600'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-full transition font-medium ${billingCycle === 'yearly'
                                    ? 'bg-white text-[#4E44FD] shadow-sm'
                                    : 'text-gray-600'
                                    }`}
                            >
                                Yearly <span className="text-green-600 text-sm ml-1">Save 17%</span>
                            </button>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
                        {plans.map((plan) => {
                            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                            const planSlug = `${plan.slug}_${billingCycle}`;

                            return (
                                <div
                                    key={plan.slug}
                                    className={`relative bg-white rounded-2xl p-8 border-2 transition hover:shadow-xl ${plan.isPopular
                                        ? 'border-[#4E44FD] shadow-lg scale-105'
                                        : 'border-gray-200'
                                        }`}
                                >
                                    {plan.isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#4E44FD] text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </div>
                                    )}

                                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>

                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold text-gray-900">${price}</span>
                                            <span className="text-gray-500">
                                                /{billingCycle === 'monthly' ? 'month' : 'year'}
                                            </span>
                                        </div>
                                        {billingCycle === 'yearly' && (
                                            <p className="text-sm text-green-600 mt-1">
                                                ${(price / 12).toFixed(2)}/month billed annually
                                            </p>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <svg
                                                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleSelectPlan(plan.slug)}
                                        disabled={loading === planSlug}
                                        className={`w-full font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${plan.isPopular
                                            ? 'bg-[#4E44FD] text-white hover:bg-[#3d36ca] shadow-lg shadow-[#4E44FD]/30'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                    >
                                        {loading === planSlug ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading...
                                            </span>
                                        ) : (
                                            'Subscribe Now'
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Free Trial Link */}
                    <div className="text-center">
                        <button
                            onClick={handleFreeTrial}
                            disabled={trialLoading}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl px-8 py-4 hover:shadow-lg transition group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {trialLoading ? (
                                <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <div className="text-left">
                                <p className="text-lg font-bold text-gray-900 group-hover:text-[#4E44FD] transition">
                                    {trialLoading
                                        ? 'Starting your trial...'
                                        : subscriptionStatus?.trialActive
                                            ? `✨ Continue Free Trial (${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left)`
                                            : '🎉 Start 7-Day Free Trial'
                                    }
                                </p>
                                <p className="text-sm text-gray-600">
                                    {subscriptionStatus?.trialActive
                                        ? `Your trial expires on ${new Date(subscriptionStatus.trialEndsAt).toLocaleDateString()}`
                                        : 'Get full access for 7 days, no credit card required'
                                    }
                                </p>
                            </div>
                            {!trialLoading && (
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#4E44FD] group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
}
