'use client';

import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface StoreSetupFormProps {
    onComplete: (data: {
        storeName: string;
        currency: string;
        notifications: {
            whatsapp: boolean;
            email: boolean;
        };
        whatsappPhone?: string;
    }) => void;
    onBack: () => void;
}

export default function StoreSetupForm({ onComplete, onBack }: StoreSetupFormProps) {
    const [storeName, setStoreName] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [whatsappPhone, setWhatsappPhone] = useState('');
    const [selectedCountryId, setSelectedCountryId] = useState('in'); // Default to India
    const [notifications, setNotifications] = useState({
        whatsapp: false,
        email: true,
    });

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

    const currencies = [
        { code: 'USD', name: 'United States Dollar - USD' },
        { code: 'INR', name: 'Indian Rupee - INR' },
        { code: 'EUR', name: 'Euro - EUR' },
        { code: 'GBP', name: 'British Pound - GBP' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (storeName) {
            const selectedCountry = countryCodes.find(c => c.id === selectedCountryId);
            const fullPhoneNumber = selectedCountry
                ? `${selectedCountry.code}${whatsappPhone}`
                : whatsappPhone;

            onComplete({
                storeName,
                currency,
                notifications,
                whatsappPhone: notifications.whatsapp ? fullPhoneNumber : undefined
            });
        }
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Store Name */}
                <div className="relative group">
                    <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Store Name"
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#4E44FD] focus:outline-none bg-white transition-all text-lg text-gray-900 placeholder:text-gray-400 shadow-sm"
                        required
                    />
                </div>

                {/* Currency Selection */}
                <div className="relative group">
                    <label className="absolute -top-2.5 left-4 px-1 bg-white text-xs font-semibold text-gray-500 z-10">
                        Select currency
                    </label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#4E44FD] focus:outline-none bg-white transition-all appearance-none cursor-pointer text-gray-900 shadow-sm"
                    >
                        {currencies.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Notification Section */}
                <div className="pt-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Receive orders on</h3>

                    <div className="space-y-6">
                        {/* WhatsApp */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between group">
                                <span className="text-gray-600 font-medium">WhatsApp</span>
                                <button
                                    type="button"
                                    onClick={() => toggleNotification('whatsapp')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications.whatsapp ? 'bg-[#4E44FD]' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.whatsapp ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                            {notifications.whatsapp && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-medium text-gray-500 mb-2">WhatsApp number</label>
                                    <div className="flex items-center gap-2">
                                        <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                                            <SelectTrigger className="w-[140px] border-2 border-gray-200 rounded-2xl focus:border-[#4E44FD] h-12 shadow-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countryCodes.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        <span className="flex items-center gap-2">
                                                            <span>{c.flag}</span>
                                                            <span>{c.country}</span>
                                                            <span className="text-muted-foreground">{c.code}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input
                                            type="tel"
                                            value={whatsappPhone}
                                            onChange={(e) => setWhatsappPhone(e.target.value)}
                                            placeholder="Enter mobile number"
                                            className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#4E44FD] focus:outline-none bg-white transition-all text-gray-900 placeholder:text-gray-400 shadow-sm h-12"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between group">
                            <span className="text-gray-600 font-medium">Email</span>
                            <button
                                type="button"
                                onClick={() => toggleNotification('email')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications.email ? 'bg-[#4E44FD]' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 space-y-4">
                    <button
                        type="submit"
                        className="w-full bg-[#4E44FD] hover:bg-[#3d36ca] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-[#4E44FD]/20 active:scale-[0.98]"
                    >
                        Create Store
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full text-[#4E44FD] font-bold py-2 hover:underline transition-all block text-center"
                    >
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
}
