'use client';

import { useState } from 'react';
import { shipOrder, cancelOrder } from '@/lib/actions/order';
import { useRouter } from 'next/navigation';
import ShipOrderModal from './ShipOrderModal';
import CancelOrderModal from './CancelOrderModal';

interface OrderActionButtonsProps {
    orderId: string;
    currentStatus: string;
}

export default function OrderActionButtons({ orderId, currentStatus }: OrderActionButtonsProps) {
    const router = useRouter();
    const [isShipping, setIsShipping] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showShipModal, setShowShipModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleShip = async () => {
        setIsShipping(true);
        const result = await shipOrder(orderId);

        if (result.success) {
            setShowShipModal(false);
            router.refresh();
        } else {
            alert(result.error || 'Failed to ship order');
        }
        setIsShipping(false);
    };

    const handleCancel = async () => {
        setIsCancelling(true);
        const result = await cancelOrder(orderId);

        if (result.success) {
            setShowCancelModal(false);
            router.refresh();
        } else {
            alert(result.error || 'Failed to cancel order');
        }
        setIsCancelling(false);
    };

    // Don't show ship button if order is already shipped, delivered, or cancelled
    const canShip = !['shipped', 'delivered', 'cancelled'].includes(currentStatus);

    // Don't show cancel button if order is already shipped, delivered, or cancelled
    const canCancel = !['shipped', 'delivered', 'cancelled'].includes(currentStatus);

    if (!canShip && !canCancel) {
        return null;
    }

    return (
        <>
            <div className="flex items-center gap-2 sm:gap-3">
                {canShip && (
                    <button
                        onClick={() => setShowShipModal(true)}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base font-semibold rounded-xl transition-colors"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span className="whitespace-nowrap">Ship Order</span>
                    </button>
                )}
                {canCancel && (
                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white hover:bg-gray-50 text-gray-900 text-sm sm:text-base font-semibold rounded-xl border-2 border-gray-200 transition-colors"
                    >
                        <span className="whitespace-nowrap">Cancel Order</span>
                    </button>
                )}
            </div>

            {/* Modals */}
            <ShipOrderModal
                isOpen={showShipModal}
                onClose={() => setShowShipModal(false)}
                onConfirm={handleShip}
                isLoading={isShipping}
            />
            <CancelOrderModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancel}
                isLoading={isCancelling}
            />
        </>
    );
}
