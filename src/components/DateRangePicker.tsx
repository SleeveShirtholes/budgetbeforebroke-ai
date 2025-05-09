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
    <div className="flex items-center space-x-2">
      <input
        type="date"
        value={format(startDate, "yyyy-MM-dd")}
        onChange={(e) =>
          onStartDateChange(new Date(e.target.value + "T12:00:00Z"))
        }
        className="border border-secondary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <span className="text-secondary-600">to</span>
      <input
        type="date"
        value={format(endDate, "yyyy-MM-dd")}
        onChange={(e) =>
          onEndDateChange(new Date(e.target.value + "T12:00:00Z"))
        }
        className="border border-secondary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
}
