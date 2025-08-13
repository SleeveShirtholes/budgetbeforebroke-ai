import { TRANSACTION_CATEGORIES } from "@/types/transaction";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CommonCategoriesProps {
  onAddCategory: (name: string) => void;
  existingCategories: string[];
  onDeleteCategory: (categoryName: string) => void;
}

/**
 * Renders a compact, chip-style list of common categories for quick add.
 */
export default function CommonCategories({
  onAddCategory,
  existingCategories,
  onDeleteCategory,
}: CommonCategoriesProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Common Categories</h2>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {TRANSACTION_CATEGORIES.map((category) => {
          const isEnabled = existingCategories.includes(category);
          return (
            <button
              key={category}
              onClick={() => {
                if (isEnabled) {
                  onDeleteCategory(category);
                } else {
                  onAddCategory(category);
                }
              }}
              className={`inline-flex items-center px-3 py-2 sm:px-3 sm:py-1 rounded-full text-sm font-medium transition-colors ${
                isEnabled
                  ? "bg-primary-100 text-primary-800 hover:bg-primary-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {category}
              {isEnabled && <XMarkIcon className="w-4 h-4 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
