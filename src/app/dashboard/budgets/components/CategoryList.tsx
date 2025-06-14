import { InboxIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import Button from "@/components/Button";
import { BudgetCategory } from "../types/budget.types";
import { formatCurrency } from "../utils/budget.utils";
import { HighlightedText } from "./HighlightedText";

interface CategoryListProps {
  categories: BudgetCategory[];
  searchQuery: string;
  onEdit: (category: BudgetCategory) => void;
  onDelete: (id: string) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  isDeleting?: boolean;
}

/**
 * CategoryList Component
 *
 * A reusable component that displays a list of budget categories with their names and amounts.
 * Supports search highlighting, editing, and deletion of categories.
 *
 * @component
 * @param {BudgetCategory[]} categories - Array of budget categories to display
 * @param {string} searchQuery - Current search query for highlighting matching text
 * @param {(category: BudgetCategory) => void} onEdit - Callback function when edit button is clicked
 * @param {(id: string) => void} onDelete - Callback function when delete is confirmed
 * @param {string | null} deleteConfirmId - ID of the category pending deletion confirmation
 * @param {(id: string | null) => void} setDeleteConfirmId - Function to set the category ID pending deletion
 * @param {boolean} isDeleting - Indicates if the delete operation is in progress
 * @returns {JSX.Element} Rendered list of budget categories or empty state message
 */
export const CategoryList = ({
  categories,
  searchQuery,
  onEdit,
  onDelete,
  deleteConfirmId,
  setDeleteConfirmId,
  isDeleting = false,
}: CategoryListProps) => {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-secondary-500">
        <InboxIcon className="h-8 w-8 mb-2 text-secondary-300" />
        <div className="text-base font-semibold mb-1">No budget categories</div>
        <div className="text-sm text-secondary-400 max-w-md">
          Click <span className="font-semibold">Add Category</span> to create
          your first budget category.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between p-4 bg-white border border-secondary-100 rounded-lg"
        >
          <div className="flex items-center">
            <span className="font-medium text-secondary-900">
              <HighlightedText text={category.name} searchQuery={searchQuery} />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary-600">
              ${formatCurrency(category.amount)}
            </span>
            <Button
              variant="text"
              size="sm"
              onClick={() => onEdit(category)}
              aria-label="Edit category"
            >
              <PencilIcon className="w-5 h-5" />
            </Button>
            {deleteConfirmId === category.id ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(category.id)}
                isLoading={isDeleting}
              >
                Confirm?
              </Button>
            ) : (
              <Button
                variant="text"
                size="sm"
                onClick={() => setDeleteConfirmId(category.id)}
                aria-label="Delete category"
                disabled={isDeleting}
              >
                <TrashIcon className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
