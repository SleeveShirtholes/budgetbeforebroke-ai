import { act, fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "../Toast";

import { ReactNode } from "react";

// Mock crypto.randomUUID
const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
global.crypto.randomUUID = () => mockUUID;

// Test component that uses the toast
const TestComponent = ({
  message = "Test message",
  type = "info",
  duration = 3000,
  position = "top-center",
}: {
  message?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  position?:
    | "top-center"
    | "top-left"
    | "top-right"
    | "bottom-center"
    | "bottom-left"
    | "bottom-right";
}) => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast(message, { type, duration, position })}>
      Show Toast
    </button>
  );
};

// Wrapper component for testing
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe("Toast Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders toast with default options", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByText("Show Toast"));

    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("border-blue-500");
  });

  it("renders toast with custom type", () => {
    render(
      <TestWrapper>
        <TestComponent type="success" />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByText("Show Toast"));

    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("border-green-500");
  });

  it("removes toast after duration", () => {
    render(
      <TestWrapper>
        <TestComponent duration={1000} />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByText("Show Toast"));
    expect(screen.getByText("Test message")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Test message")).not.toBeInTheDocument();
  });

  it("allows manual dismissal of toast", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByText("Show Toast"));
    expect(screen.getByText("Test message")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Test message")).not.toBeInTheDocument();
  });

  it("renders multiple toasts in correct positions", () => {
    render(
      <TestWrapper>
        <TestComponent position="top-left" message="Top Left" />
        <TestComponent position="bottom-right" message="Bottom Right" />
      </TestWrapper>,
    );

    fireEvent.click(screen.getAllByText("Show Toast")[0]);
    fireEvent.click(screen.getAllByText("Show Toast")[1]);

    expect(screen.getByText("Top Left")).toBeInTheDocument();
    expect(screen.getByText("Bottom Right")).toBeInTheDocument();
  });

  it("throws error when useToast is used outside provider", () => {
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useToast must be used within a ToastProvider");

    console.error = consoleError;
  });
});
