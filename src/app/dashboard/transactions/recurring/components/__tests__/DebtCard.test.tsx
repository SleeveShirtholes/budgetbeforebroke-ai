import { render, screen } from "@testing-library/react";

import { RecurringDebt } from "@/types/debt";
import userEvent from "@testing-library/user-event";
import DebtCard from "../DebtCard";

const mockDebt: RecurringDebt = {
  id: "1",
  name: "Test Debt",
  balance: "1000",
  interestRate: "5",
  dueDate: "2024-04-01",
  payments: [
    {
      id: "1",
      date: "2024-03-01",
      amount: 100,
      note: "First payment",
    },
  ],
};

const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnPay = jest.fn();

describe("DebtCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders debt information correctly", () => {
    render(
      <DebtCard
        debt={mockDebt}
        search=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />,
    );

    expect(screen.getByText("Test Debt")).toBeInTheDocument();
    expect(screen.getByText("$1000")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    render(
      <DebtCard
        debt={mockDebt}
        search=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />,
    );

    const editButton = screen.getByLabelText("Edit Recurring");
    await userEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockDebt);
  });

  it("calls onDelete when delete button is clicked", async () => {
    render(
      <DebtCard
        debt={mockDebt}
        search=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />,
    );

    const deleteButton = screen.getByLabelText("Delete Recurring");
    await userEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockDebt.id);
  });

  it("calls onPay when pay button is clicked", async () => {
    render(
      <DebtCard
        debt={mockDebt}
        search=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />,
    );

    const payButton = screen.getByLabelText("Pay Recurring");
    await userEvent.click(payButton);

    expect(mockOnPay).toHaveBeenCalledWith(mockDebt.id);
  });

  it("toggles payment history when clicked", async () => {
    render(
      <DebtCard
        debt={mockDebt}
        search=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />,
    );

    const card = screen.getByText("Test Debt").closest("div");
    if (!card) throw new Error("Card element not found");

    // Initially payment history should not be visible
    expect(screen.queryByText("Payment History")).not.toBeInTheDocument();

    // Click to expand
    await userEvent.click(card);
    expect(screen.getByText("Payment History")).toBeInTheDocument();

    // Click to collapse
    await userEvent.click(card);
    expect(screen.queryByText("Payment History")).not.toBeInTheDocument();
  });

  it("displays payment history when expanded", async () => {
    render(
      <DebtCard
        debt={mockDebt}
        search=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />,
    );

    const card = screen.getByText("Test Debt").closest("div");
    if (!card) throw new Error("Card element not found");

    await userEvent.click(card);

    expect(screen.getByText("First payment")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(
      screen.getAllByText(new Date("2024-03-01").toLocaleDateString())[0],
    ).toBeInTheDocument();
  });

  it('shows "No payments yet" when there are no payments', async () => {
    const debtWithoutPayments = { ...mockDebt, payments: [] };

    render(
      <DebtCard
        debt={debtWithoutPayments}
        search=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />,
    );

    const card = screen.getByText("Test Debt").closest("div");
    if (!card) throw new Error("Card element not found");

    await userEvent.click(card);

    expect(screen.getByText("No payments yet")).toBeInTheDocument();
  });
});
