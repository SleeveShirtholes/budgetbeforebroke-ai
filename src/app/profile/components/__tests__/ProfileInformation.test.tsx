import { fireEvent, render, screen } from "@testing-library/react";

import ProfileInformation from "../ProfileInformation";

describe("ProfileInformation", () => {
  const mockProps = {
    name: "John Doe",
    email: "john@example.com",
    phoneNumber: "123-456-7890",
    preferredName: "Johnny",
    isEditing: false,
    tempPhoneNumber: "",
    tempPreferredName: "",
    onPhoneNumberChange: jest.fn(),
    onPreferredNameChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with all information in view mode", () => {
    render(<ProfileInformation {...mockProps} />);

    // Check if all labels are present
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Email Address")).toBeInTheDocument();
    expect(screen.getByText("Preferred Name")).toBeInTheDocument();
    expect(screen.getByText("Phone Number")).toBeInTheDocument();

    // Check if all values are rendered correctly
    expect(screen.getByText(mockProps.name)).toBeInTheDocument();
    expect(screen.getByText(mockProps.email)).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(mockProps.preferredName),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProps.phoneNumber)).toBeInTheDocument();
  });

  it("renders the component in edit mode", () => {
    const editProps = {
      ...mockProps,
      isEditing: true,
      tempPhoneNumber: "987-654-3210",
      tempPreferredName: "Johnny Boy",
    };

    render(<ProfileInformation {...editProps} />);

    // Check if fields are editable
    const preferredNameInput = screen.getByDisplayValue(
      editProps.tempPreferredName,
    );
    const phoneNumberInput = screen.getByDisplayValue(
      editProps.tempPhoneNumber,
    );

    expect(preferredNameInput).not.toBeDisabled();
    expect(phoneNumberInput).not.toBeDisabled();
  });

  it("handles input changes correctly", () => {
    const editProps = {
      ...mockProps,
      isEditing: true,
    };

    render(<ProfileInformation {...editProps} />);

    // Test preferred name change
    const preferredNameInput = screen.getByPlaceholderText(
      "Enter your preferred name",
    );
    fireEvent.change(preferredNameInput, { target: { value: "New Name" } });
    expect(editProps.onPreferredNameChange).toHaveBeenCalledWith("New Name");

    // Test phone number change
    const phoneNumberInput = screen.getByPlaceholderText("Enter phone number");
    fireEvent.change(phoneNumberInput, { target: { value: "555-555-5555" } });
    expect(editProps.onPhoneNumberChange).toHaveBeenCalledWith("555-555-5555");
  });

  it("disables inputs when not in edit mode", () => {
    render(<ProfileInformation {...mockProps} />);

    const preferredNameInput = screen.getByPlaceholderText(
      "Enter your preferred name",
    );
    const phoneNumberInput = screen.getByPlaceholderText("Enter phone number");

    expect(preferredNameInput).toBeDisabled();
    expect(phoneNumberInput).toBeDisabled();
    expect(preferredNameInput).toHaveClass("bg-secondary-50");
    expect(phoneNumberInput).toHaveClass("bg-secondary-50");
  });

  it("maintains the correct layout structure", () => {
    const { container } = render(<ProfileInformation {...mockProps} />);

    // Check if all sections are present
    const sections = container.querySelectorAll(".space-y-4 > div");
    expect(sections).toHaveLength(4);

    // Check if icons are present
    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(4);
  });
});
