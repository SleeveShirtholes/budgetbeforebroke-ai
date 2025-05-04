"use client";

import {
  TRANSACTION_CATEGORIES,
  TransactionCategory,
} from "@/types/transaction";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomSelect from "@/components/Forms/CustomSelect";
import Modal from "@/components/Modal";
import { ColumnDef } from "@/components/Table/types";
import { mockTransactions } from "@/data/mockTransactions";
import useCategoriesStore from "@/stores/categoriesStore";
import React from "react";
import CategoryDetailPanel from "./components/CategoryDetailPanel";
import CategoryModal from "./components/CategoryModal";
import CategoryTable from "./components/CategoryTable";

interface Category extends Record<string, unknown> {
  id: string;
  name: string;
  description?: string;
  transactionCount: number;
}

/**
 * CategoriesPage Component
 *
 * Main dashboard page for managing custom transaction categories.
 * Features:
 * - Displays a table of categories with search, sort, and expandable detail panel (merchants per category)
 * - Allows adding, editing, and deleting categories using modals
 * - Handles transaction reassignment or unassignment on category deletion
 * - Uses modular, memoized subcomponents for performance and maintainability
 *
 * State:
 * - categories: List of all categories
 * - form: Controlled form state for add/edit modals
 * - isAddModalOpen, isEditModalOpen, isDeleteModalOpen: Modal visibility
 * - categoryToEdit, categoryToDelete: Track which category is being edited or deleted
 * - selectedReplacementCategory: For handling transaction reassignment on delete
 *
 * This page is the main entry point for category management in the dashboard.
 */

export default function CategoriesPage() {
  const {
    categories,
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    categoryToDelete,
    selectedReplacementCategory,
    form,
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeAddModal,
    closeEditModal,
    closeDeleteModal,
    setForm,
    setSelectedReplacementCategory,
    addCategory,
    editCategory,
    deleteCategory,
  } = useCategoriesStore();

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
      onClick: () => openEditModal(row),
    },
    {
      label: "Delete",
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: () => openDeleteModal(row),
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

  return (
    <div className="p-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-gray-600 mt-2">
              Manage your transaction categories. Edit or delete categories, and
              handle transactions when deleting.
            </p>
          </div>
          <Button variant="primary" onClick={openAddModal} className="ml-4">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>
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
        onClose={closeAddModal}
        onSave={addCategory}
        form={form}
        setForm={(value) =>
          setForm(typeof value === "function" ? value(form) : value)
        }
        mode="add"
      />
      <CategoryModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={editCategory}
        form={form}
        setForm={(value) =>
          setForm(typeof value === "function" ? value(form) : value)
        }
        mode="edit"
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Category"
        maxWidth="md"
        footerButtons={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={closeDeleteModal}
            >
              Cancel
            </Button>
            <Button variant="danger" type="button" onClick={deleteCategory}>
              Delete Category
            </Button>
          </>
        }
      >
        {categoryToDelete && (
          <div className="space-y-4">
            <p>
              You are about to delete the category{" "}
              <span className="font-semibold">{categoryToDelete.name}</span>.
              This category has {categoryToDelete.transactionCount} transactions
              assigned to it.
            </p>
            <p>What would you like to do with these transactions?</p>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="unassign"
                  name="transaction-handling"
                  value="unassign"
                  checked={selectedReplacementCategory === ""}
                  onChange={() => setSelectedReplacementCategory("")}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label
                  htmlFor="unassign"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Leave transactions unassigned
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="reassign"
                  name="transaction-handling"
                  value="reassign"
                  checked={selectedReplacementCategory !== ""}
                  onChange={() =>
                    setSelectedReplacementCategory(TRANSACTION_CATEGORIES[0])
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label
                  htmlFor="reassign"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Assign to another category
                </label>
              </div>

              {selectedReplacementCategory !== "" && (
                <div className="ml-7 mt-2">
                  <CustomSelect
                    value={selectedReplacementCategory}
                    onChange={(value) =>
                      setSelectedReplacementCategory(
                        value as TransactionCategory,
                      )
                    }
                    options={TRANSACTION_CATEGORIES.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                    label="Select category"
                    placeholder="Choose a category"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
