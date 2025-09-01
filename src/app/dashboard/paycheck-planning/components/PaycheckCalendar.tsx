import { useState, useMemo, useRef, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Card from "@/components/Card";
import Button from "@/components/Button";
import type { PaycheckInfo } from "@/app/actions/paycheck-planning";

interface PaycheckCalendarProps {
  paychecks: PaycheckInfo[];
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Pop-up calendar component that displays paycheck markers for each month
 * Appears as an overlay underneath the trigger button
 */
export default function PaycheckCalendar({
  paychecks,
  isOpen,
  onClose,
  triggerRef,
}: PaycheckCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Group paychecks by month
  const paychecksByMonth = useMemo(() => {
    const groups = new Map<string, PaycheckInfo[]>();

    paychecks.forEach((paycheck) => {
      // Parse date string safely without timezone issues
      // paycheck.date is in format "YYYY-MM-DD", so we can extract year and month directly
      const [year, month] = paycheck.date.split("-");
      const monthKey = `${year}-${month}`;

      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(paycheck);
    });

    return groups;
  }, [paychecks]);

  // Get paycheck dates for the month being displayed
  const displayedMonthKey = format(currentMonth, "yyyy-MM");
  const displayedMonthPaychecks = paychecksByMonth.get(displayedMonthKey) || [];

  // Generate calendar days for the current month with proper day-of-week alignment
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });

    // Get the day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = start.getDay();

    // Add padding days at the beginning to align with the calendar grid
    const paddingDays = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddingDays.push(null); // null represents empty cells
    }

    return [...paddingDays, ...daysInMonth];
  }, [currentMonth]);

  // Check if a day has paychecks
  const getPaychecksForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return displayedMonthPaychecks.filter(
      (paycheck: PaycheckInfo) => paycheck.date === dateString,
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1),
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute z-50 mt-2 -right-2">
      <Card className="w-80 shadow-lg border border-gray-200">
        <div className="p-3 space-y-2">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                Paycheck Calendar
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
            </button>

            <h4 className="text-sm font-semibold text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </h4>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div
                  key={`day-${index}`}
                  className="py-1 text-center text-xs font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                // Handle null padding days
                if (day === null) {
                  return (
                    <div
                      key={index}
                      className="min-h-[36px] p-0.5 border-r border-b border-gray-200 bg-gray-50"
                    />
                  );
                }

                const dayPaychecks = getPaychecksForDay(day);
                const isCurrentDay = isToday(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={index}
                    className={`min-h-[36px] p-0.5 border-r border-b border-gray-200 ${
                      isCurrentMonth ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* Day Number */}
                    <div
                      className={`text-xs font-medium mb-1 ${
                        isCurrentDay
                          ? "text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center mx-auto"
                          : isCurrentMonth
                            ? "text-gray-900"
                            : "text-gray-400"
                      }`}
                    >
                      {format(day, "d")}
                    </div>

                    {/* Paycheck Marker */}
                    {dayPaychecks.length > 0 && (
                      <div className="flex justify-center">
                        <div className="p-1 bg-green-100 border border-green-300 rounded-full">
                          <CurrencyDollarIcon className="h-3 w-3 text-green-700" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Month Summary */}
          {displayedMonthPaychecks.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs font-medium text-blue-900">
                    {format(currentMonth, "MMMM yyyy")} Summary
                  </p>
                  <p className="text-xs text-blue-800">
                    {displayedMonthPaychecks.length} paycheck
                    {displayedMonthPaychecks.length !== 1 ? "s" : ""} • Total: $
                    {displayedMonthPaychecks
                      .reduce(
                        (sum: number, p: PaycheckInfo) => sum + p.amount,
                        0,
                      )
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
