import { fireEvent, render, screen } from "@testing-library/react";

import { Account } from "@/stores/accountStore";
import AccountDetails from "../AccountDetails";

// Mock the Card component
jest.mock("@/components/Card", () => {
  return function MockCard({ children }: { children: React.ReactNode }) {
    return <div data-testid="card">{children}</div>;
  };
});

// Mock the Avatar component
jest.mock("@/components/Avatar", () => {
  return function MockAvatar({ name }: { name: string }) {
    return <div data-testid="avatar">{name}</div>;
  };
});

// Mock the Button component
jest.mock("@/components/Button", () => {
  return function MockButton({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant: string;
  }) {
    return (
      <button onClick={onClick} data-testid={`button-${variant}`}>
        {children}
      </button>
    );
  };
});

// Mock the CustomSelect component
jest.mock("@/components/Forms/CustomSelect", () => {
  return function MockCustomSelect({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="role-select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
});

// Mock the RowActions component
jest.mock("@/components/Table/RowActions", () => {
  return function MockRowActions({
    actions,
  }: {
    actions: { label: string; onClick: () => void }[];
  }) {
    return (
      <div data-testid="row-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            data-testid={`action-${action.label.toLowerCase()}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };
});

describe("AccountDetails", () => {
  const mockAccount: Account = {
    id: "1",
    accountNumber: "ACC-001",
    nickname: "Test Account",
    users: [
      {
        id: "1",
        email: "owner@example.com",
        name: "Owner User",
        role: "owner",
        accepted: true,
      },
      {
        id: "2",
        email: "member@example.com",
        name: "Member User",
        role: "member",
        accepted: true,
      },
    ],
    invitations: [
      {
        id: "3",
        inviteeEmail: "pending@example.com",
        status: "pending",
        role: "member",
        createdAt: new Date("2024-01-01T00:00:00Z"),
      },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockOnEditNickname = jest.fn();
  const mockOnInviteUser = jest.fn();
  const mockOnRemoveUser = jest.fn();
  const mockOnUpdateUserRole = jest.fn();
  const mockOnResendInvite = jest.fn();
  const mockOnDeleteInvitation = jest.fn();

  beforeEach(() => {
    mockOnEditNickname.mockClear();
    mockOnInviteUser.mockClear();
    mockOnRemoveUser.mockClear();
    mockOnUpdateUserRole.mockClear();
    mockOnResendInvite.mockClear();
    mockOnDeleteInvitation.mockClear();
  });

  it("renders account details correctly", () => {
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
      />,
    );

    expect(screen.getByText("Account Members")).toBeInTheDocument();
    expect(screen.getByText("ACC-001")).toBeInTheDocument();
    expect(screen.getByText("Test Account")).toBeInTheDocument();
  });

  it("displays accepted users correctly", () => {
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
      />,
    );

    const ownerUser = screen.getByText("Owner User", {
      selector: ".font-medium",
    });
    const memberUser = screen.getByText("Member User", {
      selector: ".font-medium",
    });
    expect(ownerUser).toBeInTheDocument();
    expect(memberUser).toBeInTheDocument();
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByText("member@example.com")).toBeInTheDocument();
  });

  it("displays pending users correctly", () => {
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
      />,
    );

    const pendingUser = screen.getByText("pending", {
      selector: ".font-medium",
    });
    expect(pendingUser).toBeInTheDocument();
    expect(screen.getByText("pending@example.com")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("calls onEditNickname when edit nickname button is clicked", () => {
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
      />,
    );

    const editButton = screen.getAllByTestId("button-primary")[0];
    fireEvent.click(editButton);
    expect(mockOnEditNickname).toHaveBeenCalled();
  });

  it("calls onInviteUser when invite user button is clicked", () => {
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
      />,
    );

    const buttons = screen.getAllByTestId("button-primary");
    const inviteButton = buttons[buttons.length - 1];
    fireEvent.click(inviteButton);
    expect(mockOnInviteUser).toHaveBeenCalled();
  });

  it("calls onUpdateUserRole when role is changed", () => {
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
      />,
    );

    const roleSelect = screen.getAllByTestId("role-select")[0];
    fireEvent.change(roleSelect, { target: { value: "member" } });
    expect(mockOnUpdateUserRole).toHaveBeenCalledWith("1", "member");
  });

  it("calls onResendInvite when resend action is clicked for pending user", () => {
    const accountWithInvite = {
      ...mockAccount,
      invitations: [
        {
          id: "3",
          inviteeEmail: "pending@example.com",
          status: "pending",
          role: "member",
          createdAt: new Date("2024-01-01T00:00:00Z"),
        },
      ],
    };
    render(
      <AccountDetails
        account={accountWithInvite}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
      />,
    );

    const resendButton = screen.getByTestId("action-resend");
    fireEvent.click(resendButton);
    expect(mockOnResendInvite).toHaveBeenCalledWith("3");
  });

  it("displays Set as Default button when not default account", () => {
    const mockOnSetDefault = jest.fn();
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
        isDefault={false}
        onSetDefault={mockOnSetDefault}
      />,
    );

    expect(screen.getByText("Set as Default")).toBeInTheDocument();
  });

  it("displays Default Account badge when account is default", () => {
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
        isDefault={true}
      />,
    );

    expect(screen.getByText("Default Account")).toBeInTheDocument();
  });

  it("disables Set as Default button when loading", () => {
    const mockOnSetDefault = jest.fn();
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
        isDefault={false}
        isLoadingDefault={true}
        onSetDefault={mockOnSetDefault}
      />,
    );

    const setDefaultButton = screen.getByText("Set as Default");
    expect(setDefaultButton).toBeDisabled();
  });

  it("calls onSetDefault when Set as Default button is clicked", () => {
    const mockOnSetDefault = jest.fn();
    render(
      <AccountDetails
        account={mockAccount}
        onEditNickname={mockOnEditNickname}
        onInviteUser={mockOnInviteUser}
        onRemoveUser={mockOnRemoveUser}
        onUpdateUserRole={mockOnUpdateUserRole}
        onResendInvite={mockOnResendInvite}
        onDeleteInvitation={mockOnDeleteInvitation}
        isOwner={true}
        isDefault={false}
        onSetDefault={mockOnSetDefault}
      />,
    );

    const setDefaultButton = screen.getByText("Set as Default");
    fireEvent.click(setDefaultButton);
    expect(mockOnSetDefault).toHaveBeenCalled();
  });
});
