import useSWR from "swr";
import {
  getPaycheckPlanningData,
  getPaycheckAllocations,
  getCurrentMonthPaycheckPlanning,
  getCurrentMonthPaycheckAllocations,
  getHiddenMonthlyDebtPlanningData,
  updateDebtAllocation,
} from "@/app/actions/paycheck-planning";

const PAYCHECK_PLANNING_KEY = "/api/paycheck-planning";
const PAYCHECK_ALLOCATIONS_KEY = "/api/paycheck-allocations";
const CURRENT_MONTH_PLANNING_KEY = "/api/current-month-planning";
const CURRENT_MONTH_ALLOCATIONS_KEY = "/api/current-month-allocations";

/**
 * Custom hook for managing paycheck planning data using SWR
 * Provides data fetching and caching for paycheck planning
 */
export function usePaycheckPlanning(
  budgetAccountId?: string,
  year?: number,
  month?: number,
  planningWindowMonths: number = 0, // Default to current month only, but configurable
) {
  const {
    data: planningData,
    error,
    isLoading,
    mutate: mutatePlanningData,
  } = useSWR(
    budgetAccountId && year && month
      ? [
          PAYCHECK_PLANNING_KEY,
          budgetAccountId,
          year,
          month,
          planningWindowMonths,
        ]
      : null,
    () =>
      getPaycheckPlanningData(
        budgetAccountId!,
        year!,
        month!,
        planningWindowMonths,
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    planningData,
    error,
    isLoading,
    mutatePlanningData,
  };
}

/**
 * Custom hook for managing paycheck allocations using SWR
 */
export function usePaycheckAllocations(
  budgetAccountId?: string,
  year?: number,
  month?: number,
) {
  const {
    data: allocations,
    error,
    isLoading,
    mutate: mutateAllocations,
  } = useSWR(
    budgetAccountId && year && month
      ? [PAYCHECK_ALLOCATIONS_KEY, budgetAccountId, year, month]
      : null,
    () => getPaycheckAllocations(budgetAccountId!, year!, month!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    allocations,
    error,
    isLoading,
    mutateAllocations,
  };
}

/**
 * Custom hook for managing current month paycheck planning data
 */
export function useCurrentMonthPaycheckPlanning(budgetAccountId?: string) {
  const {
    data: planningData,
    error,
    isLoading,
    mutate: mutatePlanningData,
  } = useSWR(
    budgetAccountId ? [CURRENT_MONTH_PLANNING_KEY, budgetAccountId] : null,
    () => getCurrentMonthPaycheckPlanning(budgetAccountId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    planningData,
    error,
    isLoading,
    mutatePlanningData,
  };
}

/**
 * Custom hook for managing current month paycheck allocations
 */
export function useCurrentMonthPaycheckAllocations(budgetAccountId?: string) {
  const {
    data: allocations,
    error,
    isLoading,
    mutate: mutateAllocations,
  } = useSWR(
    budgetAccountId ? [CURRENT_MONTH_ALLOCATIONS_KEY, budgetAccountId] : null,
    () => getCurrentMonthPaycheckAllocations(budgetAccountId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    allocations,
    error,
    isLoading,
    mutateAllocations,
  };
}

/**
 * Custom hook for fetching hidden (inactive) monthly debt planning records
 */
export function useHiddenMonthlyDebts(
  budgetAccountId?: string,
  year?: number,
  month?: number,
  planningWindowMonths: number = 0,
) {
  const {
    data: hiddenDebts,
    error,
    isLoading,
    mutate: mutateHiddenDebts,
  } = useSWR(
    budgetAccountId && year && month
      ? [
          "hidden-monthly-debts",
          budgetAccountId,
          year,
          month,
          planningWindowMonths,
        ]
      : null,
    () =>
      getHiddenMonthlyDebtPlanningData(
        budgetAccountId!,
        year!,
        month!,
        planningWindowMonths,
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    hiddenDebts,
    error,
    isLoading,
    mutateHiddenDebts,
  };
}

/**
 * Custom hook for managing debt allocations with drag-and-drop functionality
 */
export function useDebtAllocationManager(
  budgetAccountId: string | undefined,
  year: number,
  month: number,
  planningWindowMonths: number = 0, // Default to current month only, but configurable
) {
  const {
    planningData,
    mutatePlanningData,
    isLoading: isPlanningDataLoading,
  } = usePaycheckPlanning(budgetAccountId, year, month, planningWindowMonths);
  const {
    allocations,
    mutateAllocations,
    isLoading: isAllocationsLoading,
  } = usePaycheckAllocations(budgetAccountId, year, month);

  const handleDebtAllocated = async (
    monthlyDebtPlanningId: string, // Changed from debtId to monthlyDebtPlanningId
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => {
    if (!budgetAccountId) return;

    try {
      await updateDebtAllocation(
        budgetAccountId,
        monthlyDebtPlanningId,
        paycheckId,
        "allocate",
        paymentAmount,
        paymentDate,
      );
      // Refresh the data
      await Promise.all([mutatePlanningData(), mutateAllocations()]);
    } catch (error) {
      console.error("Failed to allocate debt:", error);
      throw error; // Re-throw so calling code can handle it
    }
  };

  const handleDebtUnallocated = async (
    monthlyDebtPlanningId: string,
    paycheckId: string,
  ) => {
    if (!budgetAccountId) return;

    try {
      await updateDebtAllocation(
        budgetAccountId,
        monthlyDebtPlanningId,
        paycheckId,
        "unallocate",
      );
      // Refresh the data
      await Promise.all([mutatePlanningData(), mutateAllocations()]);
    } catch (error) {
      console.error("Failed to unallocate debt:", error);
      throw error; // Re-throw so calling code can handle it
    }
  };

  return {
    planningData,
    allocations,
    handleDebtAllocated,
    handleDebtUnallocated,
    mutatePlanningData,
    mutateAllocations,
    isLoading: isPlanningDataLoading || isAllocationsLoading,
  };
}
