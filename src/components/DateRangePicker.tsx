import { format } from "date-fns";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
      <input
        type="date"
        value={format(startDate, "yyyy-MM-dd")}
        onChange={(e) =>
          onStartDateChange(new Date(e.target.value + "T12:00:00Z"))
        }
        className="border border-secondary-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
      />
      <span className="text-secondary-600 text-sm text-center sm:text-left">
        to
      </span>
      <input
        type="date"
        value={format(endDate, "yyyy-MM-dd")}
        onChange={(e) =>
          onEndDateChange(new Date(e.target.value + "T12:00:00Z"))
        }
        className="border border-secondary-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
      />
    </div>
  );
}
