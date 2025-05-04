import { act, renderHook } from "@testing-library/react";

import { BudgetCategoryName } from "@/app/dashboard/budgets/types/budget.types";
import useBudgetsStore from "../budgetsStore";

type BudgetStore = ReturnType<typeof useBudgetsStore>;

describe("budgetsStore", () => {
    let result: { current: BudgetStore };

    beforeEach(() => {
        const hookResult = renderHook(() => useBudgetsStore());
        result = hookResult.result;
        act(() => {
            result.current.setBudgetCategories([]);
            result.current.setIsAddingCategory(false);
            result.current.setNewCategory({ name: "", amount: "" });
            result.current.setFormErrors({});
            result.current.setSearchQuery("");
            result.current.setEditCategoryId(null);
            result.current.setDeleteConfirmId(null);
        });
    });

    it("should initialize with default values", () => {
        expect(result.current.selectedMonth).toBeDefined();
        expect(result.current.displayMonth).toBeDefined();
        expect(result.current.budgetCategories).toEqual([]);
        expect(result.current.isAddingCategory).toBe(false);
        expect(result.current.newCategory).toEqual({ name: "", amount: "" });
        expect(result.current.formErrors).toEqual({});
        expect(result.current.searchQuery).toBe("");
        expect(result.current.editCategoryId).toBeNull();
        expect(result.current.deleteConfirmId).toBeNull();
    });

    it("should update selected month and display month", () => {
        act(() => {
            result.current.setSelectedMonth("2024-05");
        });
        expect(result.current.selectedMonth).toBe("2024-05");
        expect(result.current.displayMonth).toBe("May 2024");
    });

    it("should add a new category", () => {
        act(() => {
            result.current.setNewCategory({ name: "Housing" as BudgetCategoryName, amount: "1000" });
            result.current.addCategory();
        });
        expect(result.current.budgetCategories).toHaveLength(1);
        expect(result.current.budgetCategories[0].name).toBe("Housing");
        expect(result.current.budgetCategories[0].amount).toBe(1000);
        expect(result.current.isAddingCategory).toBe(false);
        expect(result.current.newCategory).toEqual({ name: "", amount: "" });
    });

    it("should not add a category with invalid data", () => {
        act(() => {
            result.current.setNewCategory({ name: "", amount: "" });
            result.current.addCategory();
        });
        expect(result.current.budgetCategories).toHaveLength(0);
        expect(result.current.formErrors).toEqual({
            name: "Please select a category",
            amount: "Please enter an amount",
        });
    });

    it("should edit a category", () => {
        // First add a category
        act(() => {
            result.current.setNewCategory({ name: "Housing" as BudgetCategoryName, amount: "1000" });
            result.current.addCategory();
        });

        const categoryId = result.current.budgetCategories[0].id;

        // Then edit it
        act(() => {
            result.current.setEditCategoryId(categoryId);
            result.current.setNewCategory({ name: "Food & Groceries" as BudgetCategoryName, amount: "500" });
            result.current.editCategory();
        });

        expect(result.current.budgetCategories).toHaveLength(1);
        expect(result.current.budgetCategories[0].name).toBe("Food & Groceries");
        expect(result.current.budgetCategories[0].amount).toBe(500);
        expect(result.current.editCategoryId).toBeNull();
    });

    it("should delete a category", () => {
        // First add a category
        act(() => {
            result.current.setNewCategory({ name: "Housing" as BudgetCategoryName, amount: "1000" });
            result.current.addCategory();
        });

        const categoryId = result.current.budgetCategories[0].id;

        // Then delete it
        act(() => {
            result.current.deleteCategory(categoryId);
        });

        expect(result.current.budgetCategories).toHaveLength(0);
    });

    it("should start editing a category", () => {
        // First add a category
        act(() => {
            result.current.setNewCategory({ name: "Housing" as BudgetCategoryName, amount: "1000" });
            result.current.addCategory();
        });

        const category = result.current.budgetCategories[0];

        // Then start editing it
        act(() => {
            result.current.startEditCategory(category);
        });

        expect(result.current.editCategoryId).toBe(category.id);
        expect(result.current.newCategory).toEqual({
            name: "Housing",
            amount: "1000",
        });
        expect(result.current.isAddingCategory).toBe(true);
    });
});
