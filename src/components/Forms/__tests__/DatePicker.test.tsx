import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import DatePicker from "../DatePicker";

describe("DatePicker", () => {
  const defaultProps = {
    label: "Test Date",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with required label and input", () => {
    render(<DatePicker {...defaultProps} required />);

    const label = screen.getByText("Test Date");
    expect(label).toBeInTheDocument();

    const requiredAsterisk = screen.getByText("*");
    expect(requiredAsterisk).toBeInTheDocument();
    expect(requiredAsterisk).toHaveClass("text-destructive");

    const input = screen.getByRole("textbox", { name: "Test Date" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "date");
    expect(input).toBeRequired();
  });

  it("renders with helper text", () => {
    const helperText = "Please select a date";
    render(<DatePicker {...defaultProps} helperText={helperText} />);

    expect(screen.getByText(helperText)).toBeInTheDocument();
    expect(screen.getByText(helperText)).toHaveClass("text-muted-foreground");
  });

  it("renders with error state", () => {
    const errorMessage = "Date is required";
    render(<DatePicker {...defaultProps} error={errorMessage} />);

    const input = screen.getByRole("textbox", { name: "Test Date" });
    const error = screen.getByText(errorMessage);

    expect(error).toBeInTheDocument();
    expect(error).toHaveClass("text-destructive");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("border-destructive");
  });

  it("handles date changes correctly", async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);

    const input = screen.getByRole("textbox", { name: "Test Date" });
    const testDate = "2024-03-20";

    await user.type(input, testDate);

    expect(defaultProps.onChange).toHaveBeenCalled();
    expect(input).toHaveValue(testDate);
  });

  it("applies custom className to wrapper", () => {
    const customClass = "custom-class";
    render(<DatePicker {...defaultProps} className={customClass} />);

    const wrapper = screen.getByRole("textbox", {
      name: "Test Date",
    }).parentElement;
    expect(wrapper).toHaveClass(customClass);
  });

  it("handles disabled state correctly", () => {
    render(<DatePicker {...defaultProps} disabled />);

    const input = screen.getByRole("textbox", { name: "Test Date" });
    expect(input).toBeDisabled();
    expect(input).toHaveClass(
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    );
  });

  it("generates proper id from label when not provided", () => {
    render(<DatePicker {...defaultProps} />);

    const input = screen.getByRole("textbox", { name: "Test Date" });
    expect(input).toHaveAttribute("id", "test-date");
  });

  it("uses provided id when available", () => {
    const customId = "custom-date-picker";
    render(<DatePicker {...defaultProps} id={customId} />);

    const input = screen.getByRole("textbox", { name: "Test Date" });
    expect(input).toHaveAttribute("id", customId);
  });
});
