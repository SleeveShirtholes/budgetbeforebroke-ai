import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import type { IncomeSource } from "@/app/actions/income";
import userEvent from "@testing-library/user-event";
import { IncomeSourceForm } from "../IncomeSourceForm";

// Mock the CustomDatePicker component
jest.mock("@/components/Forms/CustomDatePicker", () => {
  return function MockCustomDatePicker({
    label,
    value,
    onChange,
  }: {
    label: string;
    value?: string;
    onChange: (date: string) => void;
  }) {
    return (
      <div>
        <label>{label}</label>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => {
            const dateValue = e.target.value;
            // Only call onChange when the input matches yyyy-MM-dd
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
              const [year, month, day] = dateValue.split("-");
              // Use Date.UTC to ensure midnight UTC
              const parsedDate = new Date(
                Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)),
              );
              if (!isNaN(parsedDate.getTime())) {
                onChange(parsedDate.toISOString());
                return;
              }
            }
            // If cleared, propagate empty string
            if (dateValue === "") {
              onChange("");
            }
          }}
        />
      </div>
    );
  };
});

const mockIncomeSource: IncomeSource = {
  id: "1",
  userId: "user1",
  name: "Salary",
  amount: 5000,
  frequency: "monthly",
  startDate: new Date("2024-01-01"),
  notes: "Monthly salary",
  isActive: true,
};

describe("IncomeSourceForm", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getInputByLabel = (labelText: string) => {
    const label = screen.getByText(labelText);
    return label.parentElement?.querySelector("input, textarea");
  };

  it("renders form fields correctly for new income source", () => {
    render(
      <IncomeSourceForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />,
    );

    expect(getInputByLabel("Name")).toBeInTheDocument();
    expect(getInputByLabel("Amount")).toBeInTheDocument();
    expect(getInputByLabel("Frequency")).toBeInTheDocument();
    expect(getInputByLabel("Start Date")).toBeInTheDocument();
    expect(getInputByLabel("Notes (Optional)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add income source/i }),
    ).toBeInTheDocument();
  });

  it("renders form with existing income source data", () => {
    render(
      <IncomeSourceForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        editingSource={mockIncomeSource}
      />,
    );

    expect(getInputByLabel("Name")).toHaveValue("Salary");
    expect(getInputByLabel("Amount")).toHaveValue("5,000");
    expect(getInputByLabel("Frequency")).toHaveAttribute(
      "placeholder",
      "Monthly",
    );
    expect(getInputByLabel("Notes (Optional)")).toHaveValue("Monthly salary");
    expect(
      screen.getByRole("button", { name: /update income source/i }),
    ).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(
      <IncomeSourceForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />,
    );

    const saveButton = screen.getByRole("button", {
      name: /add income source/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/amount must be a positive number/i),
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    render(
      <IncomeSourceForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />,
    );

    // Fill in form fields
    await user.type(getInputByLabel("Name")!, "New Job");
    await user.type(getInputByLabel("Amount")!, "6000");

    // Select frequency
    const frequencyInput = getInputByLabel("Frequency")!;
    await user.click(frequencyInput);
    await user.click(screen.getByText("Bi-weekly"));

    // Fill in dates - use a valid date format
    const startDateInput = getInputByLabel("Start Date")!;
    await user.clear(startDateInput);
    fireEvent.change(startDateInput, { target: { value: "2024-02-01" } });

    await user.type(getInputByLabel("Notes (Optional)")!, "New job notes");

    // Submit form
    await user.click(
      screen.getByRole("button", { name: /add income source/i }),
    );

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        name: "New Job",
        amount: "6000",
        frequency: "bi-weekly",
        notes: "New job notes",
        startDate: "2024-02-01T00:00:00.000Z",
        endDate: undefined,
      });
    });
  });

  it("disables form when isSubmitting is true", () => {
    render(
      <IncomeSourceForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />,
    );

    // Check if buttons are disabled
    expect(
      screen.getByRole("button", { name: /add income source/i }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  it("calls onClose when Cancel button is clicked", () => {
    render(
      <IncomeSourceForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("updates form values when editingSource changes", () => {
    const { rerender } = render(
      <IncomeSourceForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        editingSource={mockIncomeSource}
      />,
    );

    // Verify initial values are set correctly
    expect(getInputByLabel("Name")).toHaveValue("Salary");
    expect(getInputByLabel("Amount")).toHaveValue("5,000");

    // Create a different income source
    const differentIncomeSource: IncomeSource = {
      id: "2",
      userId: "user1",
      name: "Freelance",
      amount: 3000,
      frequency: "weekly",
      startDate: new Date("2024-02-01"),
      notes: "Freelance work",
      isActive: true,
    };

    // Rerender with different income source
    rerender(
      <IncomeSourceForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        editingSource={differentIncomeSource}
      />,
    );

    // Verify form values have been updated
    expect(getInputByLabel("Name")).toHaveValue("Freelance");
    expect(getInputByLabel("Amount")).toHaveValue("3,000");
    expect(getInputByLabel("Notes (Optional)")).toHaveValue("Freelance work");
  });
});
