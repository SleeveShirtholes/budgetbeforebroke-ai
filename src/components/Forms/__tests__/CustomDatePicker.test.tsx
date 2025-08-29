import { render, screen } from "@testing-library/react";
import CustomDatePicker from "../CustomDatePicker";

describe("CustomDatePicker", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with label", () => {
    render(
      <CustomDatePicker label="Start Date" value="" onChange={mockOnChange} />,
    );

    expect(screen.getByText("Start Date")).toBeInTheDocument();
  });

  it("displays date string correctly without timezone conversion", () => {
    // Test with a date string that could cause timezone issues
    const dateString = "2025-08-21";

    render(
      <CustomDatePicker
        label="Start Date"
        value={dateString}
        onChange={mockOnChange}
      />,
    );

    // The input should show "Aug 21, 2025" without timezone conversion
    expect(screen.getByDisplayValue("Aug 21, 2025")).toBeInTheDocument();
  });

  it("displays empty input when no value is provided", () => {
    render(
      <CustomDatePicker label="Start Date" value="" onChange={mockOnChange} />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("");
  });

  it("displays date in correct format for different dates", () => {
    const testCases = [
      { input: "2025-01-01", expected: "Jan 1, 2025" },
      { input: "2025-12-25", expected: "Dec 25, 2025" },
      { input: "2024-06-15", expected: "Jun 15, 2024" },
    ];

    testCases.forEach(({ input, expected }) => {
      const { unmount } = render(
        <CustomDatePicker
          label="Start Date"
          value={input}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByDisplayValue(expected)).toBeInTheDocument();
      unmount();
    });
  });
});
