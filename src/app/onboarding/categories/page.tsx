"use client";

import { createCategory } from "@/app/actions/category";
import { CheckIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from "@/types/transaction";

import Button from "@/components/Button";
import Card from "@/components/Card";
import TextField from "@/components/Forms/TextField";
import { useToast } from "@/components/Toast";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import OnboardingProgress from "../components/OnboardingProgress";

/**
 * CategoriesOnboardingPage Component
 *
 * A simplified onboarding page for setting up budget categories.
 * Users can select from common categories to add to their budget account.
 * This component provides a streamlined interface for initial category setup
 * during the onboarding process.
 *
 * Key Features:
 * - Displays common categories as toggleable chips
 * - Allows users to add/remove categories with a single click
 * - Integrates with the budget account context
 * - Provides navigation to next onboarding step
 * - Shows progress through the onboarding flow
 *
 * State Management:
 * - Tracks selected categories locally
 * - Manages loading states during category creation
 * - Integrates with the global budget account context
 *
 * Dependencies:
 * - Uses the budget account context for account-specific operations
 * - Integrates with category creation actions
 * - Utilizes toast notifications for user feedback
 *
 * @returns {JSX.Element} The rendered categories onboarding interface
 */
export default function CategoriesOnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { selectedAccount, isLoading: isAccountsLoading } = useBudgetAccount();

  // Track selected categories and loading state
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  // Load previously selected categories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("onboardingCategories");
    const savedCustom = localStorage.getItem("onboardingCustomCategories");
    if (saved) {
      setSelectedCategories(new Set(JSON.parse(saved)));
    }
    if (savedCustom) {
      setCustomCategories(JSON.parse(savedCustom));
    }
  }, []);

  // Save selected categories to localStorage
  useEffect(() => {
    localStorage.setItem(
      "onboardingCategories",
      JSON.stringify([...selectedCategories]),
    );
  }, [selectedCategories]);

  // Save custom categories to localStorage
  useEffect(() => {
    localStorage.setItem(
      "onboardingCustomCategories",
      JSON.stringify(customCategories),
    );
  }, [customCategories]);

  /**
   * Handles toggling a category selection
   * @param categoryName - The name of the category to toggle
   */
  const handleToggleCategory = (categoryName: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      newSelected.add(categoryName);
    }
    setSelectedCategories(newSelected);
  };

  /**
   * Handles adding a custom category
   */
  const handleAddCustomCategory = () => {
    if (!customCategoryName.trim()) return;

    const trimmedName = customCategoryName.trim();

    // Check if category already exists (either in common or custom)
    if (
      selectedCategories.has(trimmedName) ||
      customCategories.includes(trimmedName)
    ) {
      showToast("This category already exists.", { type: "error" });
      return;
    }

    // Check if it's a common category
    if (TRANSACTION_CATEGORIES.includes(trimmedName as TransactionCategory)) {
      showToast(
        "This is already a common category. Please select it from the list above.",
        { type: "error" },
      );
      return;
    }

    setCustomCategories([...customCategories, trimmedName]);
    setSelectedCategories(new Set([...selectedCategories, trimmedName]));
    setCustomCategoryName("");
    setShowCustomForm(false);
    showToast("Custom category added successfully!", { type: "success" });
  };

  /**
   * Handles removing a custom category
   */
  const handleRemoveCustomCategory = (categoryName: string) => {
    setCustomCategories(customCategories.filter((cat) => cat !== categoryName));
    const newSelected = new Set(selectedCategories);
    newSelected.delete(categoryName);
    setSelectedCategories(newSelected);
  };

  /**
   * Creates all selected categories in the database
   */
  const handleCreateCategories = async () => {
    if (!selectedAccount || selectedCategories.size === 0) return;

    setIsLoading(true);
    try {
      // Create all selected categories
      const promises = Array.from(selectedCategories).map((categoryName) =>
        createCategory({
          name: categoryName,
          budgetAccountId: selectedAccount.id,
        }),
      );

      await Promise.all(promises);

      // Mark this step as completed
      const saved = localStorage.getItem("onboardingProgress");
      const completedSteps = saved ? new Set(JSON.parse(saved)) : new Set();
      completedSteps.add("categories");
      localStorage.setItem(
        "onboardingProgress",
        JSON.stringify([...completedSteps]),
      );

      showToast("Categories created successfully!", { type: "success" });

      // Navigate to next step
      router.push("/onboarding/bills");
    } catch (error) {
      console.error("Failed to create categories:", error);
      showToast("Failed to create some categories. Please try again.", {
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if accounts are loading
  if (isAccountsLoading || !selectedAccount) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
          data-testid="loading-spinner"
        ></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <OnboardingProgress
        currentStep={4}
        totalSteps={5}
        stepTitles={["Account", "Invite", "Income", "Categories", "Bills"]}
      />

      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Set Up Your Budget Categories
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the categories you want to use for tracking your expenses. You
          can always add or remove categories later.
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Common Categories</h2>
            <p className="text-gray-600 mb-6">
              Click on categories to add or remove them from your budget.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {TRANSACTION_CATEGORIES.map((category) => {
                const isSelected = selectedCategories.has(category);
                return (
                  <button
                    key={category}
                    onClick={() => handleToggleCategory(category)}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium">{category}</span>
                    {isSelected && (
                      <CheckIcon className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Categories Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Custom Categories</h2>
            <p className="text-gray-600 mb-6">
              Add your own custom categories for specific expenses.
            </p>

            {/* Custom Categories List */}
            {customCategories.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Your Custom Categories:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {customCategories.map((category) => (
                    <div
                      key={category}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {category}
                      <button
                        onClick={() => handleRemoveCustomCategory(category)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Category Form */}
            {showCustomForm ? (
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <TextField
                    label="Custom Category Name"
                    placeholder="e.g., Gym Membership, Coffee, etc."
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomCategory();
                      }
                    }}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddCustomCategory}
                  disabled={!customCategoryName.trim()}
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomCategoryName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowCustomForm(true)}
                className="flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Custom Category
              </Button>
            )}
          </div>

          {selectedCategories.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">
                    Selected Categories ({selectedCategories.size})
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    These categories will be created for your budget account.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategories(new Set())}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/income")}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateCategories}
              disabled={selectedCategories.size === 0 || isLoading}
            >
              {isLoading ? "Creating..." : "Continue"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
