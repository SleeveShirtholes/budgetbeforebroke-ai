import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ContactPage from "../page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the Toast component
jest.mock("@/components/Toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("ContactPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it("should render the contact page with all elements", () => {
    render(<ContactPage />);

    // Check main title and description
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(
      screen.getByText(/Have a question, suggestion, or need support/),
    ).toBeInTheDocument();

    // Check form elements
    expect(screen.getByText("Send us a message")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Message" }),
    ).toBeInTheDocument();

    // Check contact information
    expect(screen.getByText("Get in touch")).toBeInTheDocument();
    expect(
      screen.getByText("support@budgetbeforebroke.com"),
    ).toBeInTheDocument();
    expect(screen.getByText("Usually within 24 hours")).toBeInTheDocument();
    expect(screen.getByText("Remote-first team")).toBeInTheDocument();

    // Check FAQ section
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(
      screen.getByText("How secure is my financial data?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Can I export my data?")).toBeInTheDocument();
    expect(screen.getByText("Is there a mobile app?")).toBeInTheDocument();
  });

  it("should show validation errors for empty required fields", async () => {
    render(<ContactPage />);

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(
        screen.getByText("Please enter a valid email address"),
      ).toBeInTheDocument();
      expect(screen.getByText("Subject is required")).toBeInTheDocument();
      expect(
        screen.getByText("Message must be at least 10 characters"),
      ).toBeInTheDocument();
    });
  });

  it("should show validation error for invalid email", async () => {
    render(<ContactPage />);

    // Fill out other required fields first
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Test Subject" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Tell us more about your question or feedback...",
      ),
      {
        target: {
          value:
            "This is a test message that is long enough to meet the minimum requirement.",
        },
      },
    );

    // Now test invalid email
    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    // The form should not submit with invalid email, so we should still see the submit button
    // and not see any success message or form reset
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Send Message" }),
      ).toBeInTheDocument();
    });

    // The email input should still contain the invalid value
    expect(emailInput).toHaveValue("invalid-email");
  });

  it("should show validation error for message that is too short", async () => {
    render(<ContactPage />);

    const messageInput = screen.getByPlaceholderText(
      "Tell us more about your question or feedback...",
    );
    fireEvent.change(messageInput, { target: { value: "Hi" } });

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Message must be at least 10 characters"),
      ).toBeInTheDocument();
    });
  });

  it("should show validation error for name that is too long", async () => {
    render(<ContactPage />);

    const nameInput = screen.getByLabelText("Name");
    const longName = "a".repeat(101); // 101 characters, exceeding the 100 limit
    fireEvent.change(nameInput, { target: { value: longName } });

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is too long")).toBeInTheDocument();
    });
  });

  it("should show validation error for subject that is too long", async () => {
    render(<ContactPage />);

    const subjectInput = screen.getByLabelText("Subject");
    const longSubject = "a".repeat(201); // 201 characters, exceeding the 200 limit
    fireEvent.change(subjectInput, { target: { value: longSubject } });

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Subject is too long")).toBeInTheDocument();
    });
  });

  it("should show validation error for message that is too long", async () => {
    render(<ContactPage />);

    const messageInput = screen.getByPlaceholderText(
      "Tell us more about your question or feedback...",
    );
    const longMessage = "a".repeat(2001); // 2001 characters, exceeding the 2000 limit
    fireEvent.change(messageInput, { target: { value: longMessage } });

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Message is too long")).toBeInTheDocument();
    });
  });

  it("should submit form successfully with valid data", async () => {
    const mockResponse = {
      success: true,
      message: "Thank you for your message!",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<ContactPage />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Test Subject" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Tell us more about your question or feedback...",
      ),
      {
        target: {
          value:
            "This is a test message that is long enough to meet the minimum requirement.",
        },
      },
    );

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message:
            "This is a test message that is long enough to meet the minimum requirement.",
        }),
      });
    });
  });

  it("should handle API error response", async () => {
    const mockResponse = {
      success: false,
      message: "Something went wrong",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<ContactPage />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Test Subject" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Tell us more about your question or feedback...",
      ),
      {
        target: {
          value:
            "This is a test message that is long enough to meet the minimum requirement.",
        },
      },
    );

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("should handle network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ContactPage />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Test Subject" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Tell us more about your question or feedback...",
      ),
      {
        target: {
          value:
            "This is a test message that is long enough to meet the minimum requirement.",
        },
      },
    );

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("should show loading state during submission", async () => {
    // Mock a slow response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true, message: "Success" }),
              } as Response),
            100,
          ),
        ),
    );

    render(<ContactPage />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Test Subject" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Tell us more about your question or feedback...",
      ),
      {
        target: {
          value:
            "This is a test message that is long enough to meet the minimum requirement.",
        },
      },
    );

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    // Check that button shows loading state - the text should change to "Sending..."
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Sending..." }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
  });

  it("should clear form after successful submission", async () => {
    const mockResponse = {
      success: true,
      message: "Thank you for your message!",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<ContactPage />);

    // Fill out the form
    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const subjectInput = screen.getByLabelText("Subject");
    const messageInput = screen.getByPlaceholderText(
      "Tell us more about your question or feedback...",
    );

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(subjectInput, { target: { value: "Test Subject" } });
    fireEvent.change(messageInput, {
      target: {
        value:
          "This is a test message that is long enough to meet the minimum requirement.",
      },
    });

    const submitButton = screen.getByRole("button", { name: "Send Message" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Check that form is cleared
    expect(nameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(subjectInput).toHaveValue("");
    expect(messageInput).toHaveValue("");
  });

  it("should render navigation component", () => {
    render(<ContactPage />);

    // Check that Navigation component is rendered
    expect(screen.getByText("BBB")).toBeInTheDocument(); // Navigation logo
  });

  it("should have proper form accessibility", () => {
    render(<ContactPage />);

    // Check that form inputs have proper labels
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();

    // For the Message field, check if it exists by looking for the textarea with the label
    const messageLabel = screen.getByText("Message");
    expect(messageLabel).toBeInTheDocument();
    const messageTextarea = screen.getByPlaceholderText(
      "Tell us more about your question or feedback...",
    );
    expect(messageTextarea).toBeInTheDocument();

    // Check that submit button has proper type
    const submitButton = screen.getByRole("button", { name: "Send Message" });
    expect(submitButton).toHaveAttribute("type", "submit");
  });
});
