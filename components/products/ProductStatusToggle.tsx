'use client';

import { useState, useTransition } from 'react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { updateProductStatus } from '@/lib/actions/product';

interface ProductStatusToggleProps {
    productId: string;
    initialStatus: string;
}

export default function ProductStatusToggle({ productId, initialStatus }: ProductStatusToggleProps) {
    const [status, setStatus] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();

    const handleToggle = async (enabled: boolean) => {
        const newStatus = enabled ? 'active' : 'disabled';

        // Optimistic update
        setStatus(newStatus);

        startTransition(async () => {
            const result = await updateProductStatus(productId, newStatus);

            if (!result.success) {
                // Revert on error
                setStatus(status);
                alert(result.error || 'Failed to update status');
            }
        });
    };

    return (
        <div className="flex items-center gap-3">
            <ToggleSwitch
                enabled={status === 'active'}
                onChange={handleToggle}
                disabled={isPending}
            />
            <span className={`text-sm font-medium ${status === 'active' ? 'text-green-700' : 'text-gray-500'
                }`}>
                {status === 'active' ? 'Active' : 'Disabled'}
            </span>
        </div>
    );
}
