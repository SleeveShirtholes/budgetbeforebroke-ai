"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import { useDebtAllocationManager } from "@/hooks/usePaycheckPlanning";
import {
  updateDebtAllocation,
  markPaymentAsPaid,
} from "@/app/actions/paycheck-planning";
import { useToast } from "@/components/Toast";
import { formatDateSafely } from "@/utils/date";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

import DraggablePaycheckCard from "./components/DraggablePaycheckCard";
import EnhancedPaycheckCard from "./components/EnhancedPaycheckCard";
import DraggableDebtItem from "./components/DraggableDebtItem";
import MobileDebtSelector from "./components/MobileDebtSelector";
import DebtManagement from "./components/DebtManagement";
import WarningsPanel from "./components/WarningsPanel";
import type { DebtInfo } from "@/app/actions/paycheck-planning";

/**
 * Enhanced PaycheckPlanningPage Component
 *
 * A comprehensive page for planning paycheck allocation and debt payments with drag-and-drop functionality.
 * Features:
 * - Current month view of all paychecks with dates and amounts
 * - Drag-and-drop debt allocation to specific paychecks
 * - Real-time remaining balance calculations after debt payments
 * - User-friendly warnings for payment issues
 * - Easy debt payment reallocation
 */
export default function PaycheckPlanningPage() {
  const { selectedAccount, isLoading: isAccountsLoading } = useBudgetAccount();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDebtsModalOpen, setIsDebtsModalOpen] = useState(false);
  const [movingDebtId, setMovingDebtId] = useState<string | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [activeDebt, setActiveDebt] = useState<DebtInfo | null>(null);

  const { showToast } = useToast();
  const { isMobile, isTouchDevice } = useDeviceDetection();

  // Configure sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Use the new debt allocation manager hook
  const {
    planningData,
    allocations,
    handleDebtAllocated: originalHandleDebtAllocated,
    handleDebtUnallocated: originalHandleDebtUnallocated,
    mutatePlanningData,
    mutateAllocations,
  } = useDebtAllocationManager(
    selectedAccount?.id,
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1, // getMonth() returns 0-11, we need 1-12
  );

  // Wrap the handlers with toast notifications
  const handleDebtAllocated = async (
    debtId: string,
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => {
    try {
      await originalHandleDebtAllocated(
        debtId,
        paycheckId,
        paymentAmount,
        paymentDate,
      );
      const message =
        paymentAmount && paymentDate
          ? `Payment of $${paymentAmount.toLocaleString()} scheduled for ${formatDateSafely(paymentDate, "MMM dd, yyyy")}`
          : "Debt allocated successfully";
      showToast(message, { type: "success" });
    } catch (error) {
      console.error("Failed to allocate debt:", error);
      showToast("Failed to allocate debt", { type: "error" });
    }
  };

  const handleDebtUpdated = async (
    debtId: string,
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => {
    if (!selectedAccount?.id) {
      showToast("No budget account selected", { type: "error" });
      return;
    }

    try {
      await updateDebtAllocation(
        selectedAccount.id,
        debtId,
        paycheckId,
        "update",
        paymentAmount,
        paymentDate,
      );
      await Promise.all([mutatePlanningData?.(), mutateAllocations?.()]);
      const message =
        paymentAmount && paymentDate
          ? `Payment updated to $${paymentAmount.toLocaleString()} for ${formatDateSafely(paymentDate, "MMM dd, yyyy")}`
          : "Debt payment updated successfully";
      showToast(message, { type: "success" });
    } catch (error) {
      console.error("Failed to update debt payment:", error);
      showToast("Failed to update debt payment", { type: "error" });
    }
  };

  const handleDebtUnallocated = async (debtId: string, paycheckId: string) => {
    try {
      await originalHandleDebtUnallocated(debtId, paycheckId);
      showToast("Debt removed successfully", { type: "success" });
    } catch (error) {
      console.error("Failed to remove debt:", error);
      showToast("Failed to remove debt", { type: "error" });
    }
  };

  /**
   * Handle marking a debt payment as paid
   * This will mark the payment as paid and schedule the next payment for recurring debts
   */
  const handleMarkPaymentAsPaid = async (debtId: string, paymentId: string) => {
    if (!selectedAccount?.id) {
      showToast("No budget account selected", { type: "error" });
      return;
    }

    try {
      await markPaymentAsPaid(selectedAccount.id, debtId, paymentId);

      // Refresh the data to show updated payment status
      await Promise.all([mutatePlanningData?.(), mutateAllocations?.()]);

      showToast("Payment marked as paid successfully", { type: "success" });
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      showToast("Failed to mark payment as paid", { type: "error" });
    }
  };

  const handleDebtMoved = async (
    debtId: string,
    fromPaycheckId: string,
    toPaycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => {
    if (!selectedAccount?.id) {
      showToast("No budget account selected", { type: "error" });
      return;
    }

    setMovingDebtId(debtId);
    try {
      // Handle combined paychecks - extract date keys
      const fromDateKey = fromPaycheckId.startsWith("combined-")
        ? fromPaycheckId.replace("combined-", "")
        : null;
      const toDateKey = toPaycheckId.startsWith("combined-")
        ? toPaycheckId.replace("combined-", "")
        : null;

      if (fromDateKey && toDateKey) {
        // Moving between combined paychecks
        // First, unallocate from all paychecks on the source date
        const fromDateAllocations =
          allocations?.filter((allocation) => {
            const paycheck = paychecks?.find(
              (p) => p.id === allocation.paycheckId,
            );
            return (
              paycheck && format(paycheck.date, "yyyy-MM-dd") === fromDateKey
            );
          }) || [];

        await Promise.all(
          fromDateAllocations.map((allocation) =>
            updateDebtAllocation(
              selectedAccount.id,
              debtId,
              allocation.paycheckId,
              "unallocate",
            ),
          ),
        );

        // Then, allocate to the first paycheck on the target date
        const toDateAllocations =
          allocations?.filter((allocation) => {
            const paycheck = paychecks?.find(
              (p) => p.id === allocation.paycheckId,
            );
            return (
              paycheck && format(paycheck.date, "yyyy-MM-dd") === toDateKey
            );
          }) || [];

        if (toDateAllocations.length > 0) {
          await updateDebtAllocation(
            selectedAccount.id,
            debtId,
            toDateAllocations[0].paycheckId,
            "allocate",
            paymentAmount,
            paymentDate,
          );
        }
      } else {
        // Moving between individual paychecks
        await updateDebtAllocation(
          selectedAccount.id,
          debtId,
          fromPaycheckId,
          "unallocate",
        );
        await updateDebtAllocation(
          selectedAccount.id,
          debtId,
          toPaycheckId,
          "allocate",
          paymentAmount,
          paymentDate,
        );
      }

      await Promise.all([mutatePlanningData?.(), mutateAllocations?.()]);

      const message =
        paymentAmount && paymentDate
          ? `Payment moved to ${formatDateSafely(paymentDate, "MMM dd, yyyy")}`
          : "Debt moved successfully";
      showToast(message, { type: "success" });
    } catch (error) {
      console.error("Error moving debt:", error);
      showToast("Failed to move debt", { type: "error" });
    } finally {
      setMovingDebtId(null);
    }
  };

  // Calculate unallocated debts
  const unallocatedDebts = useMemo(() => {
    if (!planningData?.debts || !allocations) return [];

    const allocatedDebtIds = new Set(
      allocations.flatMap((allocation) =>
        allocation.allocatedDebts.map((debt) => debt.debtId),
      ),
    );

    return planningData.debts.filter((debt) => !allocatedDebtIds.has(debt.id));
  }, [planningData?.debts, allocations]);

  // Custom handlers for combined paychecks
  const handleCombinedDebtAllocated = async (
    debtId: string,
    dateKey: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => {
    if (!allocations || !paychecks) return;

    // Find all allocations for this date
    const dateAllocations = allocations.filter((allocation) => {
      const paycheck = paychecks.find((p) => p.id === allocation.paycheckId);
      return paycheck && format(paycheck.date, "yyyy-MM-dd") === dateKey;
    });

    if (dateAllocations.length === 0) return;

    // Allocate to the first paycheck on this date (or distribute evenly)
    const targetAllocation = dateAllocations[0];

    try {
      await originalHandleDebtAllocated(
        debtId,
        targetAllocation.paycheckId,
        paymentAmount,
        paymentDate,
      );
      const message =
        paymentAmount && paymentDate
          ? `Payment of $${paymentAmount.toLocaleString()} scheduled for ${formatDateSafely(paymentDate, "MMM dd, yyyy")}`
          : `Debt allocated to ${formatDateSafely(dateKey, "MMM dd")} paycheck`;
      showToast(message, { type: "success" });
    } catch (error) {
      console.error("Failed to allocate debt to combined paycheck:", error);
      showToast("Failed to allocate debt", { type: "error" });
    }
  };

  const handleCombinedDebtUnallocated = async (
    debtId: string,
    dateKey: string,
  ) => {
    if (!allocations || !paychecks) return;

    // Find all allocations for this date
    const dateAllocations = allocations.filter((allocation) => {
      const paycheck = paychecks.find((p) => p.id === allocation.paycheckId);
      return paycheck && format(paycheck.date, "yyyy-MM-dd") === dateKey;
    });

    // Remove from all paychecks on this date
    try {
      await Promise.all(
        dateAllocations.map((allocation) =>
          originalHandleDebtUnallocated(debtId, allocation.paycheckId),
        ),
      );
      showToast(
        `Debt removed from ${formatDateSafely(dateKey, "MMM dd")} paycheck`,
        { type: "success" },
      );
    } catch (error) {
      console.error("Failed to remove debt from combined paycheck:", error);
      showToast("Failed to remove debt", { type: "error" });
    }
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "debt") {
      setActiveDebt(active.data.current.debt);
    }
  };

  const handleDragOver = () => {
    // You can add visual feedback here if needed
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDebt(null);

    if (!over || !active.data.current?.debt) return;

    const debt = active.data.current.debt as DebtInfo;
    const paycheckId = over.id as string;

    try {
      await handleDebtAllocated(
        debt.id,
        paycheckId,
        debt.amount,
        formatDateSafely(new Date(), "yyyy-MM-dd"),
      );
    } catch (error) {
      console.error("Failed to allocate debt via drag and drop:", error);
    }
  };

  // Mobile debt selection handlers
  const handleMobileDebtSelect = () => {
    // This can be extended later for additional mobile functionality
  };

  const handleMobileDebtAssign = async (
    debtId: string,
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => {
    try {
      await handleDebtAllocated(debtId, paycheckId, paymentAmount, paymentDate);
    } catch (error) {
      console.error("Failed to assign debt on mobile:", error);
    }
  };

  // Loading states
  if (isAccountsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // No account selected
  if (!selectedAccount) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Budget Account Selected
          </h3>
          <p className="text-gray-600">
            Please select a budget account to view paycheck planning.
          </p>
        </div>
      </Card>
    );
  }

  const { paychecks = [], debts = [], warnings = [] } = planningData || {};

  const totalIncome = paychecks.reduce(
    (sum, paycheck) => sum + paycheck.amount,
    0,
  );
  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalAllocated =
    allocations?.reduce(
      (sum, allocation) =>
        sum +
        allocation.allocatedDebts.reduce(
          (debtSum, debt) => debtSum + debt.amount,
          0,
        ),
      0,
    ) || 0;
  const totalRemaining = totalIncome - totalAllocated;

  const isCurrentMonth =
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-3">
          {/* Mobile: Stacked Layout */}
          <div className="block md:hidden">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Paycheck Planning
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              {format(selectedDate, "MMMM yyyy")}
            </p>
          </div>

          {/* Desktop: Title and Month Navigation on same row */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Paycheck Planning
              </h1>
              <p className="text-gray-600 text-sm">
                {format(selectedDate, "MMMM yyyy")}
              </p>
            </div>

            {/* Month Navigation - Right side on desktop */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="p-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>

              {!isCurrentMonth && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToCurrentMonth}
                  className="text-xs px-3 py-2"
                >
                  Now
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="p-2"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile: Month Navigation - Below Title */}
          <div className="flex md:hidden items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="p-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>

            {!isCurrentMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentMonth}
                className="text-xs px-3 py-2"
              >
                Now
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="p-2"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Month Summary Card - Mobile Collapsible, Desktop Full */}
        <Card className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-2">
            {/* Header */}
            <div className="text-center sm:text-left">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                {format(selectedDate, "MMMM yyyy")} Summary
              </h2>
              <div className="flex items-center justify-center sm:justify-start space-x-3 text-xs text-gray-600">
                <span className="flex items-center space-x-1">
                  <CurrencyDollarIcon className="h-3 w-3 text-green-500" />
                  <span>
                    {paychecks.length} paycheck
                    {paychecks.length !== 1 ? "s" : ""}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <ExclamationTriangleIcon className="h-3 w-3 text-red-500" />
                  <span>
                    {debts.length} debt{debts.length !== 1 ? "s" : ""}
                  </span>
                </span>
              </div>
            </div>

            {/* Mobile: Essential Metrics Only (Income + Remaining) */}
            <div className="block sm:hidden">
              <div className="grid grid-cols-2 gap-2">
                {/* Income */}
                <div className="flex flex-col items-center space-y-1 p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="p-1 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700 text-center">
                    Total Income
                  </p>
                  <p className="text-base font-bold text-green-700">
                    ${totalIncome.toLocaleString()}
                  </p>
                </div>

                {/* Remaining */}
                <div className="flex flex-col items-center space-y-1 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="p-1 bg-emerald-100 rounded-lg">
                    <CurrencyDollarIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700 text-center">
                    Remaining
                  </p>
                  <p className="text-base font-bold text-emerald-700">
                    ${totalRemaining.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Expand Button for Mobile */}
              <button
                onClick={() => setShowMobileDetails(!showMobileDetails)}
                className="w-full mt-2 p-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center space-x-1"
              >
                <span>{showMobileDetails ? "Hide" : "Show"} Details</span>
                <ChevronDownIcon
                  className={`h-3 w-3 transition-transform ${showMobileDetails ? "rotate-180" : ""}`}
                />
              </button>

              {/* Mobile Details (Collapsible) */}
              {showMobileDetails && (
                <div className="mt-2 space-y-2">
                  {/* Debts */}
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-red-100 rounded-lg">
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          Total Debts
                        </p>
                        <p className="text-xs text-gray-500">Due this month</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-red-700">
                      ${totalDebts.toLocaleString()}
                    </p>
                  </div>

                  {/* Allocated */}
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-blue-100 rounded-lg">
                        <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          Allocated
                        </p>
                        <p className="text-xs text-gray-500">
                          {allocations?.reduce(
                            (sum, a) => sum + a.allocatedDebts.length,
                            0,
                          ) || 0}{" "}
                          payments
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-blue-700">
                      ${totalAllocated.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Full 4-Metric Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {/* Income */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <div className="p-1 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      Total Income
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      From all paychecks
                    </p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-base sm:text-lg font-bold text-green-700">
                    ${totalIncome.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Debts */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <div className="p-1 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      Total Income
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Due this month
                    </p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-base sm:text-lg font-bold text-red-700">
                    ${totalDebts.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Allocated */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      Allocated
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {allocations?.reduce(
                        (sum, a) => sum + a.allocatedDebts.length,
                        0,
                      ) || 0}{" "}
                      payments
                    </p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-base sm:text-lg font-bold text-blue-700">
                    ${totalAllocated.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Remaining */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <div className="p-1 bg-emerald-100 rounded-lg">
                    <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      Remaining
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      After allocations
                    </p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-base sm:text-lg font-bold text-emerald-700">
                    ${totalRemaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content - Column Layout */}
        <div className="space-y-4">
          {/* Debts Section - Above Paychecks */}
          <div className="space-y-2">
            <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Debts
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                {unallocatedDebts.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {unallocatedDebts.length} to allocate
                    </span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDebtsModalOpen(true)}
                  className="flex items-center justify-center space-x-1 px-3 py-2 sm:px-2 sm:py-1 text-sm sm:text-xs w-full sm:w-auto"
                >
                  <CurrencyDollarIcon className="h-4 w-4 sm:h-3 sm:w-3" />
                  <span>Manage Debts</span>
                </Button>
              </div>
            </div>

            {unallocatedDebts.length === 0 ? (
              <Card className="p-3">
                <div className="text-center py-1">
                  <CurrencyDollarIcon className="mx-auto h-4 w-4 text-gray-400 mb-1" />
                  <h3 className="text-xs font-medium text-gray-900 mb-1">
                    No Debts to Allocate
                  </h3>
                  <p className="text-xs text-gray-600">
                    All debts have been allocated to paychecks.
                  </p>
                </div>
              </Card>
            ) : isMobile || isTouchDevice ? (
              <MobileDebtSelector
                debts={unallocatedDebts}
                paychecks={paychecks}
                onDebtAssigned={handleMobileDebtAssign}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-2">
                {unallocatedDebts.map((debt) => (
                  <DraggableDebtItem
                    key={debt.id}
                    debt={debt}
                    onMobileSelect={handleMobileDebtSelect}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Warnings Panel - Above Paychecks */}
          {warnings.length > 0 && (
            <WarningsPanel
              warnings={warnings}
              budgetAccountId={selectedAccount.id}
              onWarningDismissed={async () => {
                try {
                  // Refresh the data when a warning is dismissed
                  await Promise.all([
                    mutatePlanningData?.(),
                    mutateAllocations?.(),
                  ]);
                  showToast("Warning dismissed", { type: "success" });
                } catch (error) {
                  console.error("Failed to dismiss warning:", error);
                  showToast("Failed to dismiss warning", { type: "error" });
                }
              }}
            />
          )}

          {/* Paychecks Section - Column Layout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Paychecks for {format(selectedDate, "MMMM yyyy")}
              </h2>
            </div>

            {paychecks.length === 0 ? (
              <Card>
                <div className="text-center py-4">
                  <CalendarDaysIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Paychecks Found
                  </h3>
                  <p className="text-gray-600 mb-3">
                    No paychecks are scheduled for{" "}
                    {format(selectedDate, "MMMM yyyy")}.
                  </p>
                  <Button variant="primary" href="/dashboard/income">
                    Add Income Source
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(() => {
                  // Group paychecks by date
                  const paychecksByDate = new Map<
                    string,
                    {
                      paychecks: typeof paychecks;
                      allocations: typeof allocations;
                    }
                  >();

                  allocations?.forEach((allocation) => {
                    const paycheck = paychecks.find(
                      (p) => p.id === allocation.paycheckId,
                    );
                    if (!paycheck) return;

                    const dateKey = format(paycheck.date, "yyyy-MM-dd");
                    if (!paychecksByDate.has(dateKey)) {
                      paychecksByDate.set(dateKey, {
                        paychecks: [],
                        allocations: [],
                      });
                    }
                    const dateGroup = paychecksByDate.get(dateKey);
                    if (dateGroup && dateGroup.allocations) {
                      dateGroup.paychecks.push(paycheck);
                      dateGroup.allocations.push(allocation);
                    }
                  });

                  return Array.from(paychecksByDate.entries())
                    .map(([dateKey, group]) => {
                      if (!group || group.paychecks.length === 0) return null;

                      if (group.paychecks.length === 1) {
                        // Single paycheck on this date, render normally
                        const paycheck = group.paychecks[0];
                        const allocation = group.allocations?.[0];

                        if (!allocation) return null;

                        return isMobile || isTouchDevice ? (
                          <EnhancedPaycheckCard
                            key={allocation.paycheckId}
                            paycheck={paycheck}
                            allocation={allocation}
                            unallocatedDebts={unallocatedDebts}
                            onDebtAllocated={handleDebtAllocated}
                            onDebtUnallocated={handleDebtUnallocated}
                            onDebtUpdated={handleDebtUpdated}
                            onDebtMoved={handleDebtMoved}
                            movingDebtId={movingDebtId}
                            onMarkPaymentAsPaid={handleMarkPaymentAsPaid}
                          />
                        ) : (
                          <DraggablePaycheckCard
                            key={allocation.paycheckId}
                            paycheck={paycheck}
                            allocation={allocation}
                            unallocatedDebts={unallocatedDebts}
                            onDebtAllocated={handleDebtAllocated}
                            onDebtUnallocated={handleDebtUnallocated}
                            onDebtUpdated={handleDebtUpdated}
                            onDebtMoved={handleDebtMoved}
                            movingDebtId={movingDebtId}
                            onMarkPaymentAsPaid={handleMarkPaymentAsPaid}
                          />
                        );
                      } else {
                        // Multiple paychecks on the same date, combine them
                        const totalAmount = group.paychecks.reduce(
                          (sum, p) => sum + p.amount,
                          0,
                        );
                        const combinedNames = group.paychecks
                          .map((p) => p.name)
                          .join(" + ");
                        const firstPaycheck = group.paychecks[0];

                        // Combine all allocated debts from all paychecks on this date
                        const combinedAllocatedDebts =
                          group.allocations?.flatMap((a) => a.allocatedDebts) ||
                          [];
                        const totalAllocated = combinedAllocatedDebts.reduce(
                          (sum, debt) => sum + debt.amount,
                          0,
                        );

                        const combinedAllocation = {
                          paycheckId: `combined-${dateKey}`,
                          paycheckDate: firstPaycheck.date, // Use Date object directly
                          paycheckAmount: totalAmount,
                          allocatedDebts: combinedAllocatedDebts,
                          remainingAmount: totalAmount - totalAllocated,
                        };

                        const combinedPaycheck = {
                          id: `combined-${dateKey}`,
                          name: combinedNames,
                          amount: totalAmount,
                          date: firstPaycheck.date, // Use Date object directly
                          frequency: firstPaycheck.frequency,
                          userId: firstPaycheck.userId,
                        };

                        return isMobile || isTouchDevice ? (
                          <EnhancedPaycheckCard
                            key={`combined-${dateKey}`}
                            paycheck={combinedPaycheck}
                            allocation={combinedAllocation}
                            unallocatedDebts={unallocatedDebts}
                            onDebtAllocated={(
                              debtId,
                              paycheckId,
                              paymentAmount,
                              paymentDate,
                            ) =>
                              handleCombinedDebtAllocated(
                                debtId,
                                dateKey,
                                paymentAmount,
                                paymentDate,
                              )
                            }
                            onDebtUnallocated={(debtId) =>
                              handleCombinedDebtUnallocated(debtId, dateKey)
                            }
                            onDebtUpdated={handleDebtUpdated}
                            onDebtMoved={handleDebtMoved}
                            movingDebtId={movingDebtId}
                            onMarkPaymentAsPaid={handleMarkPaymentAsPaid}
                          />
                        ) : (
                          <DraggablePaycheckCard
                            key={`combined-${dateKey}`}
                            paycheck={combinedPaycheck}
                            allocation={combinedAllocation}
                            unallocatedDebts={unallocatedDebts}
                            onDebtAllocated={(
                              debtId,
                              paycheckId,
                              paymentAmount,
                              paymentDate,
                            ) =>
                              handleCombinedDebtAllocated(
                                debtId,
                                dateKey,
                                paymentAmount,
                                paymentDate,
                              )
                            }
                            onDebtUnallocated={(debtId) =>
                              handleCombinedDebtUnallocated(debtId, dateKey)
                            }
                            onDebtUpdated={handleDebtUpdated}
                            onDebtMoved={handleDebtMoved}
                            movingDebtId={movingDebtId}
                            onMarkPaymentAsPaid={handleMarkPaymentAsPaid}
                          />
                        );
                      }
                    })
                    .filter(Boolean);
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Debts Modal */}
        <Modal
          isOpen={isDebtsModalOpen}
          onClose={() => setIsDebtsModalOpen(false)}
          title="Debt Management"
          footerButtons={
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDebtsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <DebtManagement
              budgetAccountId={selectedAccount.id}
              onDebtUpdate={async () => {
                try {
                  // Refresh the data without closing the modal
                  await Promise.all([
                    mutatePlanningData?.(),
                    mutateAllocations?.(),
                  ]);
                } catch (error) {
                  console.error("Failed to update debt:", error);
                  showToast("Failed to update debt", { type: "error" });
                }
              }}
            />
          </div>
        </Modal>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDebt ? <DraggableDebtItem debt={activeDebt} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
