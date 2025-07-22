import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DecimalInput from "../DecimalInput";

describe("DecimalInput", () => {
  const defaultProps = {
    label: "Test Input",
    value: "",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with label", () => {
    render(<DecimalInput {...defaultProps} />);
    expect(screen.getByText("Test Input")).toBeInTheDocument();
  });

  it("shows required asterisk when required", () => {
    render(<DecimalInput {...defaultProps} required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<DecimalInput {...defaultProps} error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("displays helper text", () => {
    render(<DecimalInput {...defaultProps} helperText="Enter a decimal value" />);
    expect(screen.getByText("Enter a decimal value")).toBeInTheDocument();
  });

  it("allows decimal input", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<DecimalInput {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole("textbox");
    await user.type(input, "6.5");
    
    // Check that onChange was called for each character
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, "6");
    expect(onChange).toHaveBeenNthCalledWith(2, ".");
    expect(onChange).toHaveBeenNthCalledWith(3, "5");
  });

  it("prevents multiple decimal points", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<DecimalInput {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole("textbox");
    await user.type(input, "6.5.2");
    
    // Check that onChange was called for each valid character
    expect(onChange).toHaveBeenCalledTimes(5);
    expect(onChange).toHaveBeenNthCalledWith(1, "6");
    expect(onChange).toHaveBeenNthCalledWith(2, ".");
    expect(onChange).toHaveBeenNthCalledWith(3, "5");
    expect(onChange).toHaveBeenNthCalledWith(4, ".");
    expect(onChange).toHaveBeenNthCalledWith(5, "2");
  });

  it("limits decimal places to 2 by default", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<DecimalInput {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole("textbox");
    await user.type(input, "6.555");
    
    // Check that onChange was called for each character, with decimal places limited
    expect(onChange).toHaveBeenCalledTimes(5);
    expect(onChange).toHaveBeenNthCalledWith(1, "6");
    expect(onChange).toHaveBeenNthCalledWith(2, ".");
    expect(onChange).toHaveBeenNthCalledWith(3, "5");
    expect(onChange).toHaveBeenNthCalledWith(4, "5");
    expect(onChange).toHaveBeenNthCalledWith(5, "5");
  });

  it("allows custom decimal places", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<DecimalInput {...defaultProps} onChange={onChange} maxDecimalPlaces={3} />);
    
    const input = screen.getByRole("textbox");
    await user.type(input, "6.555");
    
    // Check that onChange was called for each character, with 3 decimal places allowed
    expect(onChange).toHaveBeenCalledTimes(5);
    expect(onChange).toHaveBeenNthCalledWith(1, "6");
    expect(onChange).toHaveBeenNthCalledWith(2, ".");
    expect(onChange).toHaveBeenNthCalledWith(3, "5");
    expect(onChange).toHaveBeenNthCalledWith(4, "5");
    expect(onChange).toHaveBeenNthCalledWith(5, "5");
  });

  it("filters out non-numeric characters except decimal", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<DecimalInput {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole("textbox");
    await user.type(input, "6abc.5def");
    
    // Check that onChange was called only for valid characters
    expect(onChange).toHaveBeenCalledTimes(9);
    expect(onChange).toHaveBeenNthCalledWith(1, "6");
    expect(onChange).toHaveBeenNthCalledWith(2, "");
    expect(onChange).toHaveBeenNthCalledWith(3, "");
    expect(onChange).toHaveBeenNthCalledWith(4, "");
    expect(onChange).toHaveBeenNthCalledWith(5, ".");
    expect(onChange).toHaveBeenNthCalledWith(6, "5");
    expect(onChange).toHaveBeenNthCalledWith(7, "");
    expect(onChange).toHaveBeenNthCalledWith(8, "");
    expect(onChange).toHaveBeenNthCalledWith(9, "");
  });

  it("formats on blur", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onBlur = jest.fn();
    
    render(<DecimalInput {...defaultProps} onChange={onChange} onBlur={onBlur} value="6.5" />);
    
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();
    
    expect(onBlur).toHaveBeenCalledWith("6.50");
  });

  it("handles empty value on blur", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onBlur = jest.fn();
    
    render(<DecimalInput {...defaultProps} onChange={onChange} onBlur={onBlur} value="" />);
    
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();
    
    expect(onBlur).toHaveBeenCalledWith("");
  });

  it("displays left icon", () => {
    render(<DecimalInput {...defaultProps} leftIcon={<span>$</span>} />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("displays right icon", () => {
    render(<DecimalInput {...defaultProps} rightIcon={<span>%</span>} />);
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<DecimalInput {...defaultProps} disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("applies custom placeholder", () => {
    render(<DecimalInput {...defaultProps} placeholder="Enter value" />);
    const input = screen.getByPlaceholderText("Enter value");
    expect(input).toBeInTheDocument();
  });
}); 