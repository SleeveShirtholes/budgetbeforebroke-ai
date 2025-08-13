import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import type { PaycheckWarning } from "@/app/actions/paycheck-planning";
import { dismissWarning } from "@/app/actions/paycheck-planning";

interface WarningsPanelProps {
  warnings: PaycheckWarning[];
  budgetAccountId: string;
  onWarningDismissed?: () => void;
}

const severityConfig = {
  high: {
    icon: ExclamationTriangleIcon,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    textColor: "text-red-900",
    titleColor: "text-red-800",
  },
  medium: {
    icon: ExclamationCircleIcon,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    textColor: "text-yellow-900",
    titleColor: "text-yellow-800",
  },
  low: {
    icon: InformationCircleIcon,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    textColor: "text-blue-900",
    titleColor: "text-blue-800",
  },
};

export default function WarningsPanel({
  warnings,
  budgetAccountId,
  onWarningDismissed,
}: WarningsPanelProps) {
  const [dismissingWarnings, setDismissingWarnings] = useState<Set<string>>(
    new Set(),
  );
  const [isExpanded, setIsExpanded] = useState(false);

  if (warnings.length === 0) return null;

  const handleDismissWarning = async (warning: PaycheckWarning) => {
    const warningKey = generateWarningKey(warning);
    const fullKey = `${warning.type}:${warningKey}`;

    if (dismissingWarnings.has(fullKey)) return;

    setDismissingWarnings((prev) => new Set(prev).add(fullKey));

    try {
      await dismissWarning(budgetAccountId, warning.type, warningKey);
      onWarningDismissed?.();
    } catch (error) {
      console.error("Failed to dismiss warning:", error);
    } finally {
      setDismissingWarnings((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fullKey);
        return newSet;
      });
    }
  };

  const generateWarningKey = (warning: PaycheckWarning): string => {
    switch (warning.type) {
      case "late_payment":
        return `${warning.debtId}:${warning.paycheckId}`;
      case "insufficient_funds":
        return warning.paycheckId || "unknown";
      case "debt_unpaid":
        return warning.debtId || "unknown";
      default:
        return warning.debtId || warning.paycheckId || "unknown";
    }
  };

  // Group warnings by severity
  const groupedWarnings = warnings.reduce(
    (acc, warning) => {
      if (!acc[warning.severity]) {
        acc[warning.severity] = [];
      }
      acc[warning.severity].push(warning);
      return acc;
    },
    {} as Record<string, PaycheckWarning[]>,
  );

  const severityOrder: Array<keyof typeof severityConfig> = [
    "high",
    "medium",
    "low",
  ];
  const hasHighSeverity = warnings.some((w) => w.severity === "high");

  return (
    <Card
      className={`${hasHighSeverity ? "border-red-200" : "border-yellow-200"} border p-4 sm:p-3`}
    >
      <div className="space-y-3 sm:space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon
              className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${hasHighSeverity ? "text-red-600" : "text-yellow-600"}`}
            />
            <h3
              className={`text-base sm:text-sm font-semibold ${hasHighSeverity ? "text-red-900" : "text-yellow-900"}`}
            >
              Payment Warnings
            </h3>
            <span className="text-sm sm:text-xs text-gray-500">
              {warnings.length} issue{warnings.length !== 1 ? "s" : ""} found
            </span>
          </div>
          <Button
            variant="text"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center space-x-1 w-full sm:w-auto px-3 py-2 sm:px-2 sm:py-1"
          >
            {isExpanded ? (
              <>
                <span className="text-sm sm:text-xs">Collapse</span>
                <ChevronUpIcon className="h-4 w-4 sm:h-3 sm:w-3" />
              </>
            ) : (
              <>
                <span className="text-sm sm:text-xs">Expand</span>
                <ChevronDownIcon className="h-4 w-4 sm:h-3 sm:w-3" />
              </>
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-3 sm:space-y-2">
            {severityOrder.map((severity) => {
              const severityWarnings = groupedWarnings[severity];
              if (!severityWarnings || severityWarnings.length === 0)
                return null;

              const config = severityConfig[severity];
              const Icon = config.icon;

              return (
                <div key={severity} className="space-y-3 sm:space-y-2">
                  <h4
                    className={`text-sm sm:text-xs font-medium ${config.titleColor} capitalize`}
                  >
                    {severity} Priority ({severityWarnings.length})
                  </h4>
                  <div className="space-y-2 sm:space-y-1.5">
                    {severityWarnings.map((warning, index) => (
                      <div
                        key={`${warning.type}-${index}`}
                        className={`flex items-start space-x-3 sm:space-x-2 p-3 sm:p-2.5 rounded-lg ${config.bgColor} ${config.borderColor} border`}
                      >
                        <Icon
                          className={`h-5 w-5 sm:h-4 sm:w-4 ${config.iconColor} flex-shrink-0 mt-0.5`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm sm:text-xs ${config.textColor}`}
                          >
                            {warning.message}
                          </p>
                          {(warning.debtId || warning.paycheckId) && (
                            <div className="mt-2 sm:mt-1 text-sm sm:text-xs text-gray-500">
                              {warning.type === "debt_unpaid" &&
                                "Consider adjusting payment schedule or increasing income"}
                              {warning.type === "insufficient_funds" &&
                                "Consider postponing non-essential payments"}
                              {warning.type === "late_payment" &&
                                "Consider paying early or adjusting due dates"}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="text"
                          size="sm"
                          onClick={() => handleDismissWarning(warning)}
                          disabled={dismissingWarnings.has(
                            `${warning.type}:${generateWarningKey(warning)}`,
                          )}
                          className="flex-shrink-0 p-1.5 sm:p-1 h-6 w-6 sm:h-5 sm:w-5"
                          title="Dismiss warning"
                        >
                          <XMarkIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-gray-400 hover:text-gray-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary and suggestions */}
        {isExpanded && (
          <div className="pt-4 sm:pt-3 border-t border-gray-200">
            <div className="text-sm sm:text-xs text-gray-600">
              <p className="mb-3 sm:mb-2">
                <strong>Suggestions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 sm:space-y-1.5 text-sm sm:text-xs">
                {hasHighSeverity && (
                  <>
                    <li>
                      Review your income sources and consider adding additional
                      sources
                    </li>
                    <li>
                      Prioritize essential debt payments and consider
                      renegotiating due dates
                    </li>
                  </>
                )}
                {groupedWarnings.medium && (
                  <li>
                    Consider adjusting payment timing to align better with
                    paycheck dates
                  </li>
                )}
                <li>
                  Set up automatic payments a few days after each paycheck
                </li>
                <li>
                  Build an emergency fund to handle unexpected payment timing
                  issues
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
