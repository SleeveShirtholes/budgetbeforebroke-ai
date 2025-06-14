import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { BudgetOverview } from "../BudgetOverview";

describe("BudgetOverview", () => {
  it("renders all three cards with correct values", () => {
    render(
      <BudgetOverview
        totalBudget={2000}
        totalBudgeted={1500}
        remainingBudget={500}
      />,
    );

    // Check total budget card
    expect(screen.getByText("Total Budget")).toBeInTheDocument();
    expect(screen.getByText("$2,000.00")).toBeInTheDocument();

    // Check budgeted amount card
    expect(screen.getByText("Budgeted Amount")).toBeInTheDocument();
    expect(screen.getByText("$1,500.00")).toBeInTheDocument();

    // Check remaining budget card
    expect(screen.getByText("Remaining to Budget")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
  });

  it("displays negative numbers with minus signs", () => {
    render(
      <BudgetOverview
        totalBudget={-2000}
        totalBudgeted={-1500}
        remainingBudget={-500}
      />,
    );

    expect(screen.getByText("-$2,000.00")).toBeInTheDocument();
    expect(screen.getByText("-$1,500.00")).toBeInTheDocument();
    expect(screen.getByText("-$500.00")).toBeInTheDocument();
  });

  it("shows positive remaining budget in green", () => {
    render(
      <BudgetOverview
        totalBudget={2000}
        totalBudgeted={1500}
        remainingBudget={500}
      />,
    );
    const remainingText = screen.getByText("$500.00");
    expect(remainingText).toHaveClass("text-green-600");
  });

  it("shows negative remaining budget in red", () => {
    render(
      <BudgetOverview
        totalBudget={2000}
        totalBudgeted={2500}
        remainingBudget={-500}
      />,
    );
    const remainingText = screen.getByText("-$500.00");
    expect(remainingText).toHaveClass("text-red-600");

    // Get the last icon (remaining budget icon)
    const icons = screen.getAllByTestId("icon");
    const remainingIcon = icons[2];
    expect(remainingIcon).toHaveClass("text-red-600");
    expect(remainingIcon.parentElement).toHaveClass("bg-red-50");
  });

  it("renders correct icons", () => {
    render(
      <BudgetOverview
        totalBudget={2000}
        totalBudgeted={1500}
        remainingBudget={500}
      />,
    );
    const icons = screen.getAllByTestId("icon");
    expect(icons).toHaveLength(3);
    icons.forEach((icon) => {
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("allows editing and saving the total budget", async () => {
    const onEditClick = jest.fn();
    const onSave = jest.fn();
    const onTotalBudgetChange = jest.fn();
    render(
      <BudgetOverview
        totalBudget={2000}
        totalBudgeted={1500}
        remainingBudget={500}
        isEditing={true}
        totalBudgetInput={"2500"}
        isUpdating={false}
        onEditClick={onEditClick}
        onSave={onSave}
        onCancel={jest.fn()}
        onTotalBudgetChange={onTotalBudgetChange}
      />,
    );

    // The input should be present
    const input = screen.getByLabelText("");
    expect(input).toBeInTheDocument();
    // Simulate changing the value
    await userEvent.clear(input);
    await userEvent.type(input, "3000");
    expect(onTotalBudgetChange).toHaveBeenCalled();
    // Simulate clicking Save
    const saveButton = screen.getByText("Save");
    await userEvent.click(saveButton);
    expect(onSave).toHaveBeenCalled();
  });
});
