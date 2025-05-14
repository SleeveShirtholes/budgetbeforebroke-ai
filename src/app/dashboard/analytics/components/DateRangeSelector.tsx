import PageInfo from "@/components/PageInfo";
import { format } from "date-fns";

/**
 * Props interface for the DateRangeSelector component
 */
interface DateRangeSelectorProps {
    startDate: Date;
    endDate: Date;
    onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

/**
 * A component that allows users to select a date range for viewing financial data.
 * Includes a help tooltip with usage instructions and date input fields.
 *
 * @param {Date} startDate - The initial start date of the range
 * @param {Date} endDate - The initial end date of the range
 * @param {Function} onDateRangeChange - Callback function that receives the new start and end dates when changed
 * @returns {JSX.Element} A date range selector with help tooltip
 */
export default function DateRangeSelector({ startDate, endDate, onDateRangeChange }: DateRangeSelectorProps) {
    const pageInfoContent = (
        <ul className="text-sm text-secondary-700 space-y-4 list-none leading-relaxed">
            <li>
                <span className="font-semibold text-secondary-900">Select a date range</span> to view your financial
                data for a specific period.
            </li>
            <li>
                <span className="font-semibold text-secondary-900">Click on any category</span> in the Budget Categories
                list to filter both the graph and transactions.
            </li>
            <li>
                <span className="font-semibold text-secondary-900">Use the view selector</span> to switch between
                different chart views:
                <ul className="ml-6 mt-2 space-y-2 list-disc text-secondary-700">
                    <li>
                        <span className="font-semibold">Total Spending:</span> Shows your overall spending over time
                    </li>
                    <li>
                        <span className="font-semibold">By Category:</span> Compare spending across different categories
                    </li>
                    <li>
                        <span className="font-semibold">Income vs Expenses:</span> Track your income against expenses
                    </li>
                </ul>
            </li>
            <li>
                In the <span className="font-semibold text-secondary-900">By Category</span> view, you can select
                multiple categories to compare them.
            </li>
        </ul>
    );

    return (
        <div className="flex items-center justify-end space-x-4">
            <PageInfo content={pageInfoContent} />
            {/* Date range input fields */}
            <div className="flex items-center space-x-2">
                <input
                    type="date"
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) => onDateRangeChange(new Date(e.target.value + "T12:00:00Z"), endDate)}
                    className="border border-secondary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-secondary-600">to</span>
                <input
                    type="date"
                    value={format(endDate, "yyyy-MM-dd")}
                    onChange={(e) => onDateRangeChange(startDate, new Date(e.target.value + "T12:00:00Z"))}
                    className="border border-secondary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
        </div>
    );
}
