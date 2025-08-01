import { fireEvent, render, screen } from "@testing-library/react";

import { format } from "date-fns";
import DateRangeSelector from "../DateRangeSelector";

describe("DateRangeSelector", () => {
  const mockOnDateRangeChange = jest.fn();
  const defaultProps = {
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
    onDateRangeChange: mockOnDateRangeChange,
  };

  beforeEach(() => {
    mockOnDateRangeChange.mockClear();
  });

  it("renders with correct initial dates", () => {
    render(<DateRangeSelector {...defaultProps} />);

    const startDateInput = screen.getByDisplayValue(
      format(defaultProps.startDate, "yyyy-MM-dd"),
    );
    const endDateInput = screen.getByDisplayValue(
      format(defaultProps.endDate, "yyyy-MM-dd"),
    );

    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();
  });

  it("calls onDateRangeChange when start date is changed", () => {
    render(<DateRangeSelector {...defaultProps} />);

    const startDateInput = screen.getByDisplayValue(
      format(defaultProps.startDate, "yyyy-MM-dd"),
    );
    const newDate = "2024-02-01";

    fireEvent.change(startDateInput, { target: { value: newDate } });

    expect(mockOnDateRangeChange).toHaveBeenCalledWith(
      new Date(newDate + "T12:00:00Z"),
      defaultProps.endDate,
    );
  });

  it("calls onDateRangeChange when end date is changed", () => {
    render(<DateRangeSelector {...defaultProps} />);

    const endDateInput = screen.getByDisplayValue(
      format(defaultProps.endDate, "yyyy-MM-dd"),
    );
    const newDate = "2024-02-28";

    fireEvent.change(endDateInput, { target: { value: newDate } });

    expect(mockOnDateRangeChange).toHaveBeenCalledWith(
      defaultProps.startDate,
      new Date(newDate + "T12:00:00Z"),
    );
  });

  it("handles invalid dates gracefully without calling onDateRangeChange", () => {
    render(<DateRangeSelector {...defaultProps} />);

    const startDateInput = screen.getByDisplayValue(
      format(defaultProps.startDate, "yyyy-MM-dd"),
    );

    // Test with empty string
    fireEvent.change(startDateInput, { target: { value: "" } });
    expect(mockOnDateRangeChange).not.toHaveBeenCalled();

    // Test with invalid date format
    fireEvent.change(startDateInput, { target: { value: "invalid-date" } });
    expect(mockOnDateRangeChange).not.toHaveBeenCalled();
  });

  it("displays help tooltip on hover", () => {
    render(<DateRangeSelector {...defaultProps} />);

    const helpButton = screen.getByText("Page Info");
    fireEvent.mouseEnter(helpButton);

    expect(screen.getByText("How to use this page:")).toBeInTheDocument();
    expect(screen.getByText("Select a date range")).toBeInTheDocument();
    expect(screen.getByText("Click on any category")).toBeInTheDocument();
    expect(screen.getByText("Use the view selector")).toBeInTheDocument();
  });

  it("maintains correct date format in inputs", () => {
    render(<DateRangeSelector {...defaultProps} />);

    const startDateInput = screen.getByDisplayValue(
      format(defaultProps.startDate, "yyyy-MM-dd"),
    );
    const endDateInput = screen.getByDisplayValue(
      format(defaultProps.endDate, "yyyy-MM-dd"),
    );

    expect(startDateInput).toHaveAttribute("type", "date");
    expect(endDateInput).toHaveAttribute("type", "date");
  });
});
