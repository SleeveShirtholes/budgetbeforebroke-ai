"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format } from "date-fns";
import Sortable from "sortablejs";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import AssignmentBasedInterface from "./components/AssignmentBasedInterface";
import DebtManagement from "./components/DebtManagement";
import WarningsPanel from "./components/WarningsPanel";
import { useToast } from "@/components/Toast";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import { useDebtAllocationManager } from "@/hooks/usePaycheckPlanning";
import { markPaymentAsPaid } from "@/app/actions/paycheck-planning";
import { formatDateSafely } from "@/utils/date";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";
import "@/styles/sortable.css";

/**
 * Enhanced PaycheckPlanningPage Component
 *
 * A comprehensive page for planning paycheck allocation and debt payments with assignment-based interface.
 * Features:
 * - Current month view of all paychecks with dates and amounts
 * - Simple assignment controls for debt allocation to specific paychecks
 * - Real-time remaining balance calculations after debt payments
 * - User-friendly warnings for payment issues
 * - Easy debt payment reallocation
 */
export default function PaycheckPlanningPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDebtsModalOpen, setIsDebtsModalOpen] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [isWarningsExpanded, setIsWarningsExpanded] = useState(false);
  const { showToast } = useToast();
  const unallocatedDebtsRef = useRef<HTMLDivElement>(null);

  // Get the selected budget account
  const { selectedAccount, isLoading: isAccountsLoading } = useBudgetAccount();

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

  const handleDebtUnallocated = async (debtId: string, paycheckId: string) => {
    try {
      console.log("Attempting to unallocate debt:", { debtId, paycheckId });
      await originalHandleDebtUnallocated(debtId, paycheckId);
      showToast("Debt removed successfully", { type: "success" });
    } catch (error) {
      console.error("Failed to remove debt:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove debt";
      showToast(errorMessage, { type: "error" });
    }
  };

  /**
   * Handle marking a debt payment as paid
   * This will mark the payment as paid and schedule the next payment for recurring debts
   */
  const handleMarkPaymentAsPaid = async (
    debtId: string,
    paymentId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => {
    if (!selectedAccount?.id) {
      showToast("No budget account selected", { type: "error" });
      return;
    }

    try {
      await markPaymentAsPaid(
        selectedAccount.id,
        debtId,
        paymentId,
        paymentAmount,
        paymentDate,
      );

      // Refresh the data to show updated payment status
      await Promise.all([mutatePlanningData?.(), mutateAllocations?.()]);

      showToast("Payment marked as paid successfully", { type: "success" });
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      showToast("Failed to mark payment as paid", { type: "error" });
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

  // Set up SortableJS for unallocated debts
  useEffect(() => {
    if (!unallocatedDebtsRef.current) return;

    const sortable = Sortable.create(unallocatedDebtsRef.current, {
      group: {
        name: "debts",
        pull: "clone", // Allow items to be pulled from this list
        put: false, // Don't allow items to be put back into this list
      },
      sort: false, // Disable sorting within the unallocated debts list
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
    });

    return () => {
      sortable.destroy();
    };
  }, [unallocatedDebts]);

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
            <div className="grid grid-cols-2 gap-3">
              {/* Income */}
              <div className="flex flex-col items-center space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 text-center">
                  Total Income
                </p>
                <p className="text-lg font-bold text-green-700">
                  ${totalIncome.toLocaleString()}
                </p>
              </div>

              {/* Remaining */}
              <div className="flex flex-col items-center space-y-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 text-center">
                  Remaining
                </p>
                <p className="text-lg font-bold text-emerald-700">
                  ${totalRemaining.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Expand Button for Mobile */}
            <button
              onClick={() => setShowMobileDetails(!showMobileDetails)}
              className="w-full mt-3 p-3 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <span>{showMobileDetails ? "Hide" : "Show"} Details</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${showMobileDetails ? "rotate-180" : ""}`}
              />
            </button>

            {/* Mobile Details (Collapsible) */}
            {showMobileDetails && (
              <div className="mt-3 space-y-3">
                {/* Debts */}
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Total Debts
                      </p>
                      <p className="text-sm text-gray-500">Due this month</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-red-700">
                    ${totalDebts.toLocaleString()}
                  </p>
                </div>

                {/* Allocated */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Allocated
                      </p>
                      <p className="text-sm text-gray-500">
                        {allocations?.reduce(
                          (sum, a) => sum + a.allocatedDebts.length,
                          0,
                        ) || 0}{" "}
                        payments
                      </p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-blue-700">
                    ${totalAllocated.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: Full 4-Metric Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Income */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-gray-700">
                    Total Income
                  </p>
                  <p className="text-sm text-gray-500 hidden sm:block">
                    From all paychecks
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-lg font-bold text-green-700">
                  ${totalIncome.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Debts */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <div className="p-1.5 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-gray-700">
                    Total Debts
                  </p>
                  <p className="text-sm text-gray-500 hidden sm:block">
                    Due this month
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-lg font-bold text-red-700">
                  ${totalDebts.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Allocated */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-gray-700">Allocated</p>
                  <p className="text-sm text-gray-500 hidden sm:block">
                    {allocations?.reduce(
                      (sum, a) => sum + a.allocatedDebts.length,
                      0,
                    ) || 0}{" "}
                    payments
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-lg font-bold text-blue-700">
                  ${totalAllocated.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Remaining */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-gray-700">Remaining</p>
                  <p className="text-sm text-gray-500 hidden sm:block">
                    After allocations
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-lg font-bold text-emerald-700">
                  ${totalRemaining.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content - Column Layout */}
      <div className="space-y-4">
        {/* Button Group - Manage Debts and Warnings */}
        <div className="flex justify-center lg:justify-end">
          {/* Warnings Button - First in group */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWarningsExpanded(!isWarningsExpanded)}
            className="text-amber-700 border-amber-300 hover:bg-amber-50 hover:border-amber-400 rounded-r-none border-r-0 hover:z-10"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>
              {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
            </span>
          </Button>

          {/* Manage Debts Button - Second in group (right side) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDebtsModalOpen(true)}
            className="flex items-center space-x-2 rounded-l-none hover:z-10"
          >
            <CurrencyDollarIcon className="h-4 w-4" />
            <span>Manage Debts</span>
          </Button>
        </div>

        {/* Warnings Section */}
        {warnings.length > 0 && (
          <div className="space-y-3">
            {isWarningsExpanded && (
              <WarningsPanel
                warnings={warnings}
                budgetAccountId={selectedAccount.id}
                onWarningDismissed={async () => {
                  try {
                    await Promise.all([
                      mutatePlanningData?.(),
                      mutateAllocations?.(),
                    ]);
                    showToast("Warning dismissed", { type: "success" });
                  } catch (error) {
                    console.error("Failed to dismiss warning", error);
                    showToast("Failed to dismiss warning", { type: "error" });
                  }
                }}
              />
            )}
          </div>
        )}

        {/* Assignment-Based Interface */}
        <AssignmentBasedInterface
          paychecks={paychecks}
          allocations={allocations || []}
          unallocatedDebts={unallocatedDebts}
          onDebtAllocated={handleDebtAllocated}
          onDebtUnallocated={handleDebtUnallocated}
          onMarkPaymentAsPaid={handleMarkPaymentAsPaid}
        />
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
    </div>
  );
}
