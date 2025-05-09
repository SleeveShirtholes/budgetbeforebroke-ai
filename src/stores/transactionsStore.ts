import { Transaction, TransactionCategory } from "@/types/transaction";

import { mockTransactions } from "@/data/mockTransactions";
import { create } from "zustand";

interface TransactionState {
  transactions: Transaction[];
  isModalOpen: boolean;
  isLoading: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  createTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateCategory: (
    transactionId: string,
    newCategory: TransactionCategory,
  ) => void;
  initializeTransactions: () => void;
}

const useTransactionsStore = create<TransactionState>((set) => ({
  transactions: [],
  isModalOpen: false,
  isLoading: true,

  setTransactions: (transactions) => set({ transactions }),
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setIsLoading: (isLoading) => set({ isLoading }),

  createTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newTransaction: Transaction = {
      id: `tr-${Date.now()}`,
      date: transaction.date as string,
      description: transaction.description as string,
      merchant: transaction.merchant as string,
      merchantLocation: transaction.merchantLocation as string,
      amount: transaction.amount as number,
      type: transaction.type as "expense" | "income",
      category: transaction.category as TransactionCategory,
      notes: transaction.notes as string | undefined,
      account: transaction.account as string | undefined,
      tags: transaction.tags as string[] | undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
      isModalOpen: false,
    }));
  },

  updateCategory: (transactionId, newCategory) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === transactionId
          ? { ...t, category: newCategory, updatedAt: new Date().toISOString() }
          : t,
      ),
    }));
  },

  initializeTransactions: () => {
    set({
      transactions: mockTransactions,
      isLoading: false,
    });
  },
}));

export default useTransactionsStore;
