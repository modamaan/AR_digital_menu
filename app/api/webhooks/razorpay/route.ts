import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { subscriptions, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);

        console.log('Razorpay webhook event:', event.event);

        // Handle different event types
        switch (event.event) {
            case 'subscription.activated':
                await handleSubscriptionActivated(event.payload.subscription.entity);
                break;

            case 'subscription.charged':
                await handleSubscriptionCharged(event.payload.subscription.entity, event.payload.payment.entity);
                break;

            case 'subscription.cancelled':
                await handleSubscriptionCancelled(event.payload.subscription.entity);
                break;

            case 'subscription.paused':
            case 'subscription.halted':
                await handleSubscriptionPaused(event.payload.subscription.entity);
                break;

            case 'subscription.completed':
                await handleSubscriptionCompleted(event.payload.subscription.entity);
                break;

            default:
                console.log('Unhandled event type:', event.event);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

async function handleSubscriptionActivated(subscription: any) {
    try {
        const sub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.razorpaySubscriptionId, subscription.id),
            with: { user: true },
        });

        if (sub) {
            await db.update(subscriptions)
                .set({ status: 'active' })
                .where(eq(subscriptions.id, sub.id));

            await db.update(users)
                .set({ subscriptionStatus: 'active' })
                .where(eq(users.id, sub.userId));

            console.log('Subscription activated:', subscription.id);
        }
    } catch (error) {
        console.error('Error handling subscription activation:', error);
    }
}

async function handleSubscriptionCharged(subscription: any, payment: any) {
    try {
        const periodEnd = new Date(subscription.current_end * 1000);

        await db.update(subscriptions)
            .set({
                currentPeriodEnd: periodEnd,
                razorpayPaymentId: payment.id,
            })
            .where(eq(subscriptions.razorpaySubscriptionId, subscription.id));

        console.log('Subscription charged:', subscription.id);
    } catch (error) {
        console.error('Error handling subscription charge:', error);
    }
}

async function handleSubscriptionCancelled(subscription: any) {
    try {
        const sub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.razorpaySubscriptionId, subscription.id),
        });

        if (sub) {
            await db.update(subscriptions)
                .set({
                    status: 'cancelled',
                    cancelledAt: new Date(),
                })
                .where(eq(subscriptions.id, sub.id));

            await db.update(users)
                .set({ subscriptionStatus: 'expired' })
                .where(eq(users.id, sub.userId));

            console.log('Subscription cancelled:', subscription.id);
        }
    } catch (error) {
        console.error('Error handling subscription cancellation:', error);
    }
}

async function handleSubscriptionPaused(subscription: any) {
    try {
        await db.update(subscriptions)
            .set({ status: 'paused' })
            .where(eq(subscriptions.razorpaySubscriptionId, subscription.id));

        console.log('Subscription paused:', subscription.id);
    } catch (error) {
        console.error('Error handling subscription pause:', error);
    }
}

async function handleSubscriptionCompleted(subscription: any) {
    try {
        const sub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.razorpaySubscriptionId, subscription.id),
        });

        if (sub) {
            await db.update(subscriptions)
                .set({ status: 'expired' })
                .where(eq(subscriptions.id, sub.id));

            await db.update(users)
                .set({ subscriptionStatus: 'expired' })
                .where(eq(users.id, sub.userId));

            console.log('Subscription completed:', subscription.id);
        }
    } catch (error) {
        console.error('Error handling subscription completion:', error);
    }
}
