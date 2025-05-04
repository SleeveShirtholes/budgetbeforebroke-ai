/**
 * CategoryDetailPanel Component
 *
 * Displays a list of unique merchants for a given category. Used as the detail panel in the categories table.
 * Memoized for performance.
 *
 * Props:
 * - merchants: Array of merchant names assigned to the category
 */
import React from "react";

// Props for CategoryDetailPanel
interface CategoryDetailPanelProps {
  merchants: string[];
}

/**
 * CategoryDetailPanel renders a list of merchants for the expanded category row.
 */
const CategoryDetailPanel: React.FC<CategoryDetailPanelProps> = React.memo(
  ({ merchants }) => {
    return (
      <div className="p-4">
        <h4 className="font-semibold mb-2 text-secondary-800">
          Merchants in this Category
        </h4>
        {merchants.length === 0 ? (
          <div className="text-gray-500">No merchants for this category.</div>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {merchants.map((merchant) => (
              <li key={merchant} className="text-sm text-gray-700">
                {merchant}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
CategoryDetailPanel.displayName = "CategoryDetailPanel";

export default CategoryDetailPanel;
