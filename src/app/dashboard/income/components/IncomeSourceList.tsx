import { BanknotesIcon, PlusIcon } from "@heroicons/react/24/outline";

import type { IncomeSource } from "@/app/actions/income";
import Button from "@/components/Button";
import Card from "@/components/Card";

/**
 * Props interface for the IncomeSourceList component
 */
interface IncomeSourceListProps {
  /** Array of income sources to display */
  incomeSources: IncomeSource[];
  /** Callback function called when an income source is selected for editing */
  onEdit: (source: IncomeSource) => void;
  /** Callback function called when an income source is selected for deletion */
  onDelete: (id: string) => void;
  /** Callback function called when the add new income source button is clicked */
  onAdd: () => void;
}

/**
 * Component for displaying a list of income sources with management actions
 *
 * This component renders a card containing either:
 * - An empty state with a call-to-action to add the first income source
 * - A list of existing income sources with edit and delete actions
 *
 * Features:
 * - Responsive design with proper spacing and typography
 * - Empty state with helpful messaging and icon
 * - Individual income source cards showing name, amount, frequency, and notes
 * - Action buttons for editing and deleting each income source
 * - Consistent styling using the design system components
 *
 * @param props - The component props
 * @param props.incomeSources - Array of income sources to display
 * @param props.onEdit - Function called when edit button is clicked for a source
 * @param props.onDelete - Function called when delete button is clicked for a source
 * @param props.onAdd - Function called when add new income source button is clicked
 *
 * @returns A card component displaying income sources or empty state
 */
export function IncomeSourceList({
  incomeSources,
  onEdit,
  onDelete,
  onAdd,
}: IncomeSourceListProps) {
  return (
    <Card>
      <div className="divide-y divide-gray-200">
        {incomeSources.length === 0 ? (
          // Empty state when no income sources exist
          <div className="flex flex-col items-center justify-center py-8 text-center text-secondary-500">
            {/* Money icon for visual appeal */}
            <BanknotesIcon className="h-12 w-12 text-secondary-300 mb-4" />

            {/* Empty state heading */}
            <div className="text-lg font-semibold text-secondary-900 mb-1">
              No income sources yet
            </div>

            {/* Helpful description text */}
            <p className="text-sm text-secondary-500 max-w-sm mb-4">
              Add your first income source to start tracking your monthly
              budget. This could be your salary, freelance work, or any other
              regular income.
            </p>

            {/* Call-to-action button to add first income source */}
            <Button variant="primary" size="md" onClick={onAdd}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Income Source
            </Button>
          </div>
        ) : (
          // List of existing income sources
          incomeSources.map((source) => (
            <div
              key={source.id}
              className="py-4 flex items-center justify-between"
            >
              {/* Income source details section */}
              <div>
                {/* Income source name */}
                <h3 className="text-lg font-medium text-secondary-900">
                  {source.name}
                </h3>

                {/* Amount and frequency information */}
                <p className="text-secondary-600">
                  ${source.amount.toFixed(2)} {source.frequency}
                </p>

                {/* Optional notes display */}
                {source.notes && (
                  <p className="text-sm text-secondary-500 mt-1">
                    {source.notes}
                  </p>
                )}
              </div>

              {/* Action buttons for this income source */}
              <div className="flex space-x-2">
                {/* Edit button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(source)}
                >
                  Edit
                </Button>

                {/* Delete button */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(source.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
