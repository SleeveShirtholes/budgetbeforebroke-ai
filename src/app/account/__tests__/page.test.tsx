import * as accountActions from "@/app/actions/account";

import { render, screen, waitFor } from "@testing-library/react";

import { useDefaultAccount } from "@/hooks/useDefaultAccount";
import { authClient } from "@/lib/auth-client";
import userEvent from "@testing-library/user-event";
import useSWR from "swr";
import AccountPageContent from "../page";

// Mock the dependencies
jest.mock("swr");
jest.mock("@/lib/auth-client");
jest.mock("@/hooks/useDefaultAccount");
jest.mock("@/app/actions/account", () => ({
  getAccounts: jest.fn(),
  inviteUser: jest.fn(),
  updateAccountName: jest.fn(),
  updateUserRole: jest.fn(),
  removeUser: jest.fn(),
  deleteInvitation: jest.fn(),
  resendInvite: jest.fn(),
  createAccount: jest.fn(),
}));

// Mock the useSearchParams hook
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the useToast hook
jest.mock("@/components/Toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

describe("AccountPageContent", () => {
  const mockAccounts = [
    {
      id: "1",
      accountNumber: "ACC001",
      name: "Test Account 1",
      members: [
        {
          userId: "user1",
          role: "owner",
          user: {
            id: "user1",
            email: "owner@test.com",
            name: "Owner User",
            image: null,
          },
        },
      ],
      invitations: [],
    },
  ];

  const mockSession = {
    user: {
      id: "user1",
      email: "owner@test.com",
    },
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (useSWR as jest.Mock).mockReturnValue({
      data: mockAccounts,
      isLoading: false,
      mutate: jest.fn(),
    });

    (authClient.useSession as jest.Mock).mockReturnValue({
      data: mockSession,
    });

    (useDefaultAccount as jest.Mock).mockReturnValue({
      defaultAccountId: null,
      updateDefault: jest.fn(),
      isLoading: false,
    });
  });

  it("renders account list and details", () => {
    render(<AccountPageContent />);

    // Check if account list is rendered
    expect(screen.getByText("Test Account 1")).toBeInTheDocument();

    // Check if create account button is present
    expect(
      screen.getByRole("button", { name: /create new account/i }),
    ).toBeInTheDocument();
  });

  it("handles account selection", async () => {
    render(<AccountPageContent />);

    // Click on an account
    const accountElement = screen.getByText("Test Account 1");
    await userEvent.click(accountElement);

    // Check if account details are shown (look for 'Account Members' heading)
    expect(
      screen.getByRole("heading", { name: /account members/i }),
    ).toBeInTheDocument();
  });

  it("handles user invitation", async () => {
    render(<AccountPageContent />);

    // Select an account first
    const accountElement = screen.getByText("Test Account 1");
    await userEvent.click(accountElement);

    // Click invite user button
    const inviteButton = screen.getByRole("button", { name: /invite user/i });
    await userEvent.click(inviteButton);

    // Check if invite modal is opened (look for heading)
    expect(
      screen.getByRole("heading", { name: /invite user/i }),
    ).toBeInTheDocument();

    // Fill in email and submit
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, "newuser@test.com");

    const submitButton = screen.getByRole("button", {
      name: /send invitation/i,
    });
    await userEvent.click(submitButton);

    // Verify that inviteUser was called
    await waitFor(() => {
      expect(accountActions.inviteUser).toHaveBeenCalledWith(
        "1",
        "newuser@test.com",
      );
    });
  });

  it("handles account creation", async () => {
    render(<AccountPageContent />);

    // Click create account button
    const createButton = screen.getByRole("button", {
      name: /create new account/i,
    });
    await userEvent.click(createButton);

    // Check if create modal is opened (look for heading)
    expect(
      screen.getByRole("heading", { name: /create new account/i }),
    ).toBeInTheDocument();

    // Fill in account details
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, "New Account");

    // There are multiple 'Create' buttons, so select the one with type='submit'
    const submitButton = screen
      .getAllByRole("button", { name: /^create$/i })
      .find((btn) => btn.getAttribute("type") === "submit");
    expect(submitButton).toBeDefined();
    await userEvent.click(submitButton!);

    // Verify that createAccount was called
    await waitFor(() => {
      expect(accountActions.createAccount).toHaveBeenCalledWith(
        "New Account",
        null,
      );
    });
  });

  it("handles loading state", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      mutate: jest.fn(),
    });

    render(<AccountPageContent />);

    expect(screen.getByText(/loading accounts/i)).toBeInTheDocument();
  });

  it("handles error state in account fetching", async () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch accounts"),
      mutate: jest.fn(),
    });

    render(<AccountPageContent />);

    expect(
      screen.getByText(/select an account to view details/i),
    ).toBeInTheDocument();
  });
});
