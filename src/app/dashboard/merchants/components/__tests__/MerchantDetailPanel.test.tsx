import { render, screen } from "@testing-library/react";

import MerchantDetailPanel from "../MerchantDetailPanel";

describe("MerchantDetailPanel", () => {
  const mockTransactions = [
    {
      id: "1",
      date: "2024-03-20",
      amount: 50.0,
      category: "Shopping",
      merchant: "Test Merchant",
      description: "Test Purchase",
    },
    {
      id: "2",
      date: "2024-03-19",
      amount: -25.0,
      category: "Food",
      merchant: "Test Merchant",
    },
  ];

  it("renders transactions list", () => {
    render(<MerchantDetailPanel transactions={mockTransactions} />);

    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
    expect(screen.getByText("Test Purchase")).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("Shopping")),
    ).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
    expect(screen.getByText("Test Merchant")).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("Food")),
    ).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
  });

  it("renders empty state when no transactions", () => {
    render(<MerchantDetailPanel transactions={[]} />);

    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
    expect(
      screen.getByText("No transactions found for this merchant."),
    ).toBeInTheDocument();
  });

  it("renders transaction amounts with correct colors", () => {
    render(<MerchantDetailPanel transactions={mockTransactions} />);

    const positiveAmount = screen.getByText("$50.00");
    const negativeAmount = screen.getByText("$25.00");

    expect(positiveAmount).toHaveClass("text-green-600");
    expect(negativeAmount).toHaveClass("text-red-600");
  });
});
