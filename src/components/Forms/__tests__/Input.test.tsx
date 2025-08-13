import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../Input";

/**
 * Test suite for the Input component
 */
describe("Input", () => {
  /**
   * Test that the input renders with basic props
   */
  it("renders input with basic props", () => {
    render(<Input id="test-input" placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "test-input");
  });

  /**
   * Test that the label renders when provided
   */
  it("renders label when provided", () => {
    render(<Input id="test-input" label="Test Label" />);

    const label = screen.getByText("Test Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "test-input");
  });

  /**
   * Test that the input has correct default styling classes
   */
  it("has correct default styling classes", () => {
    render(<Input id="test-input" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass(
      "block",
      "w-full",
      "rounded-md",
      "border-0",
      "py-1.5",
      "px-3",
      "text-gray-900",
      "shadow-sm",
      "ring-1",
      "ring-inset",
      "ring-gray-300",
      "placeholder:text-gray-400",
      "focus:ring-2",
      "focus:ring-inset",
      "focus:ring-primary-500",
      "sm:text-sm",
      "sm:leading-6",
    );
  });

  /**
   * Test that error styling is applied when error is provided
   */
  it("applies error styling when error is provided", () => {
    render(<Input id="test-input" error="This is an error" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("ring-red-300", "focus:ring-red-500");
  });

  /**
   * Test that error message is displayed when error is provided
   */
  it("displays error message when error is provided", () => {
    render(<Input id="test-input" error="This is an error" />);

    const errorMessage = screen.getByText("This is an error");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("text-red-600");
  });

  /**
   * Test that left icon is rendered when provided
   */
  it("renders left icon when provided", () => {
    const leftIcon = <span data-testid="left-icon">🔍</span>;
    render(<Input id="test-input" leftIcon={leftIcon} />);

    const icon = screen.getByTestId("left-icon");
    expect(icon).toBeInTheDocument();
  });

  /**
   * Test that right icon is rendered when provided
   */
  it("renders right icon when provided", () => {
    const rightIcon = <span data-testid="right-icon">✓</span>;
    render(<Input id="test-input" rightIcon={rightIcon} />);

    const icon = screen.getByTestId("right-icon");
    expect(icon).toBeInTheDocument();
  });

  /**
   * Test that fullWidth prop applies correct styling
   */
  it("applies fullWidth styling when provided", () => {
    render(<Input id="test-input" fullWidth />);

    const container = screen.getByRole("textbox").parentElement?.parentElement;
    expect(container).toHaveClass("w-full");
  });

  /**
   * Test that input can receive and display user input
   */
  it("can receive and display user input", async () => {
    const user = userEvent.setup();
    render(<Input id="test-input" />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
  });

  /**
   * Test that input forwards ref correctly
   */
  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input id="test-input" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  /**
   * Test that custom className is merged correctly
   */
  it("merges custom className correctly", () => {
    render(<Input id="test-input" className="custom-class" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-class");
  });

  /**
   * Test that all HTML input attributes are passed through
   */
  it("passes through HTML input attributes", () => {
    render(
      <Input
        id="test-input"
        type="email"
        required
        disabled
        maxLength={100}
        data-testid="custom-input"
      />,
    );

    const input = screen.getByTestId("custom-input");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("disabled");
    expect(input).toHaveAttribute("maxLength", "100");
  });
});
