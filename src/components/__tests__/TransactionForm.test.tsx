import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Transaction } from "@/types/transaction";
import userEvent from "@testing-library/user-event";
import TransactionForm from "../TransactionForm";

/**
 * Test Suite for TransactionForm Component
 *
 * This suite comprehensively tests the TransactionForm component functionality including:
 *
 * 1. Rendering
 *    - All form fields presence
 *    - Required field indicators
 *    - Initial values
 * 2. User Interactions
 *    - Input field updates
 *    - Date picker functionality
 *    - Category selection
 * 3. Form Submission
 *    - Valid data submission
 *    - Required field validation
 * 4. Initial Data Population
 *    - Form population with existing transaction data
 */

// Mock date for consistent testing
const mockDate = "2024-03-26T00:00:00.000Z";
const originalDate = new Date(mockDate);

// Sample transaction data for testing
const sampleTransaction: Transaction = {
    id: "123",
    date: mockDate,
    merchant: "Test Store",
    merchantLocation: "Test Location",
    amount: 42.99,
    type: "expense",
    category: "Personal",
    description: "Test purchase",
    createdAt: mockDate,
    updatedAt: mockDate,
};

describe("TransactionForm", () => {
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.setSystemTime(originalDate);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const defaultProps = {
        onSubmit: mockOnSubmit,
    };

    describe("Rendering", () => {
        it("renders all form fields", async () => {
            render(<TransactionForm {...defaultProps} />);

            expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/merchant/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        });

        it("shows required indicators for mandatory fields", async () => {
            render(<TransactionForm {...defaultProps} />);

            const requiredFields = screen.getAllByText("*");
            expect(requiredFields).toHaveLength(4); // Date, Merchant, Amount, Category
        });

        it("initializes with default values", async () => {
            render(<TransactionForm {...defaultProps} />);

            // Check if the date is initialized to today
            const today = new Date();
            const formattedDate = today.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
            expect(screen.getByLabelText(/date/i)).toHaveValue(formattedDate);

            // Amount should be empty initially (will be 0 when submitted)
            expect(screen.getByLabelText(/amount/i)).toHaveValue(null);

            // Category should show the default placeholder
            expect(screen.getByLabelText(/category/i)).toHaveAttribute("placeholder", "Other");
        });
    });

    describe("User Interactions", () => {
        it("updates form fields when user enters data", async () => {
            const user = userEvent.setup({ delay: null }); // Disable artificial delays
            render(<TransactionForm {...defaultProps} />);

            // Fill in the merchant field
            const merchantInput = screen.getByLabelText(/merchant/i);
            await user.type(merchantInput, "Test Store");
            expect(merchantInput).toHaveValue("Test Store");

            // Fill in the amount field
            const amountInput = screen.getByLabelText(/amount/i);
            await user.type(amountInput, "42.99");
            expect(amountInput).toHaveValue(42.99);

            // Fill in the description field
            const descriptionInput = screen.getByLabelText(/description/i);
            await user.type(descriptionInput, "Test purchase");
            expect(descriptionInput).toHaveValue("Test purchase");
        }, 15000);

        it("allows category selection", async () => {
            const user = userEvent.setup({ delay: null }); // Disable artificial delays
            render(<TransactionForm {...defaultProps} />);

            const categoryInput = screen.getByLabelText(/category/i);
            await user.click(categoryInput);
            await user.type(categoryInput, "Personal");

            expect(categoryInput).toHaveValue("Personal");
        }, 15000);
    });

    describe("Form Submission", () => {
        it("submits form with valid data", async () => {
            const user = userEvent.setup({ delay: null }); // Disable artificial delays
            render(<TransactionForm {...defaultProps} />);

            // Fill out the form
            await user.type(screen.getByLabelText(/merchant/i), "Test Store");
            await user.type(screen.getByLabelText(/amount/i), "42.99");

            // For category, we need to handle the custom select component
            const categoryInput = screen.getByLabelText(/category/i);
            await user.click(categoryInput);
            await user.type(categoryInput, "Personal");
            await user.keyboard("{Enter}"); // Simulate pressing Enter to select the first matching option

            // Submit the form
            const form = screen.getByRole("form");
            await act(async () => {
                fireEvent.submit(form);
            });

            // Wait for the form submission to complete
            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledTimes(1);
                expect(mockOnSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        merchant: "Test Store",
                        amount: 42.99,
                        category: "Personal",
                    })
                );
            });
        }, 15000);

        it("does not submit form with invalid data", async () => {
            render(<TransactionForm {...defaultProps} />);

            const form = screen.getByRole("form");
            await act(async () => {
                fireEvent.submit(form);
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    describe("Initial Data Population", () => {
        it("populates form with initial transaction data", async () => {
            render(<TransactionForm {...defaultProps} initialData={sampleTransaction} />);

            expect(screen.getByLabelText(/merchant/i)).toHaveValue("Test Store");
            expect(screen.getByLabelText(/amount/i)).toHaveValue(42.99);
            expect(screen.getByLabelText(/category/i)).toHaveAttribute("placeholder", "Personal");
            expect(screen.getByLabelText(/description/i)).toHaveValue("Test purchase");
        });
    });
});
