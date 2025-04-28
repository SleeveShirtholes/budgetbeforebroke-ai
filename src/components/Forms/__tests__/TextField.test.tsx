import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import TextField from "../TextField";

describe("TextField", () => {
  it("renders with label and input", () => {
    render(<TextField label="Name" id="name" />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("handles input changes", async () => {
    const handleChange = jest.fn();
    render(<TextField label="Name" id="name" onChange={handleChange} />);

    const input = screen.getByLabelText("Name");
    await userEvent.type(input, "John");

    expect(handleChange).toHaveBeenCalledTimes(4); // Once for each character
    expect(input).toHaveValue("John");
  });

  it("displays error message and correct styling", () => {
    render(<TextField label="Name" id="name" error="This field is required" />);

    const input = screen.getByLabelText("Name");
    const errorMessage = screen.getByText("This field is required");

    expect(errorMessage).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "name-description");
    expect(input.className).toContain("ring-red-300");
    expect(input.className).toContain("focus:ring-red-500");
  });

  it("displays helper text with correct styling", () => {
    render(
      <TextField label="Name" id="name" helperText="Enter your full name" />,
    );

    const input = screen.getByLabelText("Name");
    const helperText = screen.getByText("Enter your full name");

    expect(helperText).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-describedby", "name-description");
    expect(helperText.className).toContain("text-gray-500");
  });

  it("renders with start adornment", () => {
    const startAdornment = <span>$</span>;
    render(
      <TextField label="Amount" id="amount" startAdornment={startAdornment} />,
    );

    expect(screen.getByText("$")).toBeInTheDocument();
    const input = screen.getByLabelText("Amount");
    expect(input.className).toContain("pl-7");
  });

  it("renders with end adornment", () => {
    const endAdornment = <span>kg</span>;
    render(
      <TextField label="Weight" id="weight" endAdornment={endAdornment} />,
    );

    expect(screen.getByText("kg")).toBeInTheDocument();
    const input = screen.getByLabelText("Weight");
    expect(input.className).toContain("pr-10");
  });

  it("shows required indicator when required prop is true", () => {
    render(<TextField label="Username" id="username" required />);

    const label = screen.getByText("*");
    expect(label).toBeInTheDocument();
    expect(label.className).toContain("text-red-500");
  });

  it("applies custom className correctly", () => {
    render(<TextField label="Name" id="name" className="custom-class" />);

    const input = screen.getByLabelText("Name");
    expect(input.className).toContain("custom-class");
  });

  it("handles disabled state correctly", () => {
    render(<TextField label="Name" id="name" disabled />);

    const input = screen.getByLabelText("Name");
    expect(input).toBeDisabled();
  });

  it("handles fullWidth prop correctly", () => {
    const { container } = render(
      <TextField label="Name" id="name" fullWidth={false} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain("w-full");
  });
});
