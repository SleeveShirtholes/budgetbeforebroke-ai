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
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import AssignmentBasedInterface from "./components/AssignmentBasedInterface";
import DebtManagement from "./components/DebtManagement";
import WarningsPanel from "./components/WarningsPanel";
import { useToast } from "@/components/Toast";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import {
  useDebtAllocationManager,
  useHiddenMonthlyDebts,
} from "@/hooks/usePaycheckPlanning";
import {
  markPaymentAsPaid,
  populateMonthlyDebtPlanning,
  getDebtAllocations,
  setMonthlyDebtPlanningActive,
} from "@/app/actions/paycheck-planning";
import { formatDateSafely } from "@/utils/date";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";

import "@/styles/sortable.css";
import { debtAllocations } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

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
  const [planningWindowMonths, setPlanningWindowMonths] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allDebtAllocations, setAllDebtAllocations] = useState<
    InferSelectModel<typeof debtAllocations>[]
  >([]);
  const [isAllocatingDebt, setIsAllocatingDebt] = useState(false);
  const [isUnallocatingDebt, setIsUnallocatingDebt] = useState(false);
  const [isMarkingPaymentAsPaid, setIsMarkingPaymentAsPaid] = useState(false);
  const [isSkippingDebt, setIsSkippingDebt] = useState(false);
  const [isRestoringDebt, setIsRestoringDebt] = useState(false);
  const [isChangingPlanningWindow, setIsChangingPlanningWindow] =
    useState(false);
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  const [isDismissingWarning, setIsDismissingWarning] = useState(false);
  const [isUpdatingDebts, setIsUpdatingDebts] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // User configurable planning window
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
    isLoading: isPlanningDataLoading,
  } = useDebtAllocationManager(
    selectedAccount?.id,
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1, // getMonth() returns 0-11, we need 1-12
    planningWindowMonths, // Pass the user's planning window preference
  );

  // Use the hidden monthly debts hook
  const {
    hiddenDebts: hiddenDebtsData,
    mutateHiddenDebts,
    isLoading: isHiddenDebtsLoading,
  } = useHiddenMonthlyDebts(
    selectedAccount?.id,
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    planningWindowMonths,
  );

  // Transform hidden debts data to match MonthlyDebtRecord type
  const hiddenDebts = useMemo(() => {
    if (!hiddenDebtsData) return [];

    return hiddenDebtsData.map((debt: (typeof hiddenDebtsData)[0]) => ({
      id: debt.id,
      debtId: debt.id,
      debtName: debt.name,
      amount: debt.amount,
      dueDate: debt.dueDate,
      frequency: debt.frequency,
      description: debt.description,
      isRecurring: debt.isRecurring,
      categoryId: debt.categoryId,
      year: new Date(debt.dueDate).getFullYear(),
      month: new Date(debt.dueDate).getMonth() + 1,
      isActive: false,
    }));
  }, [hiddenDebtsData]);

  // Populate monthly debt planning rows for the visible window,
  // then revalidate to ensure newly inserted rows are reflected immediately
  // Note: This will only populate if there are existing debts in the system
  useEffect(() => {
    let isCancelled = false;
    const run = async () => {
      if (!selectedAccount?.id) return;

      const currentYear = selectedDate.getFullYear();
      const currentMonth = selectedDate.getMonth() + 1;

      try {
        await populateMonthlyDebtPlanning(
          selectedAccount.id,
          currentYear,
          currentMonth,
          planningWindowMonths,
        );
        if (!isCancelled) {
          await Promise.all([mutatePlanningData?.(), mutateAllocations?.()]);
        }
      } catch (error) {
        console.error("Failed to populate monthly debt planning:", error);
      }
    };
    run();
    return () => {
      isCancelled = true;
    };
  }, [
    selectedAccount?.id,
    selectedDate,
    planningWindowMonths,
    mutatePlanningData,
    mutateAllocations,
  ]);

  // Fetch all debt allocations for the budget account
  const [isFetchingAllocations, setIsFetchingAllocations] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const fetchAllocations = async () => {
      if (!selectedAccount?.id) return;
      try {
        setIsFetchingAllocations(true);
        const allocations = await getDebtAllocations(selectedAccount.id);

        if (!isCancelled) {
          setAllDebtAllocations(allocations);
        }
      } catch (error) {
        console.error("Failed to fetch all debt allocations:", error);
      } finally {
        if (!isCancelled) {
          setIsFetchingAllocations(false);
        }
      }
    };
    fetchAllocations();
    return () => {
      isCancelled = true;
    };
  }, [selectedAccount?.id]);

  // Wrap the handlers with toast notifications
  const handleDebtAllocated = async (
    debtId: string,
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => {
    try {
      setIsAllocatingDebt(true);
      await originalHandleDebtAllocated(
        debtId,
        paycheckId,
        paymentAmount,
        paymentDate,
      );

      // Refresh the allDebtAllocations to update the unallocated debts list
      if (selectedAccount?.id) {
        try {
          const updatedAllocations = await getDebtAllocations(
            selectedAccount.id,
          );
          setAllDebtAllocations(updatedAllocations);
        } catch (error) {
          console.error("Failed to refresh debt allocations:", error);
        }
      }

      const message =
        paymentAmount && paymentDate
          ? `Payment of $${paymentAmount.toLocaleString()} scheduled for ${formatDateSafely(paymentDate, "MMM dd, yyyy")}`
          : "Debt allocated successfully";
      showToast(message, { type: "success" });
    } catch (error) {
      console.error("Failed to allocate debt:", error);
      showToast("Failed to allocate debt", { type: "error" });
    } finally {
      setIsAllocatingDebt(false);
    }
  };

  const handleDebtUnallocated = async (debtId: string, paycheckId: string) => {
    try {
      setIsUnallocatingDebt(true);
      await originalHandleDebtUnallocated(debtId, paycheckId);

      // Refresh the allDebtAllocations to update the unallocated debts list
      if (selectedAccount?.id) {
        try {
          const updatedAllocations = await getDebtAllocations(
            selectedAccount.id,
          );
          setAllDebtAllocations(updatedAllocations);
        } catch (error) {
          console.error("Failed to refresh debt allocations:", error);
        }
      }

      showToast("Debt removed successfully", { type: "success" });
    } catch (error) {
      console.error("Failed to remove debt:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove debt";
      showToast(errorMessage, { type: "error" });
    } finally {
      setIsUnallocatingDebt(false);
    }
  };

  /**
   * Handle skipping a monthly debt planning record
   */
  const handleDebtHidden = async (monthlyDebtPlanningId: string) => {
    if (!selectedAccount?.id) {
      showToast("No budget account selected", { type: "error" });
      return;
    }

    try {
      setIsSkippingDebt(true);
      await setMonthlyDebtPlanningActive(
        selectedAccount.id,
        monthlyDebtPlanningId,
        false, // Set to inactive (skipped)
      );

      // Refresh the data to show updated planning and hidden debts
      await Promise.all([
        mutatePlanningData?.(),
        mutateAllocations?.(),
        mutateHiddenDebts?.(),
      ]);

      showToast("Debt skipped for this month", { type: "success" });
    } catch (error) {
      console.error("Error skipping debt:", error);
      showToast("Failed to skip debt", { type: "error" });
    } finally {
      setIsSkippingDebt(false);
    }
  };

  /**
   * Handle restoring a skipped monthly debt planning record
   */
  const handleDebtRestored = async (monthlyDebtPlanningId: string) => {
    if (!selectedAccount?.id) {
      showToast("No budget account selected", { type: "error" });
      return;
    }

    try {
      setIsRestoringDebt(true);
      await setMonthlyDebtPlanningActive(
        selectedAccount.id,
        monthlyDebtPlanningId,
        true, // Set to active (restored)
      );

      // Refresh the data to show updated planning and hidden debts
      await Promise.all([
        mutatePlanningData?.(),
        mutateAllocations?.(),
        mutateHiddenDebts?.(),
      ]);

      showToast("Debt restored to planning", { type: "success" });
    } catch (error) {
      console.error("Error restoring debt:", error);
      showToast("Failed to restore debt", { type: "error" });
    } finally {
      setIsRestoringDebt(false);
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
      setIsMarkingPaymentAsPaid(true);
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
    } finally {
      setIsMarkingPaymentAsPaid(false);
    }
  };

  // Calculate unallocated monthly debt planning records
  const unallocatedMonthlyDebts = useMemo(() => {
    if (!planningData?.debts) {
      return [];
    }

    // If there are no allocations, all debts are unallocated
    if (!allDebtAllocations.length) {
      return planningData.debts.map((debt) => ({
        id: debt.id, // monthlyDebtPlanningId
        debtId: debt.id,
        debtName: debt.name,
        amount: debt.amount,
        dueDate: debt.dueDate,
        frequency: debt.frequency,
        description: debt.description,
        isRecurring: debt.isRecurring,
        categoryId: debt.categoryId,
        year: new Date(debt.dueDate).getFullYear(),
        month: new Date(debt.dueDate).getMonth() + 1,
        isActive: true,
      }));
    }

    // Get ALL allocations for this budget account to properly filter out allocated debts
    // We need to check against all allocations, not just current month's paychecks
    const allAllocatedMonthlyIds = new Set<string>();

    // Add all allocations from the budget account
    allDebtAllocations.forEach((allocation) => {
      allAllocatedMonthlyIds.add(allocation.monthlyDebtPlanningId);
    });

    // Map planning debts (each is a monthly_debt_planning record) and exclude allocated ones
    const unallocated = planningData.debts
      .filter((debt) => {
        const isAllocated = allAllocatedMonthlyIds.has(debt.id);
        return !isAllocated;
      })
      .map((debt) => ({
        id: debt.id, // monthlyDebtPlanningId
        debtId: debt.id,
        debtName: debt.name,
        amount: debt.amount,
        dueDate: debt.dueDate,
        frequency: debt.frequency,
        description: debt.description,
        isRecurring: debt.isRecurring,
        categoryId: debt.categoryId,
        year: new Date(debt.dueDate).getFullYear(),
        month: new Date(debt.dueDate).getMonth() + 1,
        isActive: true,
      }));

    return unallocated;
  }, [planningData?.debts, allDebtAllocations]);

  // Navigation handlers
  const goToPreviousMonth = async () => {
    setIsChangingMonth(true);
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });

    // Wait for data to refresh
    try {
      await Promise.all([
        mutatePlanningData?.(),
        mutateAllocations?.(),
        mutateHiddenDebts?.(),
      ]);
    } catch (error) {
      console.error("Failed to refresh data after month change:", error);
    } finally {
      setIsChangingMonth(false);
    }
  };

  const goToNextMonth = async () => {
    setIsChangingMonth(true);
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });

    // Wait for data to refresh
    try {
      await Promise.all([
        mutatePlanningData?.(),
        mutateAllocations?.(),
        mutateHiddenDebts?.(),
      ]);
    } catch (error) {
      console.error("Failed to refresh data after month change:", error);
    } finally {
      setIsChangingMonth(false);
    }
  };

  const goToCurrentMonth = async () => {
    setIsChangingMonth(true);
    setSelectedDate(new Date());

    // Wait for data to refresh
    try {
      await Promise.all([
        mutatePlanningData?.(),
        mutateAllocations?.(),
        mutateHiddenDebts?.(),
      ]);
    } catch (error) {
      console.error("Failed to refresh data after month change:", error);
    } finally {
      setIsChangingMonth(false);
    }
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
  }, [unallocatedMonthlyDebts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

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

  // Check if any data is still loading
  const isDataLoading =
    isPlanningDataLoading || isHiddenDebtsLoading || isFetchingAllocations;

  // Show loading spinner if data is loading
  if (isDataLoading) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="block md:hidden">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Paycheck Planning
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              {format(selectedDate, "MMMM yyyy")}
            </p>
          </div>
          <div className="hidden md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Paycheck Planning
              </h1>
              <p className="text-gray-600 text-sm">
                {format(selectedDate, "MMMM yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">
              Loading paycheck planning data...
            </p>
          </div>
        </div>
      </div>
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
              disabled={isChangingMonth}
              className="p-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>

            {!isCurrentMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentMonth}
                disabled={isChangingMonth}
                className="text-xs px-3 py-2"
              >
                Now
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              disabled={isChangingMonth}
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
            disabled={isChangingMonth}
            className="p-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>

          {!isCurrentMonth && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentMonth}
              disabled={isChangingMonth}
              className="text-xs px-3 py-2"
            >
              Now
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            disabled={isChangingMonth}
            className="p-2"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading Overlay for Operations */}
      {(isAllocatingDebt ||
        isUnallocatingDebt ||
        isMarkingPaymentAsPaid ||
        isSkippingDebt ||
        isRestoringDebt ||
        isChangingPlanningWindow ||
        isChangingMonth ||
        isDismissingWarning ||
        isUpdatingDebts) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <p className="text-gray-700 font-medium">
              {isAllocatingDebt && "Allocating debt..."}
              {isUnallocatingDebt && "Removing debt allocation..."}
              {isMarkingPaymentAsPaid && "Marking payment as paid..."}
              {isSkippingDebt && "Skipping debt..."}
              {isRestoringDebt && "Restoring debt..."}
              {isChangingPlanningWindow && "Updating planning window..."}
              {isChangingMonth && "Loading month data..."}
              {isDismissingWarning && "Dismissing warning..."}
              {isUpdatingDebts && "Updating debts..."}
            </p>
          </div>
        </div>
      )}

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

      {/* Button Group - Warnings, Planning Window, and Manage Debts */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-center lg:sm:justify-end">
        {/* Warnings Button - First in group */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsWarningsExpanded(!isWarningsExpanded)}
          className="w-full sm:w-auto text-amber-700 border-amber-300 hover:bg-amber-50 hover:border-amber-400 sm:rounded-r-none sm:border-r-0 hover:z-10"
        >
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>
            {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
          </span>
        </Button>

        {/* Planning Window Dropdown - Middle in group */}
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 sm:rounded-none sm:border-r-0 hover:z-10"
          >
            <CalendarDaysIcon className="h-4 w-4" />
            <span>
              {planningWindowMonths === 0
                ? "Current Month"
                : `${planningWindowMonths} Month${planningWindowMonths !== 1 ? "s" : ""} Ahead`}
            </span>
            <ChevronDownIcon className="h-3 w-3" />
          </Button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                {[0, 1, 2, 3, 6].map((months) => (
                  <button
                    key={months}
                    onClick={async () => {
                      setIsChangingPlanningWindow(true);
                      setPlanningWindowMonths(months);
                      setIsDropdownOpen(false);

                      // Wait for data to refresh
                      try {
                        await Promise.all([
                          mutatePlanningData?.(),
                          mutateAllocations?.(),
                          mutateHiddenDebts?.(),
                        ]);
                      } catch (error) {
                        console.error(
                          "Failed to refresh data after planning window change:",
                          error,
                        );
                      } finally {
                        setIsChangingPlanningWindow(false);
                      }
                    }}
                    disabled={isChangingPlanningWindow}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      planningWindowMonths === months
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-700 hover:bg-gray-50"
                    } ${isChangingPlanningWindow ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {months === 0
                      ? "Current Month Only"
                      : `${months} Month${months !== 1 ? "s" : ""} Ahead`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Manage Debts Button - Last in group (right side) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDebtsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 sm:rounded-l-none hover:z-10"
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
                  setIsDismissingWarning(true);
                  await Promise.all([
                    mutatePlanningData?.(),
                    mutateAllocations?.(),
                  ]);
                  showToast("Warning dismissed", { type: "success" });
                } catch (error) {
                  console.error("Failed to dismiss warning", error);
                  showToast("Failed to dismiss warning", { type: "error" });
                } finally {
                  setIsDismissingWarning(false);
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
        unallocatedDebts={unallocatedMonthlyDebts}
        hiddenDebts={hiddenDebts || []}
        currentYear={selectedDate.getFullYear()}
        currentMonth={selectedDate.getMonth() + 1}
        planningWindowMonths={planningWindowMonths}
        onDebtAllocated={handleDebtAllocated}
        onDebtUnallocated={handleDebtUnallocated}
        onDebtHidden={handleDebtHidden}
        onDebtRestored={handleDebtRestored}
        onMarkPaymentAsPaid={handleMarkPaymentAsPaid}
      />

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
                setIsUpdatingDebts(true);
                // Refresh the data without closing the modal
                await Promise.all([
                  mutatePlanningData?.(),
                  mutateAllocations?.(),
                ]);
              } catch (error) {
                console.error("Failed to update debt:", error);
                showToast("Failed to update debt", { type: "error" });
              } finally {
                setIsUpdatingDebts(false);
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
