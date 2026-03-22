'use client';

import { useState } from 'react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}

export default function ToggleSwitch({ enabled, onChange, disabled = false }: ToggleSwitchProps) {
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        if (disabled || isToggling) return;

        setIsToggling(true);
        try {
            await onChange(!enabled);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={disabled || isToggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4E44FD] focus:ring-offset-2 ${enabled ? 'bg-green-500' : 'bg-gray-300'
                } ${(disabled || isToggling) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label={enabled ? 'Disable' : 'Enable'}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
}
