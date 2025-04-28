import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
    trendDirection?: "up" | "down";
}

export default function StatsCard({ title, value, icon, trend, trendDirection }: StatsCardProps) {
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
                            trendDirection === "up" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        <span className="font-medium">{trend}</span>
                        {trendDirection === "up" ? (
                            <ArrowUpIcon className="w-4 h-4 ml-1" />
                        ) : (
                            <ArrowDownIcon className="w-4 h-4 ml-1" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
