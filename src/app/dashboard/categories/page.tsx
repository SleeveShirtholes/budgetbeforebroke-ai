"use client";

import {
  createCategory,
  getCategories,
  updateCategory,
} from "@/app/actions/category";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Spinner from "@/components/Spinner";
import { ColumnDef } from "@/components/Table/types";
import { useToast } from "@/components/Toast";
import { mockTransactions } from "@/data/mockTransactions";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import CategoryDetailPanel from "./components/CategoryDetailPanel";
import CategoryModal from "./components/CategoryModal";
import CategoryTable from "./components/CategoryTable";
import CommonCategories from "./components/CommonCategories";
import DeleteCategoryModal from "./components/DeleteCategoryModal";

// Category type for table rows
interface Category extends Record<string, unknown> {
  id: string;
  name: string;
  description?: string;
  transactionCount: number;
}

/**
 * CategoriesPage Component
 *
 * A comprehensive dashboard page for managing transaction categories in the budget application.
 * This component serves as the main interface for users to create, view, edit, and delete
 * transaction categories, with support for both custom and common categories.
 *
 * Key Features:
 * - Displays a table of categories with search, sort, and filtering capabilities
 * - Supports adding new categories through a modal interface
 * - Enables editing of existing categories
 * - Provides category deletion with transaction reassignment options
 * - Shows common categories for quick addition
 * - Includes a detail panel showing merchants associated with each category
 *
 * State Management:
 * - Uses SWR for data fetching and caching of categories
 * - Manages modal states for add/edit/delete operations
 * - Tracks selected categories for editing and deletion
 * - Integrates with the global budget account context
 *
 * Dependencies:
 * - Uses the budget account context for account-specific operations
 * - Integrates with category-related actions for CRUD operations
 * - Utilizes various UI components (Button, Card, Table, etc.)
 *
 * @returns {JSX.Element} The rendered categories management interface
 */
export default function CategoriesPage() {
  // Get the currently selected budget account and loading state
  const { selectedAccount, isLoading: isAccountsLoading } = useBudgetAccount();
  const { showToast } = useToast();

  // Fetch categories data using SWR with account-specific caching
  const {
    data: categories = [],
    error,
    isLoading: isCategoriesLoading,
  } = useSWR(selectedAccount ? ["categories", selectedAccount.id] : null, () =>
    getCategories(selectedAccount!.id),
  );

  // Modal visibility states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Track which category is being edited or deleted
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  // Define table columns with sorting and filtering capabilities
  const columns: ColumnDef<Category>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      filterable: true,
      filterPlaceholder: "Search categories...",
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      filterable: true,
    },
    {
      key: "transactionCount",
      header: "Transactions",
      sortable: true,
      accessor: (row) => `${row.transactionCount} transactions`,
    },
  ];

  const getRowActions = (row: Category) => [
    {
      label: "Edit",
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: () => {
        setCategoryToEdit(row);
        setIsEditModalOpen(true);
      },
    },
    {
      label: "Delete",
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: () => {
        setCategoryToDelete(row);
        setIsDeleteModalOpen(true);
      },
    },
  ];

  // Memoize merchants for detail panel
  const getMerchantsForCategory = React.useCallback((categoryName: string) => {
    return Array.from(
      new Set(
        mockTransactions
          .filter((t) => t.category === categoryName)
          .map((t) => t.merchant),
      ),
    );
  }, []);

  const handleQuickAddCategory = async (name: string) => {
    try {
      if (!selectedAccount) return;
      await createCategory({ name, budgetAccountId: selectedAccount.id });
      await mutate(["categories", selectedAccount.id]);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes("already exists for this budget account")
      ) {
        showToast("That category already exists for this account.", {
          type: "error",
        });
      } else {
        console.error("Failed to add category:", error);
      }
    }
  };

  const handleAddCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      if (!selectedAccount) return;
      await createCategory({
        name: data.name,
        description: data.description,
        budgetAccountId: selectedAccount.id,
      });
      await mutate(["categories", selectedAccount.id]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const handleEditCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    if (!categoryToEdit) return;
    try {
      await updateCategory({
        id: categoryToEdit.id,
        name: data.name,
        description: data.description,
      });
      await mutate("categories");
      setIsEditModalOpen(false);
      setCategoryToEdit(null);
    } catch (error) {
      console.error("Failed to edit category:", error);
    }
  };

  // Show spinner if either accounts or categories are loading
  if (!selectedAccount || isAccountsLoading || isCategoriesLoading) {
    return <Spinner size="md" className="mt-12" />;
  }

  if (error) return <div>Failed to load categories</div>;

  return (
    <div className="p-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-gray-600 mt-2">
              Manage your transaction categories. Add common categories or
              create custom ones.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="ml-4"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Custom Category
          </Button>
        </div>
        <CommonCategories
          onAddCategory={handleQuickAddCategory}
          existingCategories={categories.map((c) => c.name)}
          onDeleteCategory={(categoryName) => {
            const category = categories.find((c) => c.name === categoryName);
            if (category) {
              setCategoryToDelete(category);
              setIsDeleteModalOpen(true);
            }
          }}
        />
        <CategoryTable
          categories={categories}
          columns={columns}
          getRowActions={getRowActions}
          detailPanel={(row) => (
            <CategoryDetailPanel
              merchants={getMerchantsForCategory(row.name)}
            />
          )}
        />
      </Card>
      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCategory}
        mode="add"
      />
      <CategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleEditCategory}
        defaultValues={
          categoryToEdit
            ? {
                name: categoryToEdit.name,
                description: categoryToEdit.description || "",
              }
            : undefined
        }
        mode="edit"
      />
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        categoryToDelete={categoryToDelete}
        selectedAccountId={selectedAccount.id}
      />
    </div>
  );
}
