import React from "react";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  description?: string;
}

interface MerchantDetailPanelProps {
  transactions: Transaction[];
}

/**
 * MerchantDetailPanel Component
 *
 * Displays detailed information about a merchant's transactions in an expandable panel.
 * Shows a list of transactions associated with the merchant, including date, amount, and category.
 */
const MerchantDetailPanel: React.FC<MerchantDetailPanelProps> = ({
  transactions,
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-500">
          No transactions found for this merchant.
        </p>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
            >
              <div>
                <p className="font-medium">
                  {transaction.description || transaction.merchant}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()} •{" "}
                  {transaction.category}
                </p>
              </div>
              <p
                className={`font-medium ${transaction.amount < 0 ? "text-red-600" : "text-green-600"}`}
              >
                ${Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantDetailPanel;
