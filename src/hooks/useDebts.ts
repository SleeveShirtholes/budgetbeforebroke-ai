import useSWR from "swr";
import {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
  createDebtPayment,
} from "@/app/actions/debt";
import type {
  CreateDebtInput,
  UpdateDebtInput,
  CreateDebtPaymentInput,
} from "@/types/debt";

const DEBTS_KEY = "/api/debts";

/**
 * Custom hook for managing debt data using SWR
 * Provides data fetching, caching, and mutation functions for debts
 */
export function useDebts(budgetAccountId?: string) {
  const {
    data: debts,
    error,
    isLoading,
    mutate: mutateDebts,
  } = useSWR(
    budgetAccountId ? [DEBTS_KEY, budgetAccountId] : null,
    () => getDebts(budgetAccountId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  /**
   * Creates a new debt and updates the cache
   */
  const addDebt = async (debtData: CreateDebtInput) => {
    try {
      await createDebt(debtData, budgetAccountId);
      // Revalidate the debts data
      await mutateDebts();
      return { success: true };
    } catch (error) {
      console.error("Error creating debt:", error);
      return { success: false, error };
    }
  };

  /**
   * Updates an existing debt and updates the cache
   */
  const updateDebtById = async (debtData: UpdateDebtInput) => {
    try {
      await updateDebt(debtData, budgetAccountId);
      // Revalidate the debts data
      await mutateDebts();
      return { success: true };
    } catch (error) {
      console.error("Error updating debt:", error);
      return { success: false, error };
    }
  };

  /**
   * Deletes a debt and updates the cache
   */
  const removeDebt = async (id: string) => {
    try {
      await deleteDebt(id, budgetAccountId);
      // Revalidate the debts data
      await mutateDebts();
      return { success: true };
    } catch (error) {
      console.error("Error deleting debt:", error);
      return { success: false, error };
    }
  };

  /**
   * Creates a payment for a debt and updates the cache
   */
  const addPayment = async (paymentData: CreateDebtPaymentInput) => {
    try {
      await createDebtPayment(paymentData);
      // Revalidate the debts data
      await mutateDebts();
      return { success: true };
    } catch (error) {
      console.error("Error creating payment:", error);
      return { success: false, error };
    }
  };

  return {
    debts: debts || [],
    error,
    isLoading,
    addDebt,
    updateDebtById,
    removeDebt,
    addPayment,
    mutateDebts,
  };
}
