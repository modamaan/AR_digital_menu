'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { getSubscriptionStatus } from '@/lib/actions/subscription';

// Cache to store subscription data across component remounts
let cachedSubscriptionData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // Cache for 1 minute

export default function PlanCard() {
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(cachedSubscriptionData);
    const [loading, setLoading] = useState(!cachedSubscriptionData);

    useEffect(() => {
        async function fetchStatus() {
            const now = Date.now();

            // Use cached data if it's still fresh
            if (cachedSubscriptionData && (now - cacheTimestamp) < CACHE_DURATION) {
                setSubscriptionStatus(cachedSubscriptionData);
                setLoading(false);
                return;
            }

            // Fetch fresh data
            const status = await getSubscriptionStatus();
            cachedSubscriptionData = status;
            cacheTimestamp = now;
            setSubscriptionStatus(status);
            setLoading(false);
        }
        fetchStatus();
    }, []);

    // Memoize the days calculation to avoid recalculating on every render
    const daysRemaining = useMemo(() => {
        if (!subscriptionStatus?.trialEndsAt) return 0;
        const now = new Date();
        const endDate = new Date(subscriptionStatus.trialEndsAt);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }, [subscriptionStatus?.trialEndsAt]);

    const tier = useMemo(() => {
        const t = subscriptionStatus?.currentPlan?.tier || 'none';
        return t.charAt(0).toUpperCase() + t.slice(1);
    }, [subscriptionStatus?.currentPlan?.tier]);

    if (loading || !subscriptionStatus) {
        return null;
    }

    return (
        <Link href="/plans" className="block">
            <div className="mx-3 mb-3 bg-gradient-to-br from-[#5B52FF] to-[#4E44FD] rounded-xl p-4 text-white hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">Plan</span>
                        </div>
                        <p className="text-lg font-bold">{tier}</p>
                        <p className="text-xs text-purple-100 mt-1">
                            {subscriptionStatus.trialActive
                                ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`
                                : subscriptionStatus.status === 'active'
                                    ? 'Active'
                                    : 'No active plan'
                            }
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
