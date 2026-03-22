import Razorpay from 'razorpay';

// Only initialize Razorpay if credentials are provided
export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    : null;

// Plan IDs from Razorpay Dashboard
// You'll need to create these plans in your Razorpay dashboard and add the IDs here
export const RAZORPAY_PLANS = {
    lite_monthly: process.env.RAZORPAY_PLAN_LITE_MONTHLY || '',
    lite_yearly: process.env.RAZORPAY_PLAN_LITE_YEARLY || '',
    standard_monthly: process.env.RAZORPAY_PLAN_STANDARD_MONTHLY || '',
    standard_yearly: process.env.RAZORPAY_PLAN_STANDARD_YEARLY || '',
};
