"use client";

import { CalendarIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  calculateRemainingBudget,
  calculateTotalBudgeted,
  generateMonthOptions,
} from "./utils/budget.utils";
import {
  createBudget,
  createBudgetCategory,
  deleteBudgetCategory,
  getBudget,
  getBudgetCategories,
  updateBudgetCategory,
} from "@/app/actions/budget";
import { format, parse } from "date-fns";
import { useRef, useState } from "react";
import useSWR, { mutate } from "swr";

import { BudgetCategoryName } from "./types/budget.types";
import { BudgetOverview } from "./components/BudgetOverview";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { CategoryForm } from "./components/CategoryForm";
import { CategoryList } from "./components/CategoryList";
import CustomSelect from "@/components/Forms/CustomSelect";
import Modal from "@/components/Modal/Modal";
import SearchInput from "@/components/Forms/SearchInput";
import Spinner from "@/components/Spinner";
import { calculateMonthlyIncome } from "@/app/actions/income";
import { getCategories } from "@/app/actions/category";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import { useToast } from "@/components/Toast";

interface BudgetCategory {
  id: string;
  name: BudgetCategoryName;
  amount: number;
  color: string;
}

/**
 * Main Budget component that displays and manages budget categories for a selected month.
 * Handles CRUD operations for budget categories and displays budget overview.
 *
 * @returns {JSX.Element} The rendered budget management interface
 */
export default function Budget() {
  // Use 'yyyy-MM' format for selectedMonth
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM"),
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<{
    name: BudgetCategoryName | "";
    amount: string;
  }>({
    name: "",
    amount: "",
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    amount?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { showToast } = useToast();

  const customSelectRef = useRef<HTMLInputElement>(null);
  const { selectedAccount } = useBudgetAccount();

  // Fetch calculated monthly income
  const [year, month] = selectedMonth.split("-").map(Number);
  const { data: monthlyIncome, isLoading: isLoadingIncome } = useSWR(
    selectedAccount
      ? ["monthly-income", selectedAccount.id, year, month]
      : null,
    () =>
      selectedAccount
        ? calculateMonthlyIncome(selectedAccount.id, year, month)
        : 0,
  );

  // Fetch budgets for the selected month
  const { data: budget, isLoading: isLoadingBudget } = useSWR(
    selectedAccount ? ["budgetId", selectedAccount.id, selectedMonth] : null,
    async () => {
      if (!selectedAccount) return null;
      const [year, month] = selectedMonth.split("-").map(Number);
      // Try to fetch the budget first
      let budget = await getBudget(selectedAccount.id, year, month);
      if (!budget) {
        budget = await createBudget(
          selectedAccount.id,
          year,
          month,
          monthlyIncome || undefined,
        );
      }
      return budget;
    },
  );

  // Fetch budget categories for the selected budget
  const { data: budgetCategories, isLoading: isLoadingCategories } = useSWR(
    budget ? ["budgets", budget.id] : null,
    () => (budget ? getBudgetCategories(budget.id) : []),
  );

  // Fetch available categories for the selected account
  const {
    data: availableCategoriesRaw = [],
    isLoading: isLoadingAvailableCategories,
  } = useSWR(selectedAccount ? ["categories", selectedAccount.id] : null, () =>
    getCategories(selectedAccount!.id),
  );

  // Map available categories to just their names
  const availableCategories = availableCategoriesRaw.map(
    (cat) => cat.name as BudgetCategoryName,
  );

  // Parse selectedMonth to Date for display
  const displayMonth = parse(
    selectedMonth,
    "yyyy-MM",
    new Date(),
  ).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Calculate total budgeted amount
  const totalBudgeted = calculateTotalBudgeted(budgetCategories || []);

  const isLoading =
    !selectedAccount ||
    isLoadingBudget ||
    isLoadingCategories ||
    isLoadingAvailableCategories ||
    isLoadingIncome;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  /**
   * Handles the click event for adding a new category.
   * Opens the form and focuses the category select input.
   */
  const handleAddCategoryClick = () => {
    setIsFormSubmitting(false);
    setIsAddingCategory(true);
    setTimeout(() => {
      customSelectRef.current?.focus();
    }, 0);
  };

  const handleSaveCategory = async (keepOpen: boolean) => {
    try {
      if (!selectedAccount) {
        throw new Error("No account selected");
      }

      // Check if category already exists for this month
      if (
        !editCategoryId &&
        budgetCategories?.some((cat) => cat.name === newCategory.name)
      ) {
        showToast(
          "This category already exists for this month. Please edit the existing category instead.",
          {
            type: "error",
            duration: 5000,
          },
        );
        return false;
      }

      if (editCategoryId) {
        await updateBudgetCategory(
          editCategoryId,
          parseFloat(newCategory.amount),
        );
      } else {
        // Create a budget for the selected month if it doesn't exist
        const budget = await createBudget(
          selectedAccount.id,
          parseInt(selectedMonth.split("-")[0]),
          parseInt(selectedMonth.split("-")[1]),
          monthlyIncome || undefined,
        );

        await createBudgetCategory(
          budget.id,
          newCategory.name as BudgetCategoryName,
          parseFloat(newCategory.amount),
        );
      }

      // Mutate all relevant queries
      await Promise.all([
        mutate(["budgetId", selectedAccount.id, selectedMonth]),
        mutate(["monthly-income", selectedAccount.id, year, month]),
        mutate(budget ? ["budgets", budget.id] : null),
      ]);

      if (!keepOpen) {
        setIsAddingCategory(false);
        setNewCategory({ name: "", amount: "" });
        setEditCategoryId(null);
        setFormErrors({});
      }
      return true;
    } catch (error) {
      console.error("Error saving category:", error);
      showToast(
        "An error occurred while saving the category. Please try again.",
        {
          type: "error",
          duration: 5000,
        },
      );
      return false;
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      if (!selectedAccount) {
        throw new Error("No account selected");
      }
      setIsDeleting(true);
      await deleteBudgetCategory(id);
      // Mutate all relevant queries
      await Promise.all([
        mutate(["budgetId", selectedAccount.id, selectedMonth]),
        mutate(["monthly-income", selectedAccount.id, year, month]),
        mutate(budget ? ["budgets", budget.id] : null),
      ]);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditCategory = (category: BudgetCategory) => {
    setEditCategoryId(category.id);
    setNewCategory({
      name: category.name,
      amount: category.amount.toString(),
    });
    setIsAddingCategory(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-secondary-900">
          Budget for {displayMonth}
        </h1>
        <div className="w-full sm:min-w-[200px] sm:w-auto">
          <CustomSelect
            value={selectedMonth}
            onChange={(value: string) => setSelectedMonth(value)}
            options={generateMonthOptions()}
            label=""
            leftIcon={<CalendarIcon className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Budget Overview */}
      <BudgetOverview
        totalBudget={Number(monthlyIncome || 0)}
        totalBudgeted={totalBudgeted}
        remainingBudget={calculateRemainingBudget(
          Number(monthlyIncome || 0),
          totalBudgeted,
        )}
        monthlyIncome={monthlyIncome}
      />

      {/* Budget Categories Section */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            Budget Categories
          </h2>
          <Button variant="primary" size="md" onClick={handleAddCategoryClick}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Add Category Form */}
        <Modal
          isOpen={isAddingCategory}
          onClose={() => {
            setIsAddingCategory(false);
            setNewCategory({ name: "", amount: "" });
            setFormErrors({});
            setEditCategoryId(null);
            setIsFormSubmitting(false);
          }}
          title={editCategoryId ? "Edit Category" : "Add Category"}
          maxWidth="md"
          footerButtons={
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategory({ name: "", amount: "" });
                  setFormErrors({});
                  setEditCategoryId(null);
                  setIsFormSubmitting(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                form="category-form"
                isLoading={isFormSubmitting}
              >
                {editCategoryId ? "Save" : "Add"}
              </Button>
            </div>
          }
        >
          <CategoryForm
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            availableCategories={availableCategories}
            isEditing={!!editCategoryId}
            onSave={handleSaveCategory}
            editCategoryId={editCategoryId || undefined}
            onLoadingChange={setIsFormSubmitting}
          />
        </Modal>

        {/* Search Bar */}
        <div className="mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search categories..."
          />
        </div>

        {/* Categories List */}
        <CategoryList
          categories={budgetCategories || []}
          searchQuery={searchQuery}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          deleteConfirmId={deleteConfirmId}
          setDeleteConfirmId={setDeleteConfirmId}
          isDeleting={isDeleting}
        />
      </Card>
    </div>
  );
}
