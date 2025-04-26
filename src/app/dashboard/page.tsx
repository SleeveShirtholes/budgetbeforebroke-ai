import BudgetCategoriesProgress from "@/components/BudgetCategoriesProgress";
import MonthlySpendingChart from "@/components/MonthlySpendingChart";
import StatsCard from "@/components/StatsCard";

// Mock data - replace with real data from your backend
const monthlySpendingData = [
    { month: "Jan", amount: 1200 },
    { month: "Feb", amount: 1800 },
    { month: "Mar", amount: 1400 },
    { month: "Apr", amount: 900 },
    { month: "May", amount: 1100 },
    { month: "Jun", amount: 1300 },
    { month: "Jul", amount: 1250 },
    { month: "Aug", amount: 1600 },
    { month: "Sep", amount: 1450 },
    { month: "Oct", amount: 1000 },
    { month: "Nov", amount: 1200 },
    { month: "Dec", amount: 1100 },
];

const budgetCategories = [
    { name: "Housing", spent: 1200, budget: 1500, color: "rgb(78, 0, 142)" }, // primary-500
    { name: "Food", spent: 400, budget: 500, color: "rgb(153, 51, 255)" }, // primary-400
    { name: "Transportation", spent: 200, budget: 300, color: "rgb(179, 102, 255)" }, // primary-300
    { name: "Entertainment", spent: 150, budget: 200, color: "rgb(209, 153, 255)" }, // primary-200
    { name: "Shopping", spent: 300, budget: 400, color: "rgb(230, 204, 255)" }, // primary-100
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Spending"
                    value="$2,250"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    }
                    trend={{ value: 8.2, isPositive: false }}
                />
                <StatsCard
                    title="Budget Remaining"
                    value="$750"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                    }
                />
                <StatsCard
                    title="Categories On Track"
                    value="4/5"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    }
                    trend={{ value: 12.5, isPositive: true }}
                />
                <StatsCard
                    title="Savings Rate"
                    value="15%"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                        </svg>
                    }
                    trend={{ value: 2.3, isPositive: true }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MonthlySpendingChart data={monthlySpendingData} />
                </div>
                <div>
                    <BudgetCategoriesProgress categories={budgetCategories} />
                </div>
            </div>
        </div>
    );
}
