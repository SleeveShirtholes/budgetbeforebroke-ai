import { render, screen, fireEvent } from "@testing-library/react";
import MonthSelector from "../MonthSelector";

/**
 * Test suite for MonthSelector component
 * Tests month navigation, date formatting, and accessibility features
 */
describe("MonthSelector", () => {
  const defaultProps = {
    selectedDate: new Date(2024, 0, 1), // January 1, 2024
    onPreviousMonth: jest.fn(),
    onNextMonth: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the current month and year correctly", () => {
    render(<MonthSelector {...defaultProps} />);

    expect(screen.getByText("January 2024")).toBeInTheDocument();
  });

  it("calls onPreviousMonth when previous button is clicked", () => {
    render(<MonthSelector {...defaultProps} />);

    const previousButton = screen.getByLabelText("Previous month");
    fireEvent.click(previousButton);

    expect(defaultProps.onPreviousMonth).toHaveBeenCalledTimes(1);
  });

  it("calls onNextMonth when next button is clicked", () => {
    render(<MonthSelector {...defaultProps} />);

    const nextButton = screen.getByLabelText("Next month");
    fireEvent.click(nextButton);

    expect(defaultProps.onNextMonth).toHaveBeenCalledTimes(1);
  });

  it("displays correct month for different dates", () => {
    const decemberDate = new Date(2024, 11, 15); // December 15, 2024
    render(<MonthSelector {...defaultProps} selectedDate={decemberDate} />);

    expect(screen.getByText("December 2024")).toBeInTheDocument();
  });

  it("handles year transitions correctly", () => {
    const january2025 = new Date(2025, 0, 1); // January 1, 2025
    render(<MonthSelector {...defaultProps} selectedDate={january2025} />);

    expect(screen.getByText("January 2025")).toBeInTheDocument();
  });

  it("has proper accessibility labels", () => {
    render(<MonthSelector {...defaultProps} />);

    expect(screen.getByLabelText("Previous month")).toBeInTheDocument();
    expect(screen.getByLabelText("Next month")).toBeInTheDocument();
  });

  it("renders navigation buttons with correct styling", () => {
    render(<MonthSelector {...defaultProps} />);

    const previousButton = screen.getByLabelText("Previous month");
    const nextButton = screen.getByLabelText("Next month");

    expect(previousButton).toHaveClass("flex", "items-center");
    expect(nextButton).toHaveClass("flex", "items-center");
  });

  it("displays month in correct format", () => {
    const marchDate = new Date(2024, 2, 10); // March 10, 2024
    render(<MonthSelector {...defaultProps} selectedDate={marchDate} />);

    expect(screen.getByText("March 2024")).toBeInTheDocument();
  });

  it("handles edge case dates", () => {
    const edgeDate = new Date(2024, 0, 31); // January 31, 2024
    render(<MonthSelector {...defaultProps} selectedDate={edgeDate} />);

    expect(screen.getByText("January 2024")).toBeInTheDocument();
  });
});
