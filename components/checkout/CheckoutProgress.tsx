'use client';

import React from 'react';

interface CheckoutProgressProps {
    currentStep: 'cart' | 'checkout' | 'confirmation';
}

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
    const steps = [
        { id: 'cart', label: 'Cart', number: 1 },
        { id: 'checkout', label: 'Checkout', number: 2 },
        { id: 'confirmation', label: 'Confirmation', number: 3 },
    ];

    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    return (
        <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${index < currentStepIndex
                                    ? 'bg-green-500 text-white'
                                    : index === currentStepIndex
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {index < currentStepIndex ? '✓' : step.number}
                            </div>
                            <span
                                className={`text-xs sm:text-sm md:text-base hidden xs:inline ${index <= currentStepIndex
                                    ? 'font-semibold text-green-600'
                                    : 'text-gray-500'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="w-8 sm:w-12 h-0.5 bg-gray-300"></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
