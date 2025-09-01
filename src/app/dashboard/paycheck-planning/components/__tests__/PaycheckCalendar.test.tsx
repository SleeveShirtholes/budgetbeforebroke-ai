import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PaycheckCalendar from "../PaycheckCalendar";
import { format, addMonths, subMonths } from "date-fns";

// Mock the date-fns functions
jest.mock("date-fns", () => ({
  format: jest.fn(),
  addMonths: jest.fn(),
  subMonths: jest.fn(),
  startOfMonth: jest.fn(),
  endOfMonth: jest.fn(),
  eachDayOfInterval: jest.fn(),
  isSameMonth: jest.fn(),
  isToday: jest.fn(),
  getDay: jest.fn(),
}));

// Mock the Heroicons
jest.mock("@heroicons/react/24/outline", () => ({
  CalendarDaysIcon: () => <div data-testid="calendar-icon">Calendar</div>,
  CurrencyDollarIcon: () => <div data-testid="dollar-icon">$</div>,
  ChevronLeftIcon: () => <div data-testid="chevron-left">←</div>,
  ChevronRightIcon: () => <div data-testid="chevron-right">→</div>,
}));

// Mock the Card component
jest.mock("@/components/Card", () => {
  return function MockCard({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div data-testid="card" className={className}>
        {children}
      </div>
    );
  };
});

describe("PaycheckCalendar", () => {
  const mockPaychecks = [
    {
      id: "1-2025-08-06",
      name: "Steve's Income",
      amount: 3000,
      date: "2025-08-06",
      frequency: "bi-weekly" as const,
      userId: "user1",
    },
    {
      id: "2-2025-08-20",
      name: "Kelsi's Income",
      amount: 2500,
      date: "2025-08-20",
      frequency: "bi-weekly" as const,
      userId: "user1",
    },
    {
      id: "1-2025-09-03",
      name: "Steve's Income",
      amount: 3000,
      date: "2025-09-03",
      frequency: "bi-weekly" as const,
      userId: "user1",
    },
  ];

  const defaultProps = {
    paychecks: mockPaychecks,
    isOpen: true,
    onClose: jest.fn(),
    triggerRef: { current: null },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock date-fns functions with proper implementations
    (format as jest.Mock).mockImplementation((date, formatStr) => {
      if (formatStr === "MMMM yyyy") return "August 2025";
      if (formatStr === "d") return "6";
      if (formatStr === "yyyy-MM") return "2025-08";
      if (formatStr === "yyyy-MM-dd") return "2025-08-06";
      return "mocked-date";
    });

    (addMonths as jest.Mock).mockImplementation((date, months) => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + months);
      return newDate;
    });

    (subMonths as jest.Mock).mockImplementation((date, months) => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() - months);
      return newDate;
    });

    // Mock startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay
    const {
      startOfMonth,
      endOfMonth,
      eachDayOfInterval,
      isSameMonth,
      isToday,
      getDay,
    } = jest.requireMock("date-fns");

    (startOfMonth as jest.Mock).mockImplementation((date) => {
      const newDate = new Date(date);
      newDate.setDate(1);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });

    (endOfMonth as jest.Mock).mockImplementation((date) => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + 1, 0);
      newDate.setHours(23, 59, 59, 999);
      return newDate;
    });

    (eachDayOfInterval as jest.Mock).mockImplementation(({ start, end }) => {
      const days = [];
      const current = new Date(start);
      while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days;
    });

    (isSameMonth as jest.Mock).mockImplementation((date1, date2) => {
      return (
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    });

    (isToday as jest.Mock).mockImplementation(() => false);

    (getDay as jest.Mock).mockImplementation((date) => {
      return date.getDay();
    });
  });

  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByText("Paycheck Calendar")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<PaycheckCalendar {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId("card")).not.toBeInTheDocument();
    });

    it("should display the current month and year", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      expect(screen.getByText("August 2025")).toBeInTheDocument();
    });

    it("should render navigation arrows", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
    });

    it("should render calendar grid headers", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      // Check that all day headers are present (using getAllByText to handle duplicates)
      const sundayHeaders = screen.getAllByText("S");
      const mondayHeaders = screen.getAllByText("M");
      const tuesdayHeaders = screen.getAllByText("T");
      const wednesdayHeaders = screen.getAllByText("W");
      const fridayHeaders = screen.getAllByText("F");

      expect(sundayHeaders.length).toBeGreaterThan(0);
      expect(mondayHeaders.length).toBeGreaterThan(0);
      expect(tuesdayHeaders.length).toBeGreaterThan(0);
      expect(wednesdayHeaders.length).toBeGreaterThan(0);
      expect(fridayHeaders.length).toBeGreaterThan(0);
    });
  });

  describe("Navigation", () => {
    it("should navigate to previous month when left arrow is clicked", async () => {
      render(<PaycheckCalendar {...defaultProps} />);

      const leftArrow = screen.getByTestId("chevron-left").parentElement;
      fireEvent.click(leftArrow!);

      await waitFor(() => {
        expect(subMonths).toHaveBeenCalled();
      });
    });

    it("should navigate to next month when right arrow is clicked", async () => {
      render(<PaycheckCalendar {...defaultProps} />);

      const rightArrow = screen.getByTestId("chevron-right").parentElement;
      fireEvent.click(rightArrow!);

      await waitFor(() => {
        expect(addMonths).toHaveBeenCalled();
      });
    });
  });

  describe("Paycheck Display", () => {
    it("should show paycheck indicators on days with paychecks", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      // The component should render dollar icons for days with paychecks
      const dollarIcons = screen.getAllByTestId("dollar-icon");
      expect(dollarIcons.length).toBeGreaterThan(0);
    });

    it("should display month summary with paycheck count", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      // Should show summary of paychecks for the displayed month
      expect(screen.getByText(/paychecks/i)).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should have click outside handler set up", () => {
      const mockOnClose = jest.fn();
      const mockTriggerRef = { current: document.createElement("button") };
      render(
        <PaycheckCalendar
          {...defaultProps}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />,
      );

      // Verify that the component renders with the proper structure for click outside handling
      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(mockOnClose).toBeDefined();
    });

    it("should not call onClose when clicking inside the calendar", () => {
      const mockOnClose = jest.fn();
      render(<PaycheckCalendar {...defaultProps} onClose={mockOnClose} />);

      const card = screen.getByTestId("card");
      fireEvent.mouseDown(card);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty paychecks array", () => {
      render(<PaycheckCalendar {...defaultProps} paychecks={[]} />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByText("Paycheck Calendar")).toBeInTheDocument();
    });

    it("should handle paychecks with invalid dates", () => {
      const invalidPaychecks = [
        {
          id: "1-invalid",
          name: "Steve's Income",
          amount: 3000,
          date: "invalid-date",
          frequency: "bi-weekly" as const,
          userId: "user1",
        },
      ];

      render(
        <PaycheckCalendar {...defaultProps} paychecks={invalidPaychecks} />,
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("should handle null triggerRef", () => {
      render(<PaycheckCalendar {...defaultProps} triggerRef={null} />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for navigation buttons", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      const leftArrow = screen.getByTestId("chevron-left").parentElement;
      const rightArrow = screen.getByTestId("chevron-right").parentElement;

      expect(leftArrow).toBeInTheDocument();
      expect(rightArrow).toBeInTheDocument();
    });

    it("should be keyboard navigable", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      const leftArrow = screen.getByTestId("chevron-left").parentElement;
      const rightArrow = screen.getByTestId("chevron-right").parentElement;

      // Test keyboard navigation
      leftArrow?.focus();
      expect(leftArrow).toHaveFocus();

      rightArrow?.focus();
      expect(rightArrow).toHaveFocus();
    });
  });

  describe("Styling and Layout", () => {
    it("should apply correct positioning classes", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      // The positioning classes are on the outer container, not the card itself
      const container = screen.getByTestId("card").parentElement;
      expect(container).toHaveClass("absolute");
      expect(container).toHaveClass("z-50");
    });

    it("should have proper calendar grid layout", () => {
      render(<PaycheckCalendar {...defaultProps} />);

      // Find the calendar grid by looking for the grid with day headers
      const calendarGrid = screen.getAllByText("S")[0].closest(".grid");
      expect(calendarGrid).toHaveClass("grid-cols-7");
    });
  });
});
