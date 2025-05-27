import { act, fireEvent, render, screen } from "@testing-library/react";

import ProfileInformation from "../ProfileInformation";

describe("ProfileInformation", () => {
  const mockProps = {
    name: "John Doe",
    email: "john@example.com",
    phoneNumber: "123-456-7890",
    isEditing: false,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    isLoading: false,
  };

  const editProps = {
    ...mockProps,
    isEditing: true,
    tempName: "Johnny Boy",
    tempPhoneNumber: "987-654-3210",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with all information in view mode", () => {
    render(<ProfileInformation {...mockProps} />);

    // Check if all labels are present
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Email Address")).toBeInTheDocument();
    expect(screen.getByText("Phone Number")).toBeInTheDocument();

    // Check if all values are rendered correctly
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123-456-7890")).toBeInTheDocument();
  });

  it("renders the component in edit mode", () => {
    render(<ProfileInformation {...editProps} />);

    // Check if fields are editable
    const nameInput = screen.getByPlaceholderText("Enter your full name");
    const phoneNumberInput = screen.getByPlaceholderText("Enter phone number");

    expect(nameInput).not.toBeDisabled();
    expect(phoneNumberInput).not.toBeDisabled();

    // Check if buttons are present
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it("handles input changes correctly", () => {
    render(<ProfileInformation {...editProps} />);

    // Test name change
    const nameInput = screen.getByPlaceholderText("Enter your full name");
    act(() => {
      fireEvent.change(nameInput, { target: { value: "New Name" } });
    });
    expect(nameInput).toHaveValue("New Name");

    // Test phone number change
    const phoneNumberInput = screen.getByPlaceholderText("Enter phone number");
    act(() => {
      fireEvent.change(phoneNumberInput, { target: { value: "987-654-3210" } });
    });
    expect(phoneNumberInput).toHaveValue("(987) 654-3210");
  });

  it("disables inputs when not in edit mode", () => {
    render(<ProfileInformation {...mockProps} />);

    const nameInput = screen.getByPlaceholderText("Enter your full name");
    const phoneNumberInput = screen.getByPlaceholderText("Enter phone number");

    expect(nameInput).toBeDisabled();
    expect(phoneNumberInput).toBeDisabled();
  });

  it("maintains the correct layout structure", () => {
    const { container } = render(<ProfileInformation {...mockProps} />);

    // Check if all sections are present
    const sections = container.querySelectorAll(".space-y-4 > div");
    expect(sections).toHaveLength(3);

    // Check if icons are present
    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(3);

    // Check if form structure is correct
    expect(container.querySelector("form")).toBeInTheDocument();
    expect(container.querySelector(".space-y-4")).toBeInTheDocument();
  });
});
