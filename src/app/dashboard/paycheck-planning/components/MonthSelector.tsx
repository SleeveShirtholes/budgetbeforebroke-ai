import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";

interface MonthSelectorProps {
  selectedDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function MonthSelector({
  selectedDate,
  onPreviousMonth,
  onNextMonth,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousMonth}
        className="flex items-center"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      
      <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
        <span className="text-sm font-medium text-gray-900">
          {format(selectedDate, 'MMMM yyyy')}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextMonth}
        className="flex items-center"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}