import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import TextArea from "../TextArea";

describe("TextArea", () => {
  it("renders with label and textarea", () => {
    render(<TextArea label="Description" id="description" />);
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("handles text input changes", async () => {
    const handleChange = jest.fn();
    render(
      <TextArea label="Description" id="description" onChange={handleChange} />,
    );

    const textarea = screen.getByLabelText("Description");
    await userEvent.type(textarea, "Test description");

    expect(handleChange).toHaveBeenCalledTimes(16); // Once for each character
    expect(textarea).toHaveValue("Test description");
  });

  it("displays error message and correct styling", () => {
    render(
      <TextArea
        label="Description"
        id="description"
        error="This field is required"
      />,
    );

    const textarea = screen.getByLabelText("Description");
    const errorMessage = screen.getByText("This field is required");

    expect(errorMessage).toBeInTheDocument();
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute(
      "aria-describedby",
      "description-description",
    );
    expect(textarea.className).toContain("ring-red-300");
    expect(textarea.className).toContain("focus:ring-red-500");
    expect(errorMessage.className).toContain("text-red-600");
  });

  it("displays helper text with correct styling", () => {
    render(
      <TextArea
        label="Description"
        id="description"
        helperText="Maximum 500 characters"
      />,
    );

    const textarea = screen.getByLabelText("Description");
    const helperText = screen.getByText("Maximum 500 characters");

    expect(helperText).toBeInTheDocument();
    expect(textarea).toHaveAttribute(
      "aria-describedby",
      "description-description",
    );
    expect(helperText.className).toContain("text-gray-500");
  });

  it("shows required indicator when required prop is true", () => {
    render(<TextArea label="Description" id="description" required />);

    const label = screen.getByText("*");
    expect(label).toBeInTheDocument();
    expect(label.className).toContain("text-red-500");
  });

  it("applies custom className correctly", () => {
    render(
      <TextArea
        label="Description"
        id="description"
        className="custom-class"
      />,
    );

    const textarea = screen.getByLabelText("Description");
    expect(textarea.className).toContain("custom-class");
  });

  it("handles disabled state correctly", () => {
    render(<TextArea label="Description" id="description" disabled />);

    const textarea = screen.getByLabelText("Description");
    expect(textarea).toBeDisabled();
  });

  it("handles fullWidth prop correctly", () => {
    const { container } = render(
      <TextArea label="Description" id="description" fullWidth={false} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain("w-full");
  });

  it("applies custom number of rows", () => {
    render(<TextArea label="Description" id="description" rows={5} />);

    const textarea = screen.getByLabelText("Description");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("defaults to 3 rows when rows prop is not provided", () => {
    render(<TextArea label="Description" id="description" />);

    const textarea = screen.getByLabelText("Description");
    expect(textarea).toHaveAttribute("rows", "3");
  });
});
