import { fireEvent, render, screen } from "@testing-library/react";

import MerchantModal from "../MerchantModal";

describe("MerchantModal", () => {
  const baseProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    form: {
      name: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
    },
    setForm: jest.fn(),
    mode: "add" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders add mode", () => {
    render(<MerchantModal {...baseProps} mode="add" />);
    expect(screen.getByText("Add New Merchant")).toBeInTheDocument();
    expect(screen.getByText("Add Merchant")).toBeInTheDocument();
    expect(screen.getByText("Merchant Name")).toBeInTheDocument();
    expect(screen.getByText("Street Address")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("State")).toBeInTheDocument();
    expect(screen.getByText("ZIP Code")).toBeInTheDocument();
  });

  it("renders edit mode", () => {
    render(
      <MerchantModal
        {...baseProps}
        mode="edit"
        form={{
          name: "Test Merchant",
          streetAddress: "123 Main St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
        }}
      />,
    );
    expect(screen.getByText("Edit Merchant")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Merchant")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test City")).toBeInTheDocument();
    expect(screen.getByDisplayValue("TS")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12345")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    render(<MerchantModal {...baseProps} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSave when form is submitted", () => {
    render(<MerchantModal {...baseProps} />);
    const submitButton = screen.getByText("Add Merchant");
    fireEvent.click(submitButton);
    expect(baseProps.onSave).toHaveBeenCalledTimes(1);
  });

  it("updates form state when input values change", async () => {
    render(<MerchantModal {...baseProps} />);

    const nameInput = screen.getByPlaceholderText("Enter merchant name");
    fireEvent.change(nameInput, { target: { value: "New Merchant" } });
    expect(baseProps.setForm).toHaveBeenCalledWith({
      ...baseProps.form,
      name: "New Merchant",
    });

    const addressInput = screen.getByPlaceholderText("Enter street address");
    fireEvent.change(addressInput, { target: { value: "456 New St" } });
    expect(baseProps.setForm).toHaveBeenCalledWith({
      ...baseProps.form,
      streetAddress: "456 New St",
    });

    const cityInput = screen.getByPlaceholderText("Enter city");
    fireEvent.change(cityInput, { target: { value: "New City" } });
    expect(baseProps.setForm).toHaveBeenCalledWith({
      ...baseProps.form,
      city: "New City",
    });

    const stateInput = screen.getByPlaceholderText("Enter state");
    fireEvent.change(stateInput, { target: { value: "NC" } });
    expect(baseProps.setForm).toHaveBeenCalledWith({
      ...baseProps.form,
      state: "NC",
    });

    const zipInput = screen.getByPlaceholderText("Enter ZIP code");
    fireEvent.change(zipInput, { target: { value: "54321" } });
    expect(baseProps.setForm).toHaveBeenCalledWith({
      ...baseProps.form,
      zipCode: "54321",
    });
  });
});
