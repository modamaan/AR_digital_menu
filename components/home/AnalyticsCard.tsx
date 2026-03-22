interface AnalyticsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

export default function AnalyticsCard({ title, value, icon }: AnalyticsCardProps) {
    return (
        <div className="bg-[#D4E9FF] rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:gap-3">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                    {icon}
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">{title}</h3>

                {/* Value */}
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-all">{value}</p>
            </div>
        </div>
    );
}
