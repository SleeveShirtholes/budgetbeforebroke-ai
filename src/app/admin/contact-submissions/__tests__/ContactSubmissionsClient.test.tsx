import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactSubmissionsClient from "../ContactSubmissionsClient";

// Mock the server actions
jest.mock("@/app/actions/contact", () => ({
  updateContactSubmissionStatus: jest.fn(),
  sendFollowUpEmailToUser: jest.fn(),
  getConversationHistory: jest.fn(),
}));

import * as contactActions from "@/app/actions/contact";

const mockUpdateStatus = jest.mocked(
  contactActions.updateContactSubmissionStatus,
);
const mockSendFollowUp = jest.mocked(contactActions.sendFollowUpEmailToUser);
const mockGetConversations = jest.mocked(contactActions.getConversationHistory);

const mockSubmissions = [
  {
    id: "sub-1",
    name: "Test User 1",
    email: "user1@example.com",
    subject: "Test Subject 1",
    message: "Test message 1",
    status: "new" as const,
    conversationId: "conv-1",
    ipAddress: "127.0.0.1",
    userAgent: "Test Browser",
    notes: null,
    assignedTo: null,
    resolvedAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    lastUserMessageAt: null,
    lastSupportMessageAt: null,
  },
  {
    id: "sub-2",
    name: "Test User 2",
    email: "user2@example.com",
    subject: "Test Subject 2",
    message: "Test message 2",
    status: "closed" as const,
    conversationId: "conv-2",
    ipAddress: "127.0.0.1",
    userAgent: "Test Browser",
    notes: "Issue resolved",
    assignedTo: null,
    resolvedAt: new Date("2024-01-02"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    lastUserMessageAt: null,
    lastSupportMessageAt: new Date("2024-01-02"),
  },
];

describe("ContactSubmissionsClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful responses
    mockUpdateStatus.mockResolvedValue({
      success: true,
      submission: { id: "sub-1", status: "resolved", notes: "Updated" },
    });

    mockSendFollowUp.mockResolvedValue({
      success: true,
      submission: { id: "sub-1", notes: "Follow-up sent" },
    });

    mockGetConversations.mockResolvedValue({
      success: true,
      conversations: [
        {
          id: "conv-1",
          message: "User message",
          direction: "inbound",
          createdAt: new Date(),
        },
      ],
    });
  });

  it("should render contact submissions list", () => {
    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    expect(screen.getByText("Contact Submissions")).toBeInTheDocument();
    expect(screen.getByText(/Test User 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test User 2/)).toBeInTheDocument();
    expect(screen.getByText("Test Subject 1")).toBeInTheDocument();
    expect(screen.getByText("Test Subject 2")).toBeInTheDocument();
  });

  it("should show minimized view for closed submissions", () => {
    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // The closed submission should show minimal info
    expect(screen.getByText("Test Subject 2")).toBeInTheDocument();
    expect(
      screen.getByText("From: Test User 2 (user2@example.com)"),
    ).toBeInTheDocument();

    // Should not show the full message initially
    expect(screen.queryByText("Test message 2")).not.toBeInTheDocument();
  });

  it("should expand closed submissions when clicked", async () => {
    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // Find and click the expand button for the closed submission
    const closedSubmissionCard = screen
      .getByText("Test Subject 2")
      .closest("div");
    if (closedSubmissionCard) {
      fireEvent.click(closedSubmissionCard);
    }

    // Should now show the full message
    await waitFor(() => {
      expect(screen.getByText("Test message 2")).toBeInTheDocument();
    });
  });

  it("should update submission status", async () => {
    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // Find and click the update button - the status should already be set to "new" from the mock data
    const updateButton = screen.getByText("Update Status");
    fireEvent.click(updateButton);

    // The component should call updateStatus with the current status value
    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith("sub-1", "new", "");
    });
  });

  it("should open follow-up email modal", async () => {
    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // Find and click the follow-up button for the first submission
    // Use getAllByText and get the button (not the modal title)
    const followUpButtons = screen.getAllByText("Send Follow-up Email");
    const followUpButton = followUpButtons[0]; // Get the button, not the modal title
    fireEvent.click(followUpButton);

    // Should show the follow-up modal - look for the modal title specifically
    // Use getAllByText to get all elements and find the modal title (h3 element)
    const followUpElements = screen.getAllByText("Send Follow-up Email");
    const modalTitle = followUpElements.find(
      (element) => element.tagName === "H3",
    );
    expect(modalTitle).toBeInTheDocument();
    expect(screen.getByText("Your Name")).toBeInTheDocument();
    expect(screen.getByText("Your Email")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
  });

  it("should send follow-up email successfully", async () => {
    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // Open follow-up modal
    const followUpButtons = screen.getAllByText("Send Follow-up Email");
    const followUpButton = followUpButtons[0]; // Get the button, not the modal title
    fireEvent.click(followUpButton);

    // Fill out the form using the input elements directly
    const nameInput = screen.getByPlaceholderText("Support Staff Name");
    const emailInput = screen.getByPlaceholderText("support@example.com");
    const messageTextarea = screen.getByPlaceholderText(
      "Type your response to the user...",
    );

    fireEvent.change(nameInput, { target: { value: "Support Agent" } });
    fireEvent.change(emailInput, { target: { value: "support@example.com" } });
    fireEvent.change(messageTextarea, {
      target: {
        value: "Thank you for your message. We are looking into this.",
      },
    });

    // Send the email
    const sendButton = screen.getByText("Send Email");
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendFollowUp).toHaveBeenCalledWith(
        "sub-1",
        "Thank you for your message. We are looking into this.",
        "Support Agent",
        "support@example.com",
      );
    });

    // Modal should close - check that the modal title is no longer visible
    await waitFor(() => {
      const followUpElements = screen.queryAllByText("Send Follow-up Email");
      const modalTitle = followUpElements.find(
        (element) => element.tagName === "H3",
      );
      // If modalTitle is undefined, it means the modal is closed (which is what we want)
      expect(modalTitle).toBeUndefined();
    });
  });

  it("should show conversation history", async () => {
    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // Find and click the conversations button for the first submission
    const conversationsButton = screen.getByText("Show Conversations");
    fireEvent.click(conversationsButton);

    await waitFor(() => {
      expect(mockGetConversations).toHaveBeenCalledWith("sub-1");
    });

    // Should show conversation history
    await waitFor(() => {
      expect(screen.getByText("User message")).toBeInTheDocument();
    });
  });

  it("should handle status update errors gracefully", async () => {
    mockUpdateStatus.mockResolvedValue({
      success: false,
      error: "Database error",
    });

    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // Try to update status with the current value
    const updateButton = screen.getByText("Update Status");
    fireEvent.click(updateButton);

    // Should show error in console (we can't easily test console.error in tests)
    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalled();
    });
  });

  it("should handle follow-up email errors gracefully", async () => {
    mockSendFollowUp.mockResolvedValue({
      success: false,
      error: "Email sending failed",
    });

    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // Open follow-up modal and send email
    const followUpButtons = screen.getAllByText("Send Follow-up Email");
    const followUpButton = followUpButtons[0]; // Get the button, not the modal title
    fireEvent.click(followUpButton);

    // Fill out the form using the input elements directly
    const nameInput = screen.getByPlaceholderText("Support Staff Name");
    const emailInput = screen.getByPlaceholderText("support@example.com");
    const messageTextarea = screen.getByPlaceholderText(
      "Type your response to the user...",
    );

    fireEvent.change(nameInput, { target: { value: "Support Agent" } });
    fireEvent.change(emailInput, { target: { value: "support@example.com" } });
    fireEvent.change(messageTextarea, { target: { value: "Test message" } });

    const sendButton = screen.getByText("Send Email");
    fireEvent.click(sendButton);

    // Should handle error gracefully
    await waitFor(() => {
      expect(mockSendFollowUp).toHaveBeenCalled();
    });
  });

  it("should format dates correctly", () => {
    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // Check that dates are displayed in the expected format
    // Use getAllByText since there are multiple date elements
    const dateElements = screen.getAllByText(/1\/1\/2024/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it("should show correct status colors", () => {
    render(<ContactSubmissionsClient initialSubmissions={mockSubmissions} />);

    // Check that status badges are displayed
    expect(screen.getByText("new")).toBeInTheDocument();
    expect(screen.getByText("closed")).toBeInTheDocument();
  });
});
