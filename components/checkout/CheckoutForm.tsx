'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { createOrder } from '@/lib/actions/checkout';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/lib/actions/razorpay';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentMethod {
    id: string;
    provider: string;
    name: string;
    enabled: boolean;
}

interface CheckoutFormProps {
    storeSlug: string;
    storeCurrency: string;
    deliveryCost: string;
    paymentMethods: PaymentMethod[];
    onSubmitReady?: (submitFn: () => void) => void;
    onErrorChange?: (error: string | null) => void;
    onSubmittingChange?: (isSubmitting: boolean) => void;
}

export default function CheckoutForm({ storeSlug, storeCurrency, deliveryCost, paymentMethods, onSubmitReady, onErrorChange, onSubmittingChange }: CheckoutFormProps) {
    const router = useRouter();
    const { items, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedCountryId, setSelectedCountryId] = useState('in');
    const [shippingMethod, setShippingMethod] = useState<'pickup' | 'delivery'>('pickup');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | 'upi'>(
        (paymentMethods.length > 0 && (paymentMethods[0].provider === 'cod' || paymentMethods[0].provider === 'razorpay' || paymentMethods[0].provider === 'upi'))
            ? paymentMethods[0].provider as 'cod' | 'razorpay' | 'upi'
            : 'cod'
    );

    // Address state
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');

    const countryCodes = [
        { id: 'us', code: '+1', country: 'United States', flag: '🇺🇸' },
        { id: 'ca', code: '+1', country: 'Canada', flag: '🇨🇦' },
        { id: 'in', code: '+91', country: 'India', flag: '🇮🇳' },
        { id: 'gb', code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
        { id: 'au', code: '+61', country: 'Australia', flag: '🇦🇺' },
        { id: 'cn', code: '+86', country: 'China', flag: '🇨🇳' },
        { id: 'jp', code: '+81', country: 'Japan', flag: '🇯🇵' },
        { id: 'de', code: '+49', country: 'Germany', flag: '🇩🇪' },
        { id: 'fr', code: '+33', country: 'France', flag: '🇫🇷' },
        { id: 'ae', code: '+971', country: 'UAE', flag: '🇦🇪' },
        { id: 'sg', code: '+65', country: 'Singapore', flag: '🇸🇬' },
        { id: 'br', code: '+55', country: 'Brazil', flag: '🇧🇷' },
        { id: 'mx', code: '+52', country: 'Mexico', flag: '🇲🇽' },
        { id: 'za', code: '+27', country: 'South Africa', flag: '🇿🇦' },
        { id: 'kr', code: '+82', country: 'South Korea', flag: '🇰🇷' },
        { id: 'es', code: '+34', country: 'Spain', flag: '🇪🇸' },
        { id: 'it', code: '+39', country: 'Italy', flag: '🇮🇹' },
        { id: 'ru', code: '+7', country: 'Russia', flag: '🇷🇺' },
        { id: 'id', code: '+62', country: 'Indonesia', flag: '🇮🇩' },
        { id: 'my', code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    ];

    // Expose submit function to parent
    useEffect(() => {
        if (onSubmitReady) {
            onSubmitReady(() => {
                const form = document.querySelector('form');
                if (form) {
                    form.requestSubmit();
                }
            });
        }
    }, [onSubmitReady]);

    // Notify parent of error changes
    useEffect(() => {
        if (onErrorChange) {
            onErrorChange(error);
        }
    }, [error, onErrorChange]);

    // Notify parent of submitting state
    useEffect(() => {
        if (onSubmittingChange) {
            onSubmittingChange(isSubmitting);
        }
    }, [isSubmitting, onSubmittingChange]);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleRazorpayPayment = async (orderData: any, totalAmount: number) => {
        try {
            // Create Razorpay order
            const razorpayOrderResult = await createRazorpayOrder({
                storeSlug,
                amount: totalAmount,
                currency: storeCurrency,
                receipt: `order_${Date.now()}`,
            });

            if (!razorpayOrderResult.success || !razorpayOrderResult.orderId) {
                setError(razorpayOrderResult.error || 'Failed to create Razorpay order');
                setIsSubmitting(false);
                return;
            }

            // Initialize Razorpay checkout
            const options = {
                key: razorpayOrderResult.keyId,
                amount: razorpayOrderResult.amount,
                currency: razorpayOrderResult.currency,
                name: 'Order Payment',
                description: `Payment for order`,
                order_id: razorpayOrderResult.orderId,
                handler: async function (response: any) {
                    // Verify payment
                    const verifyResult = await verifyRazorpayPayment(
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature,
                        storeSlug
                    );

                    if (verifyResult.success) {
                        // Create order in database
                        const result = await createOrder(orderData);

                        if (result.success && result.orderId) {
                            clearCart();
                            router.push(`/${storeSlug}/order-confirmation/${result.orderId}`);
                        } else {
                            setError(result.error || 'Failed to create order');
                            setIsSubmitting(false);
                        }
                    } else {
                        setError('Payment verification failed');
                        setIsSubmitting(false);
                    }
                },
                prefill: {
                    name: customerName,
                    email: customerEmail,
                    contact: customerPhone,
                },
                theme: {
                    color: '#4E44FD',
                },
                modal: {
                    ondismiss: function () {
                        setError('Payment cancelled');
                        setIsSubmitting(false);
                    },
                },
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        } catch (err) {
            console.error('Razorpay error:', err);
            setError('Failed to initialize payment');
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Validate cart
            if (items.length === 0) {
                setError('Your cart is empty');
                setIsSubmitting(false);
                return;
            }

            const selectedCountry = countryCodes.find(c => c.id === selectedCountryId);
            const fullPhoneNumber = selectedCountry ? `${selectedCountry.code}${customerPhone}` : customerPhone;

            const orderData = {
                storeSlug,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price.toString(),
                })),
                customerName,
                customerEmail,
                customerPhone: fullPhoneNumber,
                countryCode: selectedCountry?.code || '',
                shippingMethod,
                paymentMethod,
                shippingAddress: shippingMethod === 'delivery' ? {
                    addressLine1,
                    addressLine2,
                    city,
                    state,
                    zipCode,
                } : undefined,
            };

            // Calculate total amount
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shippingCost = shippingMethod === 'delivery' ? parseFloat(deliveryCost) : 0;
            const totalAmount = subtotal + shippingCost;

            // Handle payment based on selected method
            if (paymentMethod === 'razorpay') {
                // Handle Razorpay payment
                await handleRazorpayPayment(orderData, totalAmount);
            } else if (paymentMethod === 'upi') {
                // Handle UPI payment - create order first, then redirect to UPI payment page
                const result = await createOrder(orderData);

                if (result.success && result.orderId) {
                    // Clear cart
                    clearCart();
                    // Redirect to UPI payment page
                    router.push(`/${storeSlug}/upi-payment/${result.orderId}`);
                } else {
                    setError(result.error || 'Failed to create order');
                    setIsSubmitting(false);
                }
            } else {
                // Handle COD payment
                const result = await createOrder(orderData);

                if (result.success && result.orderId) {
                    // Clear cart
                    clearCart();
                    // Redirect to confirmation page
                    router.push(`/${storeSlug}/order-confirmation/${result.orderId}`);
                } else {
                    setError(result.error || 'Failed to create order');
                    setIsSubmitting(false);
                }
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Customer Details Section */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Checkout Details</h2>
                <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter your full name"
                            className="h-11 sm:h-12 rounded-xl border-gray-200 focus-visible:ring-[#4E44FD] focus-visible:border-[#4E44FD]"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="h-11 sm:h-12 rounded-xl border-gray-200 focus-visible:ring-[#4E44FD] focus-visible:border-[#4E44FD]"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                        <div className="flex gap-2">
                            <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                                <SelectTrigger className="w-[100px] sm:w-[120px] border-gray-200 rounded-xl focus:ring-[#4E44FD] focus:border-[#4E44FD] h-11 sm:h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {countryCodes.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            <span className="flex items-center gap-2">
                                                <span>{c.flag}</span>
                                                <span>{c.code}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                id="phone"
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="Phone number"
                                className="flex-1 h-11 sm:h-12 rounded-xl border-gray-200 focus-visible:ring-[#4E44FD] focus-visible:border-[#4E44FD]"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipping Method Section */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Shipping</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setShippingMethod('pickup')}
                        className={`p-4 sm:p-5 border-2 rounded-xl sm:rounded-2xl transition-all text-left ${shippingMethod === 'pickup'
                            ? 'border-[#4E44FD] bg-[#4E44FD]/5'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <span className="text-base sm:text-lg font-bold text-gray-900">Pick up</span>
                            <span className="text-sm sm:text-base text-green-600 font-bold">FREE</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">Collect from store</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShippingMethod('delivery')}
                        className={`p-4 sm:p-5 border-2 rounded-xl sm:rounded-2xl transition-all text-left ${shippingMethod === 'delivery'
                            ? 'border-[#4E44FD] bg-[#4E44FD]/5'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <span className="text-base sm:text-lg font-bold text-gray-900">Delivery</span>
                            <span className="text-sm sm:text-base font-bold text-gray-900">${parseFloat(deliveryCost).toFixed(2)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">Deliver to your address</p>
                    </button>
                </div>

                {/* Conditional Address Fields */}
                {shippingMethod === 'delivery' && (
                    <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="address1" className="text-sm font-medium text-gray-700">Address Line 1</Label>
                            <Input
                                id="address1"
                                type="text"
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                                placeholder="Street address"
                                className="h-11 sm:h-12 rounded-xl border-gray-200 focus-visible:ring-[#4E44FD] focus-visible:border-[#4E44FD]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address2" className="text-sm font-medium text-gray-700">Address Line 2</Label>
                            <Input
                                id="address2"
                                type="text"
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                                placeholder="Apartment, suite, etc. (optional)"
                                className="h-11 sm:h-12 rounded-xl border-gray-200 focus-visible:ring-[#4E44FD] focus-visible:border-[#4E44FD]"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                                <Input
                                    id="city"
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="City"
                                    className="h-11 sm:h-12 rounded-xl border-gray-200 focus-visible:ring-[#4E44FD] focus-visible:border-[#4E44FD]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                                <Input
                                    id="state"
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="State"
                                    className="h-11 sm:h-12 rounded-xl border-gray-200 focus-visible:ring-[#4E44FD] focus-visible:border-[#4E44FD]"
                                    required
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <Label htmlFor="zipcode" className="text-sm font-medium text-gray-700">Zip Code</Label>
                                <Input
                                    id="zipcode"
                                    type="text"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    placeholder="Zip code"
                                    className="h-11 sm:h-12 rounded-xl border-gray-200 focus-visible:ring-[#4E44FD] focus-visible:border-[#4E44FD]"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                {paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No payment methods available</p>
                        <p className="text-sm mt-2">Please contact the store owner</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => {
                                    if (method.provider === 'cod' || method.provider === 'razorpay' || method.provider === 'upi') {
                                        setPaymentMethod(method.provider);
                                    }
                                }}
                                className={`w-full p-5 border-2 rounded-2xl transition-all text-left ${paymentMethod === method.provider
                                    ? 'border-[#4E44FD] bg-[#4E44FD]/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === method.provider ? 'bg-[#4E44FD]' : 'bg-gray-200'
                                        }`}>
                                        {method.provider === 'cod' ? (
                                            <svg className={`w-5 h-5 ${paymentMethod === method.provider ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        ) : method.provider === 'razorpay' ? (
                                            <svg className={`w-5 h-5 ${paymentMethod === method.provider ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        ) : method.provider === 'upi' ? (
                                            <svg className={`w-5 h-5 ${paymentMethod === method.provider ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        ) : (
                                            <svg className={`w-5 h-5 ${paymentMethod === method.provider ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-lg font-bold text-gray-900 block">{method.name}</span>
                                        <span className="text-sm text-gray-500">
                                            {method.provider === 'cod' ? 'Pay when you receive' :
                                                method.provider === 'razorpay' ? 'Pay online securely' :
                                                    method.provider === 'upi' ? 'Pay via UPI apps' :
                                                        'Online payment'}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>


        </form>
    );
}
