import useSWR from "swr";
import {
  getPaycheckPlanningData,
  getPaycheckAllocations,
} from "@/app/actions/paycheck-planning";

const PAYCHECK_PLANNING_KEY = "/api/paycheck-planning";
const PAYCHECK_ALLOCATIONS_KEY = "/api/paycheck-allocations";

/**
 * Custom hook for managing paycheck planning data using SWR
 * Provides data fetching and caching for paycheck planning
 */
export function usePaycheckPlanning(
  budgetAccountId?: string,
  year?: number,
  month?: number
) {
  const {
    data: planningData,
    error,
    isLoading,
    mutate: mutatePlanningData,
  } = useSWR(
    budgetAccountId && year && month 
      ? [PAYCHECK_PLANNING_KEY, budgetAccountId, year, month] 
      : null,
    () => getPaycheckPlanningData(budgetAccountId!, year!, month!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
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
  month?: number
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
    }
  );

  return {
    allocations,
    error,
    isLoading,
    mutateAllocations,
  };
}