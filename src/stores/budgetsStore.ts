import { BudgetCategory, BudgetCategoryName, CATEGORY_COLORS } from "@/app/dashboard/budgets/types/budget.types";

import { create } from "zustand";

interface BudgetState {
    selectedMonth: string;
    displayMonth: string;
    budgetCategories: BudgetCategory[];
    isAddingCategory: boolean;
    newCategory: {
        name: BudgetCategoryName | "";
        amount: string;
    };
    formErrors: {
        name?: string;
        amount?: string;
    };
    searchQuery: string;
    editCategoryId: string | null;
    deleteConfirmId: string | null;
    setSelectedMonth: (month: string) => void;
    setDisplayMonth: (month: string) => void;
    setBudgetCategories: (categories: BudgetCategory[]) => void;
    setIsAddingCategory: (isAdding: boolean) => void;
    setNewCategory: (category: { name: BudgetCategoryName | ""; amount: string }) => void;
    setFormErrors: (errors: { name?: string; amount?: string }) => void;
    setSearchQuery: (query: string) => void;
    setEditCategoryId: (id: string | null) => void;
    setDeleteConfirmId: (id: string | null) => void;
    addCategory: (keepOpen?: boolean) => void;
    editCategory: (keepOpen?: boolean) => void;
    deleteCategory: (id: string) => void;
    startEditCategory: (category: BudgetCategory) => void;
}

const useBudgetsStore = create<BudgetState>((set, get) => ({
    selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
    displayMonth: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    budgetCategories: [],
    isAddingCategory: false,
    newCategory: {
        name: "",
        amount: "",
    },
    formErrors: {},
    searchQuery: "",
    editCategoryId: null,
    deleteConfirmId: null,

    setSelectedMonth: (month) => {
        set({ selectedMonth: month });
        const [year, monthNum] = month.split("-");
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        set({ displayMonth: date.toLocaleString("default", { month: "long", year: "numeric" }) });
    },

    setDisplayMonth: (month) => set({ displayMonth: month }),
    setBudgetCategories: (categories) => set({ budgetCategories: categories }),
    setIsAddingCategory: (isAdding) => set({ isAddingCategory: isAdding }),
    setNewCategory: (category) => set({ newCategory: category }),
    setFormErrors: (errors) => set({ formErrors: errors }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setEditCategoryId: (id) => set({ editCategoryId: id }),
    setDeleteConfirmId: (id) => set({ deleteConfirmId: id }),

    addCategory: (keepOpen = false) => {
        const { newCategory, budgetCategories } = get();
        const errors: { name?: string; amount?: string } = {};

        if (!newCategory.name) {
            errors.name = "Please select a category";
        }

        if (!newCategory.amount) {
            errors.amount = "Please enter an amount";
        } else {
            const amount = parseFloat(newCategory.amount);
            if (amount <= 0) {
                errors.amount = "Amount must be greater than 0";
            }
        }

        if (Object.keys(errors).length > 0) {
            set({ formErrors: errors });
            return;
        }

        const amount = parseFloat(newCategory.amount);
        const category: BudgetCategory = {
            id: `cat-${Date.now()}`,
            name: newCategory.name as BudgetCategoryName,
            amount: amount,
            color: CATEGORY_COLORS[newCategory.name as BudgetCategoryName],
        };

        set({
            budgetCategories: [...budgetCategories, category],
            newCategory: { name: "", amount: "" },
            formErrors: {},
            isAddingCategory: keepOpen,
        });
    },

    editCategory: (keepOpen = false) => {
        const { newCategory, budgetCategories, editCategoryId } = get();
        const errors: { name?: string; amount?: string } = {};

        if (!newCategory.name) {
            errors.name = "Please select a category";
        }

        if (!newCategory.amount) {
            errors.amount = "Please enter an amount";
        } else {
            const amount = parseFloat(newCategory.amount.replace(/[^0-9.]/g, ""));
            if (amount <= 0) {
                errors.amount = "Amount must be greater than 0";
            }
        }

        if (Object.keys(errors).length > 0) {
            set({ formErrors: errors });
            return;
        }

        const amount = parseFloat(newCategory.amount.replace(/[^0-9.]/g, ""));
        set({
            budgetCategories: budgetCategories.map((cat) =>
                cat.id === editCategoryId
                    ? {
                          ...cat,
                          name: newCategory.name as BudgetCategoryName,
                          amount,
                          color: CATEGORY_COLORS[newCategory.name as BudgetCategoryName],
                      }
                    : cat
            ),
            newCategory: { name: "", amount: "" },
            formErrors: {},
            editCategoryId: null,
            isAddingCategory: keepOpen,
        });
    },

    deleteCategory: (id) => {
        const { budgetCategories } = get();
        set({
            budgetCategories: budgetCategories.filter((cat) => cat.id !== id),
            deleteConfirmId: null,
        });
    },

    startEditCategory: (category) => {
        set({
            editCategoryId: category.id,
            newCategory: { name: category.name, amount: category.amount.toString() },
            isAddingCategory: true,
        });
    },
}));

export default useBudgetsStore;
