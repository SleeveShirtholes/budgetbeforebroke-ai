"use client";

import { CalendarIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  calculateRemainingBudget,
  calculateTotalBudgeted,
  generateMonthOptions,
} from "./utils/budget.utils";

import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomSelect from "@/components/Forms/CustomSelect";
import SearchInput from "@/components/Forms/SearchInput";
import useBudgetsStore from "@/stores/budgetsStore";
import { useRef } from "react";
import { BudgetOverview } from "./components/BudgetOverview";
import { CategoryForm } from "./components/CategoryForm";
import { CategoryList } from "./components/CategoryList";
import { BUDGET_CATEGORIES } from "./types/budget.types";

/**
 * Main Budget component that displays and manages budget categories for a selected month.
 * Handles CRUD operations for budget categories and displays budget overview.
 *
 * @returns {JSX.Element} The rendered budget management interface
 */
export default function Budget() {
  const {
    selectedMonth,
    displayMonth,
    budgetCategories,
    isAddingCategory,
    newCategory,
    formErrors,
    searchQuery,
    editCategoryId,
    deleteConfirmId,
    setSelectedMonth,
    setNewCategory,
    setFormErrors,
    setSearchQuery,
    setDeleteConfirmId,
    addCategory,
    editCategory,
    deleteCategory,
    startEditCategory,
  } = useBudgetsStore();

  const customSelectRef = useRef<HTMLInputElement>(null);

  // For calculations, use a static value for totalBudget
  const totalBudget = 2000;

  // Calculate total budgeted amount
  const totalBudgeted = calculateTotalBudgeted(budgetCategories);
  const remainingBudget = calculateRemainingBudget(totalBudget, totalBudgeted);

  // Get available categories (excluding ones already used)
  const availableCategories = BUDGET_CATEGORIES.filter(
    (category) =>
      !budgetCategories.some((budgetCat) => budgetCat.name === category),
  );

  // Filter categories based on search query
  const filteredCategories = budgetCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /**
   * Handles the click event for adding a new category.
   * Opens the form and focuses the category select input.
   */
  const handleAddCategoryClick = () => {
    useBudgetsStore.setState({ isAddingCategory: true });
    setTimeout(() => {
      customSelectRef.current?.focus();
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-secondary-900">
          Budget for {displayMonth}
        </h1>
        <div className="min-w-[200px]">
          <CustomSelect
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value)}
            options={generateMonthOptions()}
            label=""
            leftIcon={<CalendarIcon className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Budget Overview */}
      <BudgetOverview
        totalBudget={totalBudget}
        totalBudgeted={totalBudgeted}
        remainingBudget={remainingBudget}
      />

      {/* Budget Categories Section */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            Budget Categories
          </h2>
          <Button
            variant="primary"
            size="md"
            onClick={handleAddCategoryClick}
            disabled={availableCategories.length === 0}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Add Category Form */}
        {isAddingCategory && (
          <CategoryForm
            budgetId="test-budget-id"
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            availableCategories={availableCategories}
            isEditing={!!editCategoryId}
            onSave={editCategoryId ? editCategory : addCategory}
            onCancel={() => {
              useBudgetsStore.setState({
                isAddingCategory: false,
                newCategory: { name: "", amount: "" },
                formErrors: {},
                editCategoryId: null,
              });
            }}
          />
        )}

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
          categories={filteredCategories}
          searchQuery={searchQuery}
          onEdit={startEditCategory}
          onDelete={deleteCategory}
          deleteConfirmId={deleteConfirmId}
          setDeleteConfirmId={setDeleteConfirmId}
        />
      </Card>
    </div>
  );
}
