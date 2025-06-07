import { fireEvent, render, screen } from "@testing-library/react";

import CustomRadioGroup from "../CustomRadioGroup";

describe("CustomRadioGroup", () => {
  const defaultProps = {
    options: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3" },
    ],
    value: "option1",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all options correctly", () => {
    render(<CustomRadioGroup {...defaultProps} />);

    defaultProps.options.forEach((option) => {
      expect(screen.getByLabelText(option.label)).toBeInTheDocument();
    });
  });

  it("displays the label when provided", () => {
    const label = "Test Label";
    render(<CustomRadioGroup {...defaultProps} label={label} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("shows required indicator when required prop is true", () => {
    render(<CustomRadioGroup {...defaultProps} label="Test Label" required />);

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("calls onChange when an option is selected", () => {
    render(<CustomRadioGroup {...defaultProps} />);

    const option2 = screen.getByLabelText("Option 2");
    fireEvent.click(option2);

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      "option2",
      expect.any(Object),
    );
  });

  it("displays error message when error prop is provided", () => {
    const errorMessage = "This field is required";
    render(<CustomRadioGroup {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass("text-red-600");
  });

  it("displays helper text when helperText prop is provided", () => {
    const helperText = "Please select an option";
    render(<CustomRadioGroup {...defaultProps} helperText={helperText} />);

    expect(screen.getByText(helperText)).toBeInTheDocument();
    expect(screen.getByText(helperText)).toHaveClass("text-gray-500");
  });

  it("applies disabled state to all radio buttons when disabled prop is true", () => {
    render(<CustomRadioGroup {...defaultProps} disabled />);

    defaultProps.options.forEach((option) => {
      expect(screen.getByLabelText(option.label)).toBeDisabled();
    });
  });

  it("applies full width class when fullWidth prop is true", () => {
    const { container } = render(
      <CustomRadioGroup {...defaultProps} fullWidth />,
    );

    expect(container.firstChild).toHaveClass("w-full");
  });

  it("does not apply full width class when fullWidth prop is false", () => {
    const { container } = render(
      <CustomRadioGroup {...defaultProps} fullWidth={false} />,
    );

    expect(container.firstChild).not.toHaveClass("w-full");
  });

  it("applies correct ARIA attributes for accessibility", () => {
    const errorMessage = "This field is required";
    render(
      <CustomRadioGroup
        {...defaultProps}
        id="test-radio-group"
        error={errorMessage}
        helperText="Helper text"
      />,
    );

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveAttribute("aria-invalid", "true");
    expect(radioGroup).toHaveAttribute(
      "aria-errormessage",
      "test-radio-group-error",
    );
    expect(radioGroup).toHaveAttribute(
      "aria-describedby",
      "test-radio-group-description",
    );
  });
});
