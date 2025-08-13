import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import CreateAccountModal from "./CreateAccountModal";

describe("CreateAccountModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal when isOpen is true", () => {
    render(
      <CreateAccountModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    expect(screen.getByText("Create New Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Account Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description (Optional)")).toBeInTheDocument();
  });

  it("does not render modal when isOpen is false", () => {
    render(
      <CreateAccountModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    expect(screen.queryByText("Create New Account")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    render(
      <CreateAccountModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("validates required name field", async () => {
    render(
      <CreateAccountModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const createButton = screen.getByText("Create");
    await userEvent.click(createButton);

    expect(screen.getByText("Account name is required")).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    render(
      <CreateAccountModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const nameInput = screen.getByLabelText("Account Name");
    const descriptionInput = screen.getByLabelText("Description (Optional)");
    const createButton = screen.getByText("Create");

    await userEvent.type(nameInput, "Test Account");
    await userEvent.type(descriptionInput, "Test Description");
    await userEvent.click(createButton);

    expect(mockOnSave).toHaveBeenCalledWith("Test Account", "Test Description");
  });

  it("submits form with only required fields", async () => {
    render(
      <CreateAccountModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const nameInput = screen.getByLabelText("Account Name");
    const createButton = screen.getByText("Create");

    await userEvent.type(nameInput, "Test Account");
    await userEvent.click(createButton);

    expect(mockOnSave).toHaveBeenCalledWith("Test Account", null);
  });
});
