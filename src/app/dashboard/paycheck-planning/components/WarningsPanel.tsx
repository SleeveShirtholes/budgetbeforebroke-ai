import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Card from "@/components/Card";
import type { PaycheckWarning } from "@/app/actions/paycheck-planning";

interface WarningsPanelProps {
  warnings: PaycheckWarning[];
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

export default function WarningsPanel({ warnings }: WarningsPanelProps) {
  if (warnings.length === 0) return null;

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
      className={`${hasHighSeverity ? "border-red-200" : "border-yellow-200"} border`}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon
            className={`h-5 w-5 ${hasHighSeverity ? "text-red-600" : "text-yellow-600"}`}
          />
          <h3
            className={`text-lg font-semibold ${hasHighSeverity ? "text-red-900" : "text-yellow-900"}`}
          >
            Payment Warnings
          </h3>
          <span className="text-sm text-gray-500">
            {warnings.length} issue{warnings.length !== 1 ? "s" : ""} found
          </span>
        </div>

        <div className="space-y-3">
          {severityOrder.map((severity) => {
            const severityWarnings = groupedWarnings[severity];
            if (!severityWarnings || severityWarnings.length === 0) return null;

            const config = severityConfig[severity];
            const Icon = config.icon;

            return (
              <div key={severity} className="space-y-2">
                <h4
                  className={`text-sm font-medium ${config.titleColor} capitalize`}
                >
                  {severity} Priority ({severityWarnings.length})
                </h4>
                <div className="space-y-2">
                  {severityWarnings.map((warning, index) => (
                    <div
                      key={`${warning.type}-${index}`}
                      className={`flex items-start space-x-3 p-3 rounded-lg ${config.bgColor} ${config.borderColor} border`}
                    >
                      <Icon
                        className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`}
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${config.textColor}`}>
                          {warning.message}
                        </p>
                        {(warning.debtId || warning.paycheckId) && (
                          <div className="mt-1 text-xs text-gray-500">
                            {warning.type === "debt_unpaid" &&
                              "Consider adjusting payment schedule or increasing income"}
                            {warning.type === "insufficient_funds" &&
                              "Consider postponing non-essential payments"}
                            {warning.type === "late_payment" &&
                              "Consider paying early or adjusting due dates"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary and suggestions */}
        <div className="pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Suggestions:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
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
              <li>Set up automatic payments a few days after each paycheck</li>
              <li>
                Build an emergency fund to handle unexpected payment timing
                issues
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
