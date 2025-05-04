import { act, renderHook } from "@testing-library/react";

import { mockTransactions } from "@/data/mockTransactions";
import useTransactionsStore from "../transactionsStore";

describe("transactionsStore", () => {
    beforeEach(() => {
        const { result } = renderHook(() => useTransactionsStore());
        act(() => {
            result.current.setTransactions([]);
            result.current.setIsModalOpen(false);
        });
    });

    it("should initialize with default values", () => {
        const { result } = renderHook(() => useTransactionsStore());
        expect(result.current.transactions).toEqual([]);
        expect(result.current.isModalOpen).toBe(false);
        expect(result.current.isLoading).toBe(true);
    });

    it("should initialize transactions with mock data", () => {
        const { result } = renderHook(() => useTransactionsStore());
        act(() => {
            result.current.initializeTransactions();
        });
        expect(result.current.transactions).toEqual(mockTransactions);
        expect(result.current.isLoading).toBe(false);
    });

    it("should create a new transaction", () => {
        const { result } = renderHook(() => useTransactionsStore());
        const newTransaction = {
            date: "2024-05-01",
            description: "Test transaction",
            merchant: "Test Merchant",
            merchantLocation: "Test Location",
            amount: 100,
            type: "expense" as const,
            category: "Personal" as const,
            notes: "Test notes",
            account: "Test Account",
            tags: ["test"],
        };

        act(() => {
            result.current.createTransaction(newTransaction);
        });

        expect(result.current.transactions).toHaveLength(1);
        expect(result.current.transactions[0]).toMatchObject({
            ...newTransaction,
            id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });
        expect(result.current.isModalOpen).toBe(false);
    });

    it("should update a transaction category", () => {
        const { result } = renderHook(() => useTransactionsStore());
        act(() => {
            result.current.initializeTransactions();
        });

        const transactionId = result.current.transactions[0].id;

        act(() => {
            result.current.updateCategory(transactionId, "Food");
        });

        expect(result.current.transactions[0].category).toBe("Food");
        expect(result.current.transactions[0].updatedAt).not.toBe(result.current.transactions[0].createdAt);
    });

    it("should toggle modal state", () => {
        const { result } = renderHook(() => useTransactionsStore());
        act(() => {
            result.current.setIsModalOpen(true);
        });
        expect(result.current.isModalOpen).toBe(true);

        act(() => {
            result.current.setIsModalOpen(false);
        });
        expect(result.current.isModalOpen).toBe(false);
    });
});
