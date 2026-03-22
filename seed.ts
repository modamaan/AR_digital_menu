import { db } from './lib/db';
import { subscriptionPlans } from './lib/db/schema';

async function seed() {
    console.log('Seeding subscription plans...');

    const plans = [
        // Lite Plans
        {
            name: 'Lite Monthly',
            slug: 'lite_monthly',
            tier: 'lite',
            billingCycle: 'monthly',
            price: '10.00',
            currency: 'USD',
            razorpayPlanId: null, // Add this after creating in Razorpay dashboard
            hasCustomDomain: false,
            hasAdvancedAnalytics: false,
            removeBranding: false,
            isActive: true,
        },
        {
            name: 'Lite Yearly',
            slug: 'lite_yearly',
            tier: 'lite',
            billingCycle: 'yearly',
            price: '100.00',
            currency: 'USD',
            razorpayPlanId: null,
            hasCustomDomain: false,
            hasAdvancedAnalytics: false,
            removeBranding: false,
            isActive: true,
        },
        // Standard Plans
        {
            name: 'Standard Monthly',
            slug: 'standard_monthly',
            tier: 'standard',
            billingCycle: 'monthly',
            price: '25.00',
            currency: 'USD',
            razorpayPlanId: null,
            hasCustomDomain: true,
            hasAdvancedAnalytics: true,
            removeBranding: true,
            isActive: true,
        },
        {
            name: 'Standard Yearly',
            slug: 'standard_yearly',
            tier: 'standard',
            billingCycle: 'yearly',
            price: '250.00',
            currency: 'USD',
            razorpayPlanId: null,
            hasCustomDomain: true,
            hasAdvancedAnalytics: true,
            removeBranding: true,
            isActive: true,
        },
    ];

    for (const plan of plans) {
        await db.insert(subscriptionPlans).values(plan).onConflictDoNothing();
        console.log(`✓ Created plan: ${plan.name}`);
    }

    console.log('Seeding complete!');
    process.exit(0);
}

seed().catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
});
