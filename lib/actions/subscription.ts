'use server';

import { getCurrentUserId } from '@/lib/user';
import { razorpay, RAZORPAY_PLANS } from '@/lib/razorpay';
import { db } from '@/lib/db';
import { users, subscriptions, subscriptionPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { ensureUserExists } from './user';

/**
 * Start a 7-day free trial for a user
 */
export async function startFreeTrial(planSlug: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Unauthorized');

    // Ensure user exists in database
    await ensureUserExists(userId);

    // Fetch user and plan in parallel
    const [user, plan] = await Promise.all([
        db.query.users.findFirst({ where: eq(users.clerkId, userId) }),
        db.query.subscriptionPlans.findFirst({ where: eq(subscriptionPlans.slug, planSlug) }),
    ]);

    if (!user) throw new Error('User not found. Please sign in again.');

    // Check if user already has a trial or subscription
    if (user.subscriptionStatus !== 'none') {
        return {
            success: false,
            error: 'You already have an active trial or subscription'
        };
    }

    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.update(users)
        .set({
            subscriptionStatus: 'trial',
            trialStartDate: now,
            trialEndDate: trialEnd,
            currentPlanId: plan.id,
        })
        .where(eq(users.id, user.id));

    return {
        success: true,
        trialEndsAt: trialEnd,
        planName: plan.name
    };
}


/**
 * Create a Razorpay subscription
 */
export async function createSubscription(planSlug: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Unauthorized');

    // Ensure user exists in database
    await ensureUserExists(userId);

    let user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
    });

    if (!user) {
        throw new Error('User not found. Please sign in again.');
    }

    const plan = await db.query.subscriptionPlans.findFirst({
        where: eq(subscriptionPlans.slug, planSlug),
    });

    if (!plan) {
        throw new Error('Plan not found');
    }

    // If Razorpay plan ID is not configured, return a message
    // This is expected during development or when only using free trials
    if (!plan.razorpayPlanId) {
        return {
            success: false,
            error: 'Payment processing is not configured yet. You can still use the free trial!',
        };
    }

    if (!razorpay) {
        return {
            success: false,
            error: 'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env.local file',
        };
    }

    try {
        // Create Razorpay subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: plan.razorpayPlanId,
            customer_notify: 1,
            total_count: planSlug.includes('yearly') ? 12 : 1,
            notes: {
                userId: user.id,
                planId: plan.id,
                email: user.email,
            },
        });

        return {
            success: true,
            subscriptionId: subscription.id,
            planId: plan.id,
        };
    } catch (error) {
        console.error('Error creating Razorpay subscription:', error);
        return {
            success: false,
            error: 'Failed to create subscription',
        };
    }
}

/**
 * Verify Razorpay payment signature
 */
export async function verifyPayment(
    razorpayPaymentId: string,
    razorpaySubscriptionId: string,
    razorpaySignature: string
) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Unauthorized');

    // Verify signature
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
        .digest('hex');

    if (generatedSignature !== razorpaySignature) {
        return { success: false, error: 'Invalid signature' };
    }

    // Ensure user exists in database
    await ensureUserExists(userId);

    let user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
    });

    if (!user) {
        throw new Error('User not found. Please sign in again.');
    }

    if (!razorpay) {
        return { success: false, error: 'Razorpay is not configured' };
    }

    try {
        // Fetch subscription details from Razorpay
        const razorpaySub = await razorpay.subscriptions.fetch(razorpaySubscriptionId);

        if (!razorpaySub.notes || !razorpaySub.current_end) {
            return { success: false, error: 'Invalid subscription data' };
        }

        const planId = razorpaySub.notes.planId as string;
        const now = new Date();
        const periodEnd = new Date((razorpaySub.current_end as number) * 1000);

        // Create subscription record
        await db.insert(subscriptions).values({
            userId: user.id,
            planId: planId,
            razorpaySubscriptionId: razorpaySubscriptionId,
            razorpayPaymentId: razorpayPaymentId,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
        });

        // Update user
        await db.update(users)
            .set({
                subscriptionStatus: 'active',
                currentPlanId: planId,
            })
            .where(eq(users.id, user.id));

        return { success: true };
    } catch (error) {
        console.error('Error verifying payment:', error);
        return { success: false, error: 'Payment verification failed' };
    }
}

/**
 * Get current subscription status for the logged-in user
 */
export async function getSubscriptionStatus() {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
        with: {
            currentPlan: true,
        },
    });

    if (!user) return null;

    const now = new Date();
    const trialActive = user.trialEndDate && now < new Date(user.trialEndDate);
    const hasActiveSubscription = user.subscriptionStatus === 'active';

    return {
        status: user.subscriptionStatus,
        trialActive,
        trialEndsAt: user.trialEndDate,
        currentPlan: user.currentPlan,
        hasAccess: trialActive || hasActiveSubscription,
        isViewOnly: !trialActive && !hasActiveSubscription && user.subscriptionStatus !== 'none',
        canCreateStore: trialActive || hasActiveSubscription,
    };
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription() {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Unauthorized');

    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
        with: {
            subscriptions: {
                where: eq(subscriptions.status, 'active'),
                limit: 1,
            },
        },
    });

    if (!user || !user.subscriptions || user.subscriptions.length === 0) {
        return { success: false, error: 'No active subscription found' };
    }

    const subscription = user.subscriptions[0];

    if (!subscription.razorpaySubscriptionId) {
        return { success: false, error: 'Invalid subscription' };
    }

    if (!razorpay) {
        return { success: false, error: 'Razorpay is not configured' };
    }

    try {
        // Cancel subscription in Razorpay
        await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);

        // Update local subscription
        await db.update(subscriptions)
            .set({
                cancelAtPeriodEnd: true,
                status: 'cancelled',
                cancelledAt: new Date(),
            })
            .where(eq(subscriptions.id, subscription.id));

        return { success: true };
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return { success: false, error: 'Failed to cancel subscription' };
    }
}
