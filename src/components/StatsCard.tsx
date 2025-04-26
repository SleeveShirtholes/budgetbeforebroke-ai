interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
    return (
        <div className="bg-white rounded-xl shadow p-6 border border-secondary-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-secondary-600">{title}</p>
                    <p className="mt-1 text-2xl font-semibold text-secondary-900">{value}</p>
                </div>
                {icon && (
                    <div className="w-12 h-12 bg-secondary-50 rounded-full flex items-center justify-center text-secondary-500 ring-4 ring-secondary-100">
                        {icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4">
                    <div
                        className={`flex items-center text-sm ${
                            trend.isPositive ? "text-secondary-600" : "text-accent-700"
                        }`}
                    >
                        <span className="font-medium">
                            {trend.isPositive ? "+" : "-"}
                            {Math.abs(trend.value)}%
                        </span>
                        <svg
                            data-testid="trend-arrow"
                            className={`w-4 h-4 ml-1 ${trend.isPositive ? "transform rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
