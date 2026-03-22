'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { DateRange } from '@/lib/actions/analytics';

const dateRanges: { value: DateRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
];

export default function DateRangeFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentRange = (searchParams.get('range') as DateRange) || 'all';

    const handleRangeChange = (range: DateRange) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('range', range);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max md:min-w-0">
                {dateRanges.map((range) => (
                    <button
                        key={range.value}
                        onClick={() => handleRangeChange(range.value)}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${currentRange === range.value
                                ? 'bg-[#4E44FD] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
