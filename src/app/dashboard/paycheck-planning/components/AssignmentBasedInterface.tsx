import { useState, useMemo, useCallback, useRef, memo } from "react";
import { format, addMonths } from "date-fns";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import Card from "@/components/Card";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";
import CustomSelect from "@/components/Forms/CustomSelect";
import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import NumberInput from "@/components/Forms/NumberInput";
import Table, { ColumnDef } from "@/components/Table";
import { formatDateSafely } from "@/utils/date";
import PaymentModal from "./PaymentModal";
import PaycheckCalendar from "./PaycheckCalendar";
import type {
  PaycheckAllocation,
  PaycheckInfo,
} from "@/app/actions/paycheck-planning";

type MonthlyDebtRecord = {
  id: string;
  debtId: string;
  debtName: string;
  amount: number;
  dueDate: string;
  frequency: string;
  description?: string;
  isRecurring: boolean;
  categoryId?: string;
  year: number;
  month: number;
  isActive: boolean;
};

interface AssignmentBasedInterfaceProps {
  paychecks: PaycheckInfo[];
  futurePaychecks: PaycheckInfo[];
  allocations: PaycheckAllocation[];
  unallocatedDebts: MonthlyDebtRecord[];
  hiddenDebts: MonthlyDebtRecord[];
  currentYear: number;
  currentMonth: number;
  planningWindowMonths: number;
  onDebtAllocated: (
    monthlyDebtPlanningId: string, // Changed from debtId to monthlyDebtPlanningId
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => Promise<void>;
  onDebtUnallocated: (
    monthlyDebtPlanningId: string,
    paycheckId: string,
  ) => Promise<void>;
  onDebtHidden: (monthlyDebtPlanningId: string) => Promise<void>;
  onDebtRestored: (monthlyDebtPlanningId: string) => Promise<void>;
  onMarkPaymentAsPaid?: (
    monthlyDebtPlanningId: string, // Changed from debtId to monthlyDebtPlanningId
    paymentId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => Promise<void>;
  isChangingMonth?: boolean;
  isChangingPlanningWindow?: boolean;
}

/**
 * Assignment-based interface for paycheck planning
 * Replaces drag-and-drop with simple assignment controls
 */
const AssignmentBasedInterface = memo(function AssignmentBasedInterface({
  paychecks,
  futurePaychecks,
  allocations,
  unallocatedDebts,
  hiddenDebts,
  currentYear,
  currentMonth,
  planningWindowMonths,
  onDebtAllocated,
  onDebtUnallocated,
  onDebtHidden,
  onDebtRestored,
  onMarkPaymentAsPaid,
  isChangingMonth = false,
  isChangingPlanningWindow = false,
}: AssignmentBasedInterfaceProps) {
  const [editingDebt, setEditingDebt] = useState<{
    debt: MonthlyDebtRecord;
    paycheckId: string;
    paymentAmount: number;
    paymentDate: string;
  } | null>(null);

  const [selectedDebts, setSelectedDebts] = useState<Set<string>>(new Set());
  const [selectedPaycheckId, setSelectedPaycheckId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingDebts, setDeletingDebts] = useState<Set<string>>(new Set());
  const [markingAsPaid, setMarkingAsPaid] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState("");
  const [hasUserEditedPaidAmount, setHasUserEditedPaidAmount] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null);
  const [paidDate, setPaidDate] = useState("");
  const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);
  const [isSkippedDebtsModalOpen, setIsSkippedDebtsModalOpen] = useState(false);
  const [skippingDebts, setSkippingDebts] = useState<Set<string>>(new Set());
  const [restoringDebts, setRestoringDebts] = useState<Set<string>>(new Set());
  const [isAssigningDebt, setIsAssigningDebt] = useState<string | null>(null);

  // PaymentModal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingDebtAssignment, setPendingDebtAssignment] = useState<{
    monthlyDebtPlanningId: string;
    paycheckId: string;
    debt: MonthlyDebtRecord;
  } | null>(null);

  // Define table columns for the custom Table component
  // Note: column keys must match raw data field names for sorting/search to work
  const tableColumns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: "debtName",
      header: "Name",
      sortable: true,
      filterable: true,
      filterPlaceholder: "Filter by name...",
      accessor: (row) => {
        const debt = row as unknown as MonthlyDebtRecord;
        return (
          <label
            htmlFor={`debt-${debt.id}`}
            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-600"
          >
            {debt.debtName}
          </label>
        );
      },
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      filterable: true,
      filterPlaceholder: "Filter by date...",
      accessor: (row) => {
        const debt = row as unknown as MonthlyDebtRecord;
        return (
          <span className="text-sm text-gray-600">
            {formatDateSafely(debt.dueDate, "MMM dd, yyyy")}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      filterable: true,
      filterPlaceholder: "Filter by amount...",
      accessor: (row) => {
        const debt = row as unknown as MonthlyDebtRecord;
        return (
          <span className="text-sm font-semibold text-gray-900">
            $
            {(debt.amount && !isNaN(debt.amount)
              ? debt.amount
              : 0
            ).toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      filterPlaceholder: "Filter by status...",
      accessor: (row) => {
        const statusText = (row as Record<string, unknown>)["status"] as string;
        if (statusText === "Past Due") {
          return (
            <span className="inline-flex items-center px-2 py-1 bg-red-50 border border-red-200 rounded-md text-xs font-medium text-red-700 shadow-sm">
              {statusText}
            </span>
          );
        }
        if (statusText === "Next Month") {
          return (
            <span className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-medium text-blue-700 shadow-sm">
              {statusText}
            </span>
          );
        }
        if (statusText.endsWith("Months Ahead")) {
          return (
            <span className="inline-flex items-center px-2 py-1 bg-purple-50 border border-purple-200 rounded-md text-xs font-medium text-purple-700 shadow-sm">
              {statusText}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-1 bg-green-50 border border-green-200 rounded-md text-xs font-medium text-green-700 shadow-sm">
            {statusText || "Current Month"}
          </span>
        );
      },
    },
    {
      key: "assignment",
      header: "Assign to Paycheck",
      sortable: false,
      filterable: false,
      width: "w-48",
      accessor: (row) => {
        const debt = row as unknown as MonthlyDebtRecord;
        return (
          <CustomSelect
            value=""
            onChange={(paycheckId) => {
              if (paycheckId) {
                handleDebtAssignment(debt.id, paycheckId);
              }
            }}
            options={[
              { value: "", label: "Select paycheck..." },
              ...paycheckOptions,
            ]}
            fullWidth={false}
            disabled={isAssigningDebt === debt.id}
          />
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      filterable: false,
      width: "w-24",
      accessor: (row) => {
        const debt = row as unknown as MonthlyDebtRecord;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDebtHidden(debt.id)}
            disabled={skippingDebts.has(debt.id)}
            isLoading={skippingDebts.has(debt.id)}
            className="text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
          >
            Skip
          </Button>
        );
      },
    },
  ];

  // Group paychecks by date and combine amounts for same-day paychecks
  const groupedPaychecks = useMemo(() => {
    if (!paychecks.length) return [];

    const groups = new Map<
      string,
      {
        paychecks: typeof paychecks;
        totalAmount: number;
        // store as YYYY-MM-DD
        date: string;
        names: string[];
      }
    >();

    paychecks.forEach((paycheck) => {
      const dateKey = paycheck.date; // already YYYY-MM-DD

      if (groups.has(dateKey)) {
        const group = groups.get(dateKey)!;
        group.paychecks.push(paycheck);
        group.totalAmount += paycheck.amount;
        group.names.push(paycheck.name);
      } else {
        groups.set(dateKey, {
          paychecks: [paycheck],
          totalAmount: paycheck.amount,
          date: dateKey,
          names: [paycheck.name],
        });
      }
    });

    const result = Array.from(groups.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return result;
  }, [paychecks]);

  const paycheckOptions = useMemo(() => {
    const options = groupedPaychecks.map((group, index) => ({
      value: `group-${index}`, // Use a group identifier
      label: `Paycheck ${index + 1}`,
      // Store the grouped paycheck info for display in cards
      group,
    }));

    return options;
  }, [groupedPaychecks]);

  // Calculate the time range being displayed
  const timeRange = useMemo(() => {
    try {
      const currentDate = new Date(currentYear, currentMonth - 1, 1);

      // Validate the date
      if (isNaN(currentDate.getTime())) {
        return "Invalid Date";
      }

      // The time range should show: current month + next N months
      // For "3 Months Ahead": Aug 2025 + Sep, Oct, Nov = Aug 2025 - Nov 2025
      const endDate = addMonths(currentDate, planningWindowMonths);

      const startMonth = format(currentDate, "MMM yyyy");
      const endMonth = format(endDate, "MMM yyyy");

      if (planningWindowMonths === 0) {
        return startMonth;
      } else {
        return `${startMonth} - ${endMonth}`;
      }
    } catch (error) {
      console.error("Error calculating time range:", error);
      return "Invalid Date";
    }
  }, [currentYear, currentMonth, planningWindowMonths]);

  // Instead of filtering debts, we should work with monthly debt planning records
  // This will be provided by the parent component and will contain the monthly instances
  const filteredDebts = useMemo(() => {
    // For now, return unallocatedDebts as-is
    // The parent component should provide monthly debt planning records instead
    return unallocatedDebts;
  }, [unallocatedDebts]);

  /**
   * Compute a human-readable status label for a monthly debt relative to
   * the currently viewed planning month/year. This value is injected into
   * the table data under the `status` key so the global table search can
   * match on it in addition to the visual badge rendering.
   */
  const computeStatus = useCallback(
    (debt: MonthlyDebtRecord): string => {
      // Cache the parsed date to avoid repeated parsing
      const [debtYearStr, debtMonthStr] = debt.dueDate.split("-");
      const debtYear = parseInt(debtYearStr, 10);
      const debtMonth = parseInt(debtMonthStr, 10);

      const isFutureDebt =
        debtYear > currentYear ||
        (debtYear === currentYear && debtMonth > currentMonth);
      const isPastDue =
        debtYear < currentYear ||
        (debtYear === currentYear && debtMonth < currentMonth);

      if (isPastDue) return "Past Due";
      if (isFutureDebt) {
        const monthsAhead =
          (debtYear - currentYear) * 12 + (debtMonth - currentMonth);
        if (monthsAhead === 1) return "Next Month";
        if (monthsAhead > 1) return `${monthsAhead} Months Ahead`;
      }
      return "Current Month";
    },
    [currentYear, currentMonth],
  );

  const tableData = useMemo(
    () => filteredDebts.map((d) => ({ ...d, status: computeStatus(d) })),
    [filteredDebts, computeStatus],
  );

  // Pre-compute status for all hidden debts to avoid repeated function calls
  const hiddenDebtsWithStatus = useMemo(
    () => hiddenDebts.map((debt) => ({ ...debt, status: computeStatus(debt) })),
    [hiddenDebts, computeStatus],
  );

  const handleDebtAssignment = async (
    monthlyDebtPlanningId: string, // Changed from debtId to monthlyDebtPlanningId
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => {
    // Find the debt by monthlyDebtPlanningId
    const debt = filteredDebts.find((d) => d.id === monthlyDebtPlanningId);
    if (!debt) {
      console.error(`Debt not found: ${monthlyDebtPlanningId}`);
      return;
    }

    // If paymentAmount and paymentDate are provided, proceed with allocation
    if (paymentAmount && paymentDate) {
      try {
        setIsAssigningDebt(monthlyDebtPlanningId);

        // If it's a grouped paycheck, assign to the first paycheck in the group
        let actualPaycheckId = paycheckId;
        if (paycheckId.startsWith("group-")) {
          const groupIndex = parseInt(paycheckId.replace("group-", ""));
          const group = groupedPaychecks[groupIndex];
          if (group && group.paychecks.length > 0) {
            actualPaycheckId = group.paychecks[0].id;
          }
        }

        await onDebtAllocated(
          debt.id, // This is now the monthlyDebtPlanningId
          actualPaycheckId,
          paymentAmount,
          paymentDate,
        );

        // Remove from selected debts if it was selected
        setSelectedDebts((prev) => {
          const newSelected = new Set(prev);
          newSelected.delete(debt.id);
          return newSelected;
        });

        // Close the modal if it was open
        if (editingDebt) {
          setEditingDebt(null);
        }
      } catch (error) {
        console.error("Error assigning debt:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to assign debt",
        );
      } finally {
        setIsAssigningDebt(null);
      }
    } else {
      // Show PaymentModal to collect payment details
      setPendingDebtAssignment({
        monthlyDebtPlanningId,
        paycheckId,
        debt,
      });
      setIsPaymentModalOpen(true);
    }
  };

  const handleDebtHidden = useCallback(
    async (monthlyDebtPlanningId: string) => {
      try {
        setSkippingDebts((prev) => new Set(prev).add(monthlyDebtPlanningId));
        await onDebtHidden(monthlyDebtPlanningId);
      } catch (error) {
        console.error("Error hiding debt:", error);
        setErrorMessage("Failed to skip debt. Please try again.");
      } finally {
        setSkippingDebts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(monthlyDebtPlanningId);
          return newSet;
        });
      }
    },
    [onDebtHidden],
  );

  const handleDebtRestored = useCallback(
    async (monthlyDebtPlanningId: string) => {
      try {
        setRestoringDebts((prev) => new Set(prev).add(monthlyDebtPlanningId));
        await onDebtRestored(monthlyDebtPlanningId);
        // Close the modal after successful restoration
        setIsSkippedDebtsModalOpen(false);
      } catch (error) {
        console.error("Error restoring debt:", error);
        setErrorMessage("Failed to restore debt. Please try again.");
      } finally {
        setRestoringDebts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(monthlyDebtPlanningId);
          return newSet;
        });
      }
    },
    [onDebtRestored],
  );

  /**
   * Handle PaymentModal confirmation
   */
  const handlePaymentModalConfirm = async (
    paymentAmount: number,
    paymentDate: string,
  ) => {
    if (!pendingDebtAssignment) return;

    try {
      await handleDebtAssignment(
        pendingDebtAssignment.monthlyDebtPlanningId,
        pendingDebtAssignment.paycheckId,
        paymentAmount,
        paymentDate,
      );

      // Close the modal
      setIsPaymentModalOpen(false);
      setPendingDebtAssignment(null);
    } catch (error) {
      console.error("Error in payment modal confirmation:", error);
      // Error is already handled in handleDebtAssignment
    }
  };

  /**
   * Handle PaymentModal close
   */
  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setPendingDebtAssignment(null);
  };

  const handleBulkAssignment = async () => {
    // Clear any previous error messages
    setErrorMessage("");

    // Validation
    if (selectedDebts.size === 0) {
      setErrorMessage("Please select at least one debt to assign.");
      return;
    }

    if (!selectedPaycheckId) {
      setErrorMessage("Please select a paycheck to assign debts to.");
      return;
    }

    // For bulk assignment, we'll use a simplified approach with default values
    // since showing individual modals for each debt would be cumbersome
    setIsAssigning(true);
    try {
      // If it's a grouped paycheck, assign to the first paycheck in the group
      let actualPaycheckId = selectedPaycheckId;
      if (selectedPaycheckId.startsWith("group-")) {
        const groupIndex = parseInt(selectedPaycheckId.replace("group-", ""));
        const group = groupedPaychecks[groupIndex];
        if (group && group.paychecks.length > 0) {
          actualPaycheckId = group.paychecks[0].id;
        }
      }

      // Set loading state for all selected debts
      const selectedDebtIds = Array.from(selectedDebts);
      selectedDebtIds.forEach((id) => setIsAssigningDebt(id));

      const promises = selectedDebtIds.map((monthlyDebtPlanningId: string) => {
        // Find the debt by monthlyDebtPlanningId in filteredDebts
        const debt = filteredDebts.find((d) => d.id === monthlyDebtPlanningId);
        if (debt) {
          return onDebtAllocated(
            debt.id, // This is now the monthlyDebtPlanningId
            actualPaycheckId,
            debt.amount,
            format(new Date(), "yyyy-MM-dd"),
          );
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setSelectedDebts(new Set());
      setSelectedPaycheckId("");
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to perform bulk assignment:", error);
      setErrorMessage("Failed to assign debts. Please try again.");
    } finally {
      setIsAssigning(false);
      // Clear individual loading states
      selectedDebts.forEach(() => setIsAssigningDebt(null));
    }
  };

  const handleDebtRemoval = async (debtId: string) => {
    try {
      // Find which paycheck this debt is allocated to
      const allocation = allocations.find((a) =>
        a.allocatedDebts.some((d) => d.debtId === debtId),
      );

      if (allocation) {
        await onDebtUnallocated(debtId, allocation.paycheckId);
      } else {
        console.error("Could not find paycheck allocation for debt:", debtId);
        throw new Error("Could not find paycheck allocation for debt");
      }
    } catch (error) {
      console.error("Failed to remove debt:", error);
      // Re-throw the error so the calling code can handle it
      throw error;
    }
  };

  const getDebtsForPaycheck = (paycheckId: string) => {
    // If it's a grouped paycheck, get all allocations for all paychecks in the group
    if (paycheckId.startsWith("group-")) {
      const groupIndex = parseInt(paycheckId.replace("group-", ""));
      const group = groupedPaychecks[groupIndex];

      if (!group) {
        return [];
      }

      // Get all paycheck IDs in this group
      const groupPaycheckIds = group.paychecks.map((p) => p.id);

      // Return all allocations for any paycheck in this group
      const result = allocations.filter((allocation) =>
        groupPaycheckIds.includes(allocation.paycheckId),
      );
      return result;
    }

    // For individual paychecks (fallback)
    return allocations.filter(
      (allocation) => allocation.paycheckId === paycheckId,
    );
  };

  return (
    <div className="space-y-6">
      {/* Available Debts Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Available Debts
            </h2>
            <p className="text-sm text-gray-600">
              {filteredDebts.length} debt
              {filteredDebts.length !== 1 ? "s" : ""} to allocate
            </p>
            <p className="text-xs text-gray-500 mt-1">
              💡 You can assign future debts to paychecks to plan ahead
            </p>
          </div>

          {/* Time Range Indicator */}
          <div className="flex-shrink-0">
            <span className="px-3 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg border border-blue-200">
              {timeRange}
            </span>
          </div>
        </div>

        {isChangingMonth || isChangingPlanningWindow ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600 font-medium">
                {isChangingMonth
                  ? "Loading month data..."
                  : "Updating planning window..."}
              </p>
            </div>
          </Card>
        ) : unallocatedDebts.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-4">
              <CheckCircleIcon className="mx-auto h-8 w-8 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Debts Allocated
              </h3>
              <p className="text-base text-gray-600">
                Great job! All debts have been assigned to paychecks.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              {/* Debt List with Checkboxes - Desktop: Custom Table, Mobile: Vertical Layout */}

              {filteredDebts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div>
                    <CheckCircleIcon className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm text-gray-500">
                      No debts available to allocate
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop: Custom Table Component */}
                  <div className="hidden lg:block">
                    <Table
                      data={tableData as unknown as Record<string, unknown>[]}
                      columns={tableColumns}
                      className="bg-white"
                      showPagination={false}
                      selectable={true}
                      selectedRows={selectedDebts}
                      onSelectionChange={setSelectedDebts}
                      getRowId={(row) => {
                        // Use the debt ID for row identification
                        return (row as MonthlyDebtRecord).id;
                      }}
                      showMobileView={false}
                    />
                  </div>

                  {/* Mobile: Vertical Layout */}
                  <div className="lg:hidden space-y-3">
                    {/* Mobile Select All Checkbox */}
                    <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id="select-all-mobile"
                        checked={
                          selectedDebts.size === filteredDebts.length &&
                          filteredDebts.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allDebtIds = new Set(
                              filteredDebts.map((debt) => debt.id),
                            );
                            setSelectedDebts(allDebtIds);
                          } else {
                            setSelectedDebts(new Set());
                          }
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="select-all-mobile"
                        className="text-sm text-gray-600 font-medium"
                      >
                        Select All ({filteredDebts.length})
                      </label>
                    </div>

                    {filteredDebts.map((debt) => {
                      const isSelected = selectedDebts.has(debt.id);

                      // Check if debt is due in a future month relative to the current month being viewed
                      const [debtYearStr, debtMonthStr] =
                        debt.dueDate.split("-");
                      const debtYear = parseInt(debtYearStr, 10);
                      const debtMonth = parseInt(debtMonthStr, 10);

                      // Simple logic: debt is future if it's due in a month after the current month being viewed
                      const isFutureDebt =
                        debtYear > currentYear ||
                        (debtYear === currentYear && debtMonth > currentMonth);
                      const isPastDue =
                        debtYear < currentYear ||
                        (debtYear === currentYear && debtMonth < currentMonth);

                      // Calculate months ahead for badge display
                      let monthsAhead = 0;
                      if (isFutureDebt) {
                        monthsAhead =
                          (debtYear - currentYear) * 12 +
                          (debtMonth - currentMonth);
                      }

                      return (
                        <div
                          key={debt.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              id={`debt-${debt.id}`}
                              checked={isSelected}
                              onChange={(e) => {
                                const newSelected = new Set(selectedDebts);
                                if (e.target.checked) {
                                  newSelected.add(debt.id);
                                } else {
                                  newSelected.delete(debt.id);
                                }
                                setSelectedDebts(newSelected);
                              }}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />

                            {/* Debt Info - Compact */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <label
                                  htmlFor={`debt-${debt.id}`}
                                  className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-primary-600 flex-1 min-w-0"
                                >
                                  {debt.debtName}
                                </label>
                                {/* Show appropriate badge based on due date - positioned on the right */}
                                {isPastDue && (
                                  <span className="inline-flex items-center whitespace-nowrap max-w-max flex-shrink-0 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1 shadow-sm ml-2">
                                    Past Due
                                  </span>
                                )}
                                {isFutureDebt && monthsAhead === 1 && (
                                  <span className="inline-flex items-center whitespace-nowrap max-w-max flex-shrink-0 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 shadow-sm ml-2">
                                    Next Month
                                  </span>
                                )}
                                {isFutureDebt && monthsAhead > 1 && (
                                  <span className="inline-flex items-center whitespace-nowrap max-w-max flex-shrink-0 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md px-2 py-1 shadow-sm ml-2">
                                    {monthsAhead} Months Ahead
                                  </span>
                                )}
                                {!isPastDue && !isFutureDebt && (
                                  <span className="inline-flex items-center whitespace-nowrap max-w-max flex-shrink-0 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-1 shadow-sm ml-2">
                                    Current Month
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <CalendarDaysIcon className="h-3 w-3" />
                                  {formatDateSafely(
                                    debt.dueDate,
                                    "MMM dd, yyyy",
                                  )}
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                  $
                                  {(debt.amount && !isNaN(debt.amount)
                                    ? debt.amount
                                    : 0
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Mobile Paycheck Assignment - Always visible for better UX */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <CustomSelect
                                value=""
                                onChange={(paycheckId) => {
                                  if (paycheckId) {
                                    handleDebtAssignment(debt.id, paycheckId);
                                  }
                                }}
                                options={[
                                  { value: "", label: "Select paycheck..." },
                                  ...paycheckOptions,
                                ]}
                                disabled={isAssigningDebt === debt.id}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDebtHidden(debt.id)}
                                disabled={skippingDebts.has(debt.id)}
                                isLoading={skippingDebts.has(debt.id)}
                                className="text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                              >
                                Skip
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
                {/* View Skipped Debts Button */}
                {hiddenDebts && hiddenDebts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSkippedDebtsModalOpen(true)}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  >
                    View Skipped ({hiddenDebts.length})
                  </Button>
                )}

                {/* Spacer to push button to the left */}
                <div className="flex-1"></div>
              </div>

              {/* Bulk Assignment Controls - Optional for multiple selections */}
              {selectedDebts.size > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-blue-900">
                        Bulk Assignment ({selectedDebts.size} selected)
                      </h3>
                      <button
                        onClick={() => setSelectedDebts(new Set())}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Clear Selection
                      </button>
                    </div>

                    {/* Paycheck Dropdown */}
                    <div className="w-full lg:w-auto">
                      <CustomSelect
                        value={selectedPaycheckId}
                        onChange={(value) => setSelectedPaycheckId(value)}
                        options={[
                          { value: "", label: "Select paycheck..." },
                          ...paycheckOptions,
                        ]}
                        fullWidth={false}
                      />
                    </div>

                    {errorMessage && (
                      <div className="text-center text-red-600 text-sm">
                        <ExclamationTriangleIcon className="h-4 w-4 inline-block mr-1" />
                        {errorMessage}
                      </div>
                    )}

                    {/* Assign Button - Responsive sizing */}
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleBulkAssignment}
                      disabled={
                        selectedDebts.size === 0 ||
                        !selectedPaycheckId ||
                        isAssigning
                      }
                      className="w-full lg:w-auto"
                      isLoading={isAssigning}
                    >
                      {isAssigning ? "Assigning..." : "Assign Selected"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Paycheck Allocations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Paycheck Allocations
          </h2>
          <div className="relative">
            <button
              ref={calendarButtonRef}
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700 hover:shadow-md hover:-translate-y-0.5 rounded-md transition-all duration-200 whitespace-nowrap"
            >
              <CalendarDaysIcon className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Paycheck Calendar</span>
            </button>

            {/* Paycheck Calendar Popup */}
            {isCalendarOpen && (
              <PaycheckCalendar
                paychecks={[...paychecks, ...futurePaychecks]}
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                triggerRef={calendarButtonRef}
              />
            )}
          </div>
        </div>

        {/* Paycheck Cards - Responsive grid for multiple cards */}
        {isChangingMonth || isChangingPlanningWindow ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600 font-medium">
                {isChangingMonth
                  ? "Loading paycheck data..."
                  : "Updating planning window..."}
              </p>
            </div>
          </Card>
        ) : paycheckOptions.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Paychecks Available
              </h3>
              <p className="text-gray-600">
                No paychecks found for this month. Please check your income
                sources.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paycheckOptions.map((option) => {
              const group = option.group;
              const paycheckAllocations = getDebtsForPaycheck(option.value);
              const totalAllocated = paycheckAllocations.reduce(
                (sum, allocation) =>
                  sum +
                  allocation.allocatedDebts.reduce(
                    (debtSum, debt) =>
                      debtSum +
                      (debt.paymentAmount && !isNaN(debt.paymentAmount)
                        ? debt.paymentAmount
                        : debt.amount),
                    0,
                  ),
                0,
              );
              const remaining = group.totalAmount - totalAllocated;

              return (
                <Card
                  key={option.value}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Paycheck Header */}
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="p-2 rounded-lg bg-secondary-50 border border-secondary-200 flex-shrink-0">
                            <CurrencyDollarIcon className="h-4 w-4 text-secondary-600" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {option.label.split(" - ")[0]}{" "}
                            {/* Show "Paycheck 1", "Paycheck 2", etc. */}
                          </h3>
                        </div>
                        <span className="font-bold text-gray-900 text-lg flex-shrink-0">
                          ${group.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CalendarDaysIcon className="h-3 w-3" />
                        <span>
                          {group.names.join(", ")} -{" "}
                          {formatDateSafely(group.date, "MMM dd")}
                        </span>
                      </div>
                    </div>

                    {/* Allocated Debts */}
                    {(() => {
                      const totalAllocatedDebts = paycheckAllocations.reduce(
                        (sum, a) => sum + a.allocatedDebts.length,
                        0,
                      );
                      return totalAllocatedDebts > 0 ? (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-700 border-b border-gray-200 pb-1">
                            Allocated Payments ({totalAllocatedDebts})
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {paycheckAllocations.flatMap((allocation) =>
                              allocation.allocatedDebts.map((debt) => (
                                <div
                                  key={debt.debtId}
                                  className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                                >
                                  {/* Simple Header */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          debt.isPaid
                                            ? "bg-green-500"
                                            : "bg-secondary-500"
                                        }`}
                                      ></div>
                                      <span className="text-sm font-medium text-gray-900">
                                        {debt.debtName}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Simple Details */}
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">
                                      Due{" "}
                                      {formatDateSafely(debt.dueDate, "MMM dd")}
                                    </span>

                                    {debt.isPaid ? (
                                      <span className="text-xs text-green-600 font-medium">
                                        Paid{" "}
                                        {formatDateSafely(
                                          debt.paymentDate || "",
                                          "MMM dd",
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-secondary-600">
                                        Scheduled
                                      </span>
                                    )}
                                  </div>

                                  {/* Amount Information */}
                                  <div className="flex items-center justify-between mb-3 text-xs">
                                    <span className="text-gray-500">
                                      Due:{" "}
                                      <span className="font-medium text-gray-900">
                                        $
                                        {(debt.amount && !isNaN(debt.amount)
                                          ? debt.amount
                                          : 0
                                        ).toLocaleString()}
                                      </span>
                                    </span>

                                    {debt.paymentAmount &&
                                      !isNaN(debt.paymentAmount) &&
                                      debt.amount &&
                                      !isNaN(debt.amount) &&
                                      debt.paymentAmount !== debt.amount && (
                                        <span className="text-secondary-600">
                                          Paying:{" "}
                                          <span className="font-medium text-secondary-900">
                                            $
                                            {debt.paymentAmount.toLocaleString()}
                                          </span>
                                        </span>
                                      )}
                                  </div>

                                  {/* Simple Actions */}
                                  <div className="flex items-center justify-end space-x-2">
                                    {!debt.isPaid && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setMarkingAsPaid(debt.debtId);
                                            // Initialize with current payment amount and today's date
                                            setPaidAmount(
                                              (debt.paymentAmount &&
                                              !isNaN(debt.paymentAmount)
                                                ? debt.paymentAmount
                                                : debt.amount
                                              ).toString(),
                                            );
                                            setPaidDate(
                                              format(new Date(), "yyyy-MM-dd"),
                                            );
                                            setHasUserEditedPaidAmount(false);
                                          }}
                                          className="text-xs px-2 py-1 h-7"
                                          title="Mark as paid"
                                        >
                                          Mark Paid
                                        </Button>

                                        <Button
                                          variant="danger"
                                          size="sm"
                                          onClick={async () => {
                                            setDeletingDebts((prev) =>
                                              new Set(prev).add(debt.debtId),
                                            );
                                            try {
                                              await handleDebtRemoval(
                                                debt.debtId,
                                              );
                                            } finally {
                                              setDeletingDebts((prev) => {
                                                const newSet = new Set(prev);
                                                newSet.delete(debt.debtId);
                                                return newSet;
                                              });
                                            }
                                          }}
                                          disabled={deletingDebts.has(
                                            debt.debtId,
                                          )}
                                          className="text-xs px-2 py-1 h-7"
                                          title="Remove debt"
                                        >
                                          {deletingDebts.has(debt.debtId) ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                                          ) : (
                                            <XMarkIcon className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </>
                                    )}

                                    {debt.isPaid && (
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={async () => {
                                          setDeletingDebts((prev) =>
                                            new Set(prev).add(debt.debtId),
                                          );
                                          try {
                                            await handleDebtRemoval(
                                              debt.debtId,
                                            );
                                          } finally {
                                            setDeletingDebts((prev) => {
                                              const newSet = new Set(prev);
                                              newSet.delete(debt.debtId);
                                              return newSet;
                                            });
                                          }
                                        }}
                                        disabled={deletingDebts.has(
                                          debt.debtId,
                                        )}
                                        className="text-xs px-2 py-1 h-7"
                                        title="Remove debt"
                                      >
                                        {deletingDebts.has(debt.debtId) ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                                        ) : (
                                          <XMarkIcon className="h-3 w-3" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )),
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-full bg-gray-100">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">
                              No debts assigned yet
                            </p>
                            <p className="text-xs text-gray-500 text-center max-w-48">
                              Assign debts from the Available Debts section
                              above to start planning your paycheck
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Remaining Balance */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {remaining >= 0 ? "Remaining Balance" : "Over Budget"}
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            remaining >= 0 ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          ${Math.abs(remaining).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Assignment Modal */}
      {editingDebt && (
        <Modal
          isOpen={!!editingDebt}
          onClose={() => setEditingDebt(null)}
          title="Assign Debt to Paycheck"
          footerButtons={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingDebt(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  handleDebtAssignment(
                    editingDebt.debt.id,
                    editingDebt.paycheckId,
                    editingDebt.paymentAmount,
                    editingDebt.paymentDate,
                  )
                }
              >
                Assign Debt
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Debt Info */}
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900">
                {editingDebt.debt.debtName}
              </p>
              <p className="text-xs text-gray-600">
                Amount: $
                {(editingDebt.debt.amount && !isNaN(editingDebt.debt.amount)
                  ? editingDebt.debt.amount
                  : 0
                ).toLocaleString()}
              </p>
            </div>

            {/* Paycheck Info */}
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900">
                {
                  paycheckOptions.find(
                    (o) => o.value === editingDebt.paycheckId,
                  )?.label
                }
              </p>
            </div>

            {/* Payment Amount */}
            <div>
              <NumberInput
                label="Payment Amount"
                value={editingDebt.paymentAmount.toString()}
                onChange={(value) =>
                  setEditingDebt((prev) =>
                    prev
                      ? {
                          ...prev,
                          paymentAmount:
                            Math.round(parseFloat(value) * 100) / 100 || 0,
                        }
                      : null,
                  )
                }
                required
              />
            </div>

            {/* Payment Date */}
            <div>
              <CustomDatePicker
                label="Payment Date"
                value={editingDebt.paymentDate}
                onChange={(date) =>
                  setEditingDebt((prev) =>
                    prev
                      ? {
                          ...prev,
                          paymentDate: date || "",
                        }
                      : null,
                  )
                }
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Mark as Paid Modal */}
      {markingAsPaid && (
        <Modal
          isOpen={!!markingAsPaid}
          onClose={() => {
            setMarkingAsPaid(null);
            setPaidAmount("");
            setPaidDate("");
          }}
          title="Mark Debt as Paid"
          footerButtons={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMarkingAsPaid(null);
                  setPaidAmount("");
                  setPaidDate("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isMarkingAsPaid}
                onClick={async () => {
                  try {
                    setIsMarkingAsPaid(true);
                    if (onMarkPaymentAsPaid) {
                      // Find the payment ID for this debt
                      const allocation = allocations.find((a) =>
                        a.allocatedDebts.some(
                          (d) => d.debtId === markingAsPaid,
                        ),
                      );
                      const debt = allocation?.allocatedDebts.find(
                        (d) => d.debtId === markingAsPaid,
                      );

                      if (debt?.paymentId) {
                        // Parse the payment amount and date from the form
                        const amount =
                          Math.round(parseFloat(paidAmount) * 100) / 100 ||
                          debt.amount;
                        const date =
                          paidDate || format(new Date(), "yyyy-MM-dd");

                        await onMarkPaymentAsPaid(
                          markingAsPaid,
                          debt.paymentId,
                          amount,
                          date,
                        );
                      } else {
                        console.error(
                          "No payment ID found for debt:",
                          markingAsPaid,
                        );
                      }
                    }
                    setMarkingAsPaid(null);
                    setPaidAmount("");
                    setPaidDate("");
                  } catch (error) {
                    console.error("Failed to mark debt as paid:", error);
                  } finally {
                    setIsMarkingAsPaid(false);
                  }
                }}
              >
                {isMarkingAsPaid ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Marking...</span>
                  </div>
                ) : (
                  "Mark as Paid"
                )}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Payment Amount */}
            <div>
              <NumberInput
                label="Amount Paid"
                value={
                  hasUserEditedPaidAmount
                    ? paidAmount
                    : paidAmount ||
                      allocations
                        .flatMap((a) => a.allocatedDebts)
                        .find((d) => d.debtId === markingAsPaid)
                        ?.amount.toString() ||
                      ""
                }
                onChange={(value) => {
                  setPaidAmount(value);
                  setHasUserEditedPaidAmount(true);
                }}
                required
              />
            </div>

            {/* Payment Date */}
            <div>
              <CustomDatePicker
                label="Date Paid"
                value={paidDate}
                onChange={(date) => setPaidDate(date || "")}
                required
              />
            </div>

            {/* Confirmation Message */}
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                Are you sure you want to mark this debt as paid? This action
                cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Skipped Debts Modal */}
      {isSkippedDebtsModalOpen && (
        <Modal
          isOpen={isSkippedDebtsModalOpen}
          onClose={() => setIsSkippedDebtsModalOpen(false)}
          title="Skipped Debts"
        >
          <div className="space-y-4">
            {hiddenDebts && hiddenDebts.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  {hiddenDebts.length} debt{hiddenDebts.length !== 1 ? "s" : ""}{" "}
                  skipped for this planning period. You can restore any of these
                  debts back to your planning.
                </div>

                {/* Mobile: List View */}
                <div className="lg:hidden space-y-3">
                  {hiddenDebts.map((debt) => {
                    const [debtYearStr, debtMonthStr] = debt.dueDate.split("-");
                    const debtYear = parseInt(debtYearStr, 10);
                    const debtMonth = parseInt(debtMonthStr, 10);

                    const isFutureDebt =
                      debtYear > currentYear ||
                      (debtYear === currentYear && debtMonth > currentMonth);
                    const isPastDue =
                      debtYear < currentYear ||
                      (debtYear === currentYear && debtMonth < currentMonth);

                    let monthsAhead = 0;
                    if (isFutureDebt) {
                      monthsAhead =
                        (debtYear - currentYear) * 12 +
                        (debtMonth - currentMonth);
                    }

                    return (
                      <div
                        key={debt.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-4">
                          {/* Debt Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {debt.debtName}
                              </h3>
                              {/* Status Badge */}
                              {isPastDue && (
                                <span className="inline-flex items-center whitespace-nowrap max-w-max flex-shrink-0 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1 shadow-sm ml-2">
                                  Past Due
                                </span>
                              )}
                              {isFutureDebt && monthsAhead === 1 && (
                                <span className="inline-flex items-center whitespace-nowrap max-w-max flex-shrink-0 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 shadow-sm ml-2">
                                  Next Month
                                </span>
                              )}
                              {isFutureDebt && monthsAhead > 1 && (
                                <span className="inline-flex items-center whitespace-nowrap max-w-max flex-shrink-0 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md px-2 py-1 shadow-sm ml-2">
                                  {monthsAhead} Months Ahead
                                </span>
                              )}
                              {!isPastDue && !isFutureDebt && (
                                <span className="inline-flex items-center whitespace-nowrap max-w-max flex-shrink-0 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-1 shadow-sm ml-2">
                                  Current Month
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="h-3 w-3" />
                                {formatDateSafely(debt.dueDate, "MMM dd, yyyy")}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                ${debt.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Restore Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDebtRestored(debt.id)}
                            disabled={restoringDebts.has(debt.id)}
                            isLoading={restoringDebts.has(debt.id)}
                            className="text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400"
                          >
                            Restore
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: Table View */}
                <div className="hidden lg:block">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Name
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                          Due Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Amount
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {hiddenDebtsWithStatus.map((debt) => {
                        const status = debt.status;
                        return (
                          <tr key={debt.id} className="hover:bg-gray-50">
                            <td className="px-3 py-4">
                              <span className="text-sm font-medium text-gray-900 truncate block">
                                {debt.debtName}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <span className="text-sm text-gray-600">
                                {formatDateSafely(debt.dueDate, "MMM dd, yyyy")}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <span className="text-sm font-semibold text-gray-900">
                                $
                                {(debt.amount && !isNaN(debt.amount)
                                  ? debt.amount
                                  : 0
                                ).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              {status === "Past Due" && (
                                <span className="inline-flex items-center px-2 py-1 bg-red-50 border border-red-200 rounded-md text-xs font-medium text-red-700 shadow-sm">
                                  {status}
                                </span>
                              )}
                              {status === "Next Month" && (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-medium text-blue-700 shadow-sm">
                                  {status}
                                </span>
                              )}
                              {status.endsWith("Months Ahead") && (
                                <span className="inline-flex items-center px-2 py-1 bg-purple-50 border border-purple-200 rounded-md text-xs font-medium text-purple-700 shadow-sm">
                                  {status}
                                </span>
                              )}
                              {(status === "Current Month" ||
                                (!status.includes("Past Due") &&
                                  !status.includes("Next Month") &&
                                  !status.endsWith("Months Ahead"))) && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-50 border border-green-200 rounded-md text-xs font-medium text-green-700 shadow-sm">
                                  {status || "Current Month"}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDebtRestored(debt.id)}
                                disabled={restoringDebts.has(debt.id)}
                                isLoading={restoringDebts.has(debt.id)}
                                className="text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400"
                              >
                                Restore
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">
                  No skipped debts for this planning period.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* PaymentModal for debt allocation */}
      {pendingDebtAssignment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          onConfirm={handlePaymentModalConfirm}
          debt={{
            id: pendingDebtAssignment.debt.debtId,
            name: pendingDebtAssignment.debt.debtName,
            amount: pendingDebtAssignment.debt.amount,
            dueDate: pendingDebtAssignment.debt.dueDate,
            frequency: pendingDebtAssignment.debt.frequency,
            description: pendingDebtAssignment.debt.description,
            isRecurring: pendingDebtAssignment.debt.isRecurring,
            categoryId: pendingDebtAssignment.debt.categoryId,
          }}
          paycheck={(() => {
            // Find the actual paycheck information
            if (pendingDebtAssignment.paycheckId.startsWith("group-")) {
              const groupIndex = parseInt(
                pendingDebtAssignment.paycheckId.replace("group-", ""),
              );
              const group = groupedPaychecks[groupIndex];
              if (group && group.paychecks.length > 0) {
                const paycheck = group.paychecks[0];
                return {
                  id: paycheck.id,
                  name: group.names.join(", "),
                  amount: group.totalAmount,
                  date: paycheck.date,
                  frequency: paycheck.frequency,
                  userId: paycheck.userId,
                };
              }
            }
            // Fallback to a default paycheck if we can't find the actual one
            return {
              id: pendingDebtAssignment.paycheckId,
              name: "Selected Paycheck",
              amount: 0,
              date: format(new Date(), "yyyy-MM-dd"),
              frequency: "monthly" as const,
              userId: "",
            };
          })()}
        />
      )}
    </div>
  );
});

export default AssignmentBasedInterface;
