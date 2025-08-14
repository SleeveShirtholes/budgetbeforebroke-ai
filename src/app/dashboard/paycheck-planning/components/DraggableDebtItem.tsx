import { useDraggable } from "@dnd-kit/core";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { formatDateSafely } from "@/utils/date";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import type { DebtInfo } from "@/app/actions/paycheck-planning";

interface DraggableDebtItemProps {
  debt: DebtInfo;
  onMobileSelect?: (debt: DebtInfo) => void;
}

export default function DraggableDebtItem({
  debt,
  onMobileSelect,
}: DraggableDebtItemProps) {
  const { isMobile, isTouchDevice } = useDeviceDetection();
  const isPastDue = new Date(debt.dueDate) < new Date();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: debt.id,
      data: {
        type: "debt",
        debt,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleClick = () => {
    if ((isMobile || isTouchDevice) && onMobileSelect) {
      onMobileSelect(debt);
    }
  };

  const baseClasses = `transition-all duration-200 border-2 border-dashed rounded-lg p-3 sm:p-2 ${
    isPastDue ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50"
  } ${
    isDragging
      ? "opacity-50 rotate-3 scale-105 shadow-lg"
      : "hover:shadow-lg hover:scale-[1.02]"
  }`;

  const interactionClasses =
    isMobile || isTouchDevice
      ? "cursor-pointer active:scale-95"
      : "cursor-move";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`${baseClasses} ${interactionClasses}`}
    >
      <div className="space-y-2 sm:space-y-1">
        {/* Header with status indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div
              className={`w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0 ${
                isPastDue ? "bg-red-500" : "bg-yellow-500"
              }`}
            />
            <h3 className="text-sm sm:text-xs font-semibold text-gray-900 truncate">
              {debt.name}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm sm:text-xs font-bold text-gray-900">
              ${debt.amount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Details and past due warning */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600">
            {formatDateSafely(debt.dueDate, "MMM dd")} • {debt.frequency}
          </p>
          {isPastDue && (
            <div className="flex items-center gap-1.5 bg-red-100 border border-red-200 rounded-md px-2 py-1.5">
              <ExclamationTriangleIcon className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
              <span className="text-xs text-red-700 font-medium">Past Due</span>
            </div>
          )}
        </div>

        {/* Mobile instruction */}
        {(isMobile || isTouchDevice) && (
          <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-300">
            Tap to assign to a paycheck
          </div>
        )}
      </div>
    </div>
  );
}
