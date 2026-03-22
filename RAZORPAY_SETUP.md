# Razorpay Subscription Setup Instructions

## Environment Variables

Add the following to your `.env.local` file:

```env
# Razorpay API Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Razorpay Plan IDs (create these in Razorpay Dashboard)
RAZORPAY_PLAN_LITE_MONTHLY=plan_xxx
RAZORPAY_PLAN_LITE_YEARLY=plan_xxx
RAZORPAY_PLAN_STANDARD_MONTHLY=plan_xxx
RAZORPAY_PLAN_STANDARD_YEARLY=plan_xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Steps to Complete Setup

### 1. Create Razorpay Account

- Go to https://razorpay.com/
- Sign up for an account
- Complete KYC verification (required for live mode)

### 2. Get API Keys

- Go to Settings → API Keys
- Generate Test/Live keys
- Copy `Key ID` and `Key Secret` to `.env.local`

### 3. Create Subscription Plans in Razorpay Dashboard

Go to Subscriptions → Plans and create 4 plans:

**Lite Monthly**

- Plan Name: Lite Monthly
- Billing Interval: Monthly
- Amount: $10 (or ₹800 for INR)
- Currency: USD (or INR)
- Trial Period: 7 days

**Lite Yearly**

- Plan Name: Lite Yearly
- Billing Interval: Yearly
- Amount: $100 (or ₹8000 for INR)
- Currency: USD (or INR)
- Trial Period: 7 days

**Standard Monthly**

- Plan Name: Standard Monthly
- Billing Interval: Monthly
- Amount: $25 (or ₹2000 for INR)
- Currency: USD (or INR)
- Trial Period: 7 days

**Standard Yearly**

- Plan Name: Standard Yearly
- Billing Interval: Yearly
- Amount: $250 (or ₹20000 for INR)
- Currency: USD (or INR)
- Trial Period: 7 days

After creating each plan, copy the Plan ID and add to `.env.local`

### 4. Set up Webhooks

- Go to Settings → Webhooks
- Add Webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
- Select events:
  - `subscription.activated`
  - `subscription.charged`
  - `subscription.cancelled`
  - `subscription.paused`
  - `subscription.halted`
  - `subscription.completed`
- Copy the Webhook Secret to `.env.local`

### 5. Run Database Migration

```bash
npm run db:push
```

### 6. Seed Subscription Plans

```bash
npx tsx seed.ts
```

### 7. Update Plan IDs in Database

After creating plans in Razorpay, update the database with the plan IDs:

```sql
UPDATE subscription_plans SET razorpay_plan_id = 'plan_xxx' WHERE slug = 'lite_monthly';
UPDATE subscription_plans SET razorpay_plan_id = 'plan_xxx' WHERE slug = 'lite_yearly';
UPDATE subscription_plans SET razorpay_plan_id = 'plan_xxx' WHERE slug = 'standard_monthly';
UPDATE subscription_plans SET razorpay_plan_id = 'plan_xxx' WHERE slug = 'standard_yearly';
```

Or use Drizzle Studio:

```bash
npm run db:studio
```

## Testing

### Test Mode

- Use Razorpay test keys for development
- Use test card: 4111 1111 1111 1111
- Any future expiry date
- Any CVV

### Live Mode

- Switch to live keys in production
- Complete KYC verification
- Enable live mode in Razorpay dashboard

## Features by Plan

### Lite Plan ($10/month or $100/year)

- Order management
- Unlimited product listings
- Basic analytics
- Customer chat
- Coowik.com branding

### Standard Plan ($25/month or $250/year)

- Everything in Lite
- Custom domain support
- Advanced analytics
- Remove Coowik branding
- Priority support

## User Flow

1. New user signs up → Redirected to `/plans`
2. User selects plan (Lite or Standard, Monthly or Yearly)
3. 7-day free trial starts automatically
4. Razorpay checkout opens for payment setup
5. User can create store during trial
6. After 7 days:
   - If payment successful → Full access continues
   - If no payment → View-only mode (can see store but can't edit/add products)

## Troubleshooting

### Razorpay Checkout Not Opening

- Check if `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Verify Razorpay script is loaded
- Check browser console for errors

### Webhook Not Working

- Verify webhook URL is accessible
- Check webhook secret matches
- Test with Razorpay webhook tester

### Payment Not Reflecting

- Check webhook logs in Razorpay dashboard
- Verify database subscription records
- Check application logs for errors
