import { fireEvent, render, screen } from "@testing-library/react";

import type { IncomeSource } from "@/app/actions/income";
import { IncomeSourceList } from "../IncomeSourceList";

const mockIncomeSources: IncomeSource[] = [
  {
    id: "1",
    userId: "user1",
    name: "Salary",
    amount: 5000,
    frequency: "monthly",
    startDate: "2024-01-01",
    notes: "Monthly salary",
    isActive: true,
  },
  {
    id: "2",
    userId: "user1",
    name: "Freelance",
    amount: 1000,
    frequency: "bi-weekly",
    startDate: "2024-01-01",
    isActive: true,
  },
];

describe("IncomeSourceList", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no income sources", () => {
    render(
      <IncomeSourceList
        incomeSources={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />,
    );

    expect(screen.getByText("No income sources yet")).toBeInTheDocument();
    expect(
      screen.getByText(/Add your first income source/),
    ).toBeInTheDocument();

    // Test add button in empty state
    const addButton = screen.getByRole("button", {
      name: /add income source/i,
    });
    fireEvent.click(addButton);
    expect(mockOnAdd).toHaveBeenCalled();
  });

  it("renders list of income sources", () => {
    render(
      <IncomeSourceList
        incomeSources={mockIncomeSources}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />,
    );

    // Check if both sources are rendered
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Freelance")).toBeInTheDocument();

    // Check amounts and frequencies
    expect(screen.getByText("$5000.00 monthly")).toBeInTheDocument();
    expect(screen.getByText("$1000.00 bi-weekly")).toBeInTheDocument();

    // Check notes
    expect(screen.getByText("Monthly salary")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <IncomeSourceList
        incomeSources={mockIncomeSources}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />,
    );

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockIncomeSources[0]);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <IncomeSourceList
        incomeSources={mockIncomeSources}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />,
    );

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockIncomeSources[0].id);
  });
});
