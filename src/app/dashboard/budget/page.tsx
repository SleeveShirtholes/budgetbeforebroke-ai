"use client";

import { CalendarIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { BUDGET_CATEGORIES, BudgetCategory, BudgetCategoryName, CATEGORY_COLORS } from "./types/budget.types";
import { calculateRemainingBudget, calculateTotalBudgeted, generateMonthOptions } from "./utils/budget.utils";

import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomSelect from "@/components/Forms/CustomSelect";
import SearchInput from "@/components/Forms/SearchInput";
import { format } from "date-fns";
import { BudgetOverview } from "./components/BudgetOverview";
import { CategoryForm } from "./components/CategoryForm";
import { CategoryList } from "./components/CategoryList";

/**
 * Main Budget component that displays and manages budget categories for a selected month.
 * Handles CRUD operations for budget categories and displays budget overview.
 *
 * @returns {JSX.Element} The rendered budget management interface
 */
export default function Budget() {
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
    const [displayMonth, setDisplayMonth] = useState(format(new Date(), "MMMM yyyy"));
    const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState<{ name: BudgetCategoryName | ""; amount: string }>({
        name: "",
        amount: "",
    });
    const [formErrors, setFormErrors] = useState<{ name?: string; amount?: string }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const customSelectRef = useRef<HTMLInputElement>(null);

    /**
     * Updates the display month format whenever the selected month changes.
     * Converts the YYYY-MM format to a more readable "Month Year" format.
     */
    useEffect(() => {
        const [year, month] = selectedMonth.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        setDisplayMonth(format(date, "MMMM yyyy"));
    }, [selectedMonth]);

    // For calculations, use a static value for totalBudget
    const totalBudget = 2000;

    // Calculate total budgeted amount
    const totalBudgeted = calculateTotalBudgeted(budgetCategories);
    const remainingBudget = calculateRemainingBudget(totalBudget, totalBudgeted);

    // Get available categories (excluding ones already used)
    const availableCategories = BUDGET_CATEGORIES.filter(
        (category) => !budgetCategories.some((budgetCat) => budgetCat.name === category)
    );

    // Filter categories based on search query
    const filteredCategories = budgetCategories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /**
     * Adds a new budget category to the list.
     * Validates the input and handles form state management.
     *
     * @param {boolean} keepOpen - Whether to keep the form open after adding a category
     */
    const handleAddCategory = (keepOpen = false) => {
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
            setFormErrors(errors);
            return;
        }

        const amount = parseFloat(newCategory.amount);
        const category: BudgetCategory = {
            id: `cat-${Date.now()}`,
            name: newCategory.name as BudgetCategoryName,
            amount: amount,
            color: CATEGORY_COLORS[newCategory.name as BudgetCategoryName],
        };
        setBudgetCategories([...budgetCategories, category]);
        setNewCategory({ name: "", amount: "" });
        setFormErrors({});
        if (!keepOpen) {
            setIsAddingCategory(false);
        } else {
            // Focus the CustomSelect when keeping the form open
            setTimeout(() => {
                customSelectRef.current?.focus();
            }, 0);
        }
    };

    /**
     * Initiates the editing process for a budget category.
     * Pre-fills the form with the category's current values.
     *
     * @param {BudgetCategory} category - The category to be edited
     */
    const startEditCategory = (category: BudgetCategory) => {
        setEditCategoryId(category.id);
        setNewCategory({ name: category.name, amount: category.amount.toString() });
        setIsAddingCategory(true);
    };

    /**
     * Saves the edited category with updated values.
     * Validates the input and updates the category list.
     *
     * @param {boolean} keepOpen - Whether to keep the form open after saving
     */
    const handleSaveEditCategory = (keepOpen = false) => {
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
            setFormErrors(errors);
            return;
        }
        const amount = parseFloat(newCategory.amount.replace(/[^0-9.]/g, ""));
        setBudgetCategories(
            budgetCategories.map((cat) =>
                cat.id === editCategoryId
                    ? {
                          ...cat,
                          name: newCategory.name as BudgetCategoryName,
                          amount,
                          color: CATEGORY_COLORS[newCategory.name as BudgetCategoryName],
                      }
                    : cat
            )
        );
        setNewCategory({ name: "", amount: "" });
        setFormErrors({});
        setEditCategoryId(null);
        if (!keepOpen) {
            setIsAddingCategory(false);
        }
    };

    /**
     * Deletes a budget category from the list.
     *
     * @param {string} id - The ID of the category to be deleted
     */
    const handleDeleteCategory = (id: string) => {
        setBudgetCategories(budgetCategories.filter((cat) => cat.id !== id));
        setDeleteConfirmId(null);
    };

    /**
     * Handles the click event for adding a new category.
     * Opens the form and focuses the category select input.
     */
    const handleAddCategoryClick = () => {
        setIsAddingCategory(true);
        setTimeout(() => {
            customSelectRef.current?.focus();
        }, 0);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-secondary-900">Budget for {displayMonth}</h1>
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
            <BudgetOverview totalBudget={totalBudget} totalBudgeted={totalBudgeted} remainingBudget={remainingBudget} />

            {/* Budget Categories Section */}
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-secondary-900">Budget Categories</h2>
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
                        newCategory={newCategory}
                        setNewCategory={setNewCategory}
                        formErrors={formErrors}
                        setFormErrors={setFormErrors}
                        availableCategories={availableCategories}
                        isEditing={!!editCategoryId}
                        onSave={editCategoryId ? handleSaveEditCategory : handleAddCategory}
                        onCancel={() => {
                            setIsAddingCategory(false);
                            setNewCategory({ name: "", amount: "" });
                            setFormErrors({});
                            setEditCategoryId(null);
                        }}
                        customSelectRef={customSelectRef}
                    />
                )}

                {/* Search Bar */}
                <div className="mb-4">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search categories..." />
                </div>

                {/* Categories List */}
                <CategoryList
                    categories={filteredCategories}
                    searchQuery={searchQuery}
                    onEdit={startEditCategory}
                    onDelete={handleDeleteCategory}
                    deleteConfirmId={deleteConfirmId}
                    setDeleteConfirmId={setDeleteConfirmId}
                />
            </Card>
        </div>
    );
}
