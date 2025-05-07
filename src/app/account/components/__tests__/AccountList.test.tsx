import { fireEvent, render, screen } from "@testing-library/react";

import { Account } from "@/stores/accountStore";
import AccountList from "../AccountList";

// Mock the Card component
jest.mock("@/components/Card", () => {
  return function MockCard({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return <div className={className}>{children}</div>;
  };
});

describe("AccountList", () => {
  const mockAccounts: Account[] = [
    {
      id: "1",
      nickname: "Test Account 1",
      accountNumber: "1234567890",
      users: [
        {
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          role: "owner",
          accepted: true,
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      nickname: "Test Account 2",
      accountNumber: "0987654321",
      users: [
        {
          id: "2",
          email: "user2@example.com",
          name: "User 2",
          role: "member",
          accepted: true,
        },
        {
          id: "3",
          email: "user3@example.com",
          name: "User 3",
          role: "member",
          accepted: true,
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ];

  const mockOnAccountSelect = jest.fn();

  beforeEach(() => {
    mockOnAccountSelect.mockClear();
  });

  it("renders the correct number of accounts", () => {
    render(
      <AccountList
        accounts={mockAccounts}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />,
    );

    expect(screen.getByText("Your Accounts")).toBeInTheDocument();
    expect(screen.getByText("2 Accounts")).toBeInTheDocument();
    expect(screen.getByText("Test Account 1")).toBeInTheDocument();
    expect(screen.getByText("Test Account 2")).toBeInTheDocument();
  });

  it("displays correct member count for each account", () => {
    render(
      <AccountList
        accounts={mockAccounts}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />,
    );

    expect(screen.getByText("1 Member")).toBeInTheDocument();
    expect(screen.getByText("2 Members")).toBeInTheDocument();
  });

  it("calls onAccountSelect when an account is clicked", () => {
    render(
      <AccountList
        accounts={mockAccounts}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />,
    );

    fireEvent.click(screen.getByText("Test Account 1"));
    expect(mockOnAccountSelect).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it("applies selected styles to the selected account", () => {
    render(
      <AccountList
        accounts={mockAccounts}
        selectedAccount={mockAccounts[0]}
        onAccountSelect={mockOnAccountSelect}
      />,
    );

    const selectedAccount = screen
      .getByText("Test Account 1")
      .closest("button");
    expect(selectedAccount).toHaveClass("bg-primary-50");
  });

  it("displays account numbers correctly", () => {
    render(
      <AccountList
        accounts={mockAccounts}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />,
    );

    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("0987654321")).toBeInTheDocument();
  });

  it("renders the 'Create New Account' button at the end of the list", () => {
    render(
      <AccountList
        accounts={mockAccounts}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />,
    );
    const createButton = screen.getByText("Create New Account");
    expect(createButton).toBeInTheDocument();
    // Check for the plus icon by role or class if needed (optional, depending on test setup)
  });
});
