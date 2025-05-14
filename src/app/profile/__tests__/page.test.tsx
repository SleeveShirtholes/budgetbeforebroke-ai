import { render, screen } from "@testing-library/react";

import { useToast } from "@/components/Toast";
import userEvent from "@testing-library/user-event";
import Image from "next/image";
import ProfilePage from "../page";

// Mock the useToast hook
jest.mock("@/components/Toast", () => ({
  useToast: jest.fn(),
}));

// Mock the components
jest.mock("@/components/Breadcrumb", () => {
  const Breadcrumb = () => <div data-testid="breadcrumb" />;
  Breadcrumb.displayName = "Breadcrumb";
  return Breadcrumb;
});

jest.mock("@/components/Card", () => {
  const Card = ({
    children,
    variant,
    padding,
  }: {
    children: React.ReactNode;
    variant: string;
    padding: string;
  }) => <div data-testid={`card-${variant}-${padding}`}>{children}</div>;
  Card.displayName = "Card";
  return Card;
});

jest.mock("@/components/PageInfo", () => {
  const PageInfo = () => <div data-testid="page-info" />;
  PageInfo.displayName = "PageInfo";
  return PageInfo;
});

jest.mock("../components/ProfileHeader", () => {
  const ProfileHeader = ({
    name,
    email,
    avatar,
    onAvatarChange,
  }: {
    name: string;
    email: string;
    avatar: string;
    onAvatarChange: (url: string) => void;
  }) => (
    <div data-testid="profile-header">
      <div>{name}</div>
      <div>{email}</div>
      <Image src={avatar} alt="avatar" width={100} height={100} />
      <button onClick={() => onAvatarChange("/new-avatar.png")}>
        Change Avatar
      </button>
    </div>
  );
  ProfileHeader.displayName = "ProfileHeader";
  return ProfileHeader;
});

jest.mock("../components/ProfileInformation", () => {
  const ProfileInformation = (props: {
    name: string;
    email: string;
    isEditing: boolean;
    tempPhoneNumber: string;
    phoneNumber: string;
    tempPreferredName: string;
    preferredName: string;
    onPhoneNumberChange?: (value: string) => void;
    onPreferredNameChange?: (value: string) => void;
  }) => (
    <div data-testid="profile-information">
      <div>{props.name}</div>
      <div>{props.email}</div>
      <input
        data-testid="phone-input"
        value={props.isEditing ? props.tempPhoneNumber : props.phoneNumber}
        onChange={(e) => props.onPhoneNumberChange?.(e.target.value)}
      />
      <input
        data-testid="preferred-name-input"
        value={props.isEditing ? props.tempPreferredName : props.preferredName}
        onChange={(e) => props.onPreferredNameChange?.(e.target.value)}
      />
    </div>
  );
  ProfileInformation.displayName = "ProfileInformation";
  return ProfileInformation;
});

jest.mock("../components/SignInMethods", () => {
  const SignInMethods = ({
    methods,
  }: {
    methods: Array<{ type: string; provider: string }>;
  }) => (
    <div data-testid="sign-in-methods">
      {methods.map((method) => (
        <div key={method.type}>{method.provider}</div>
      ))}
    </div>
  );
  SignInMethods.displayName = "SignInMethods";
  return SignInMethods;
});

jest.mock("../components/AccountSecurity", () => {
  const AccountSecurity = () => <div data-testid="account-security" />;
  AccountSecurity.displayName = "AccountSecurity";
  return AccountSecurity;
});

jest.mock("../components/AccountInformation", () => {
  const AccountInformation = ({
    accountCreated,
    lastLogin,
  }: {
    accountCreated: string;
    lastLogin: string;
  }) => (
    <div data-testid="account-information">
      <div>{accountCreated}</div>
      <div>{lastLogin}</div>
    </div>
  );
  AccountInformation.displayName = "AccountInformation";
  return AccountInformation;
});

describe("ProfilePage", () => {
  const mockShowToast = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all major components", () => {
    render(<ProfilePage />);

    expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
    expect(screen.getByTestId("profile-header")).toBeInTheDocument();
    expect(screen.getByTestId("profile-information")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-methods")).toBeInTheDocument();
    expect(screen.getByTestId("account-security")).toBeInTheDocument();
    expect(screen.getByTestId("account-information")).toBeInTheDocument();
  });

  it("displays initial user data correctly", () => {
    render(<ProfilePage />);
    // There should be two 'John Doe' (header and profile info)
    expect(screen.getAllByText("John Doe")).toHaveLength(2);
    expect(screen.getAllByText("john.doe@example.com")).toHaveLength(2);
    // Check phone number and preferred name in input values
    expect(screen.getByTestId("phone-input")).toHaveValue("(555) 123-4567");
    expect(screen.getByTestId("preferred-name-input")).toHaveValue("John");
  });

  it("allows editing profile information", async () => {
    render(<ProfilePage />);

    // Click edit button
    const editButton = screen.getByText("Edit");
    await userEvent.click(editButton);

    // Change phone number and preferred name
    const phoneInput = screen.getByTestId("phone-input");
    const preferredNameInput = screen.getByTestId("preferred-name-input");

    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, "(555) 999-8888");

    await userEvent.clear(preferredNameInput);
    await userEvent.type(preferredNameInput, "Johnny");

    // Save changes
    const saveButton = screen.getByText("Save Changes");
    await userEvent.click(saveButton);

    // Verify toast was shown
    expect(mockShowToast).toHaveBeenCalledWith(
      "Profile updated successfully!",
      { type: "success" },
    );
  });

  it("cancels editing and reverts changes", async () => {
    render(<ProfilePage />);
    // Click edit button
    const editButton = screen.getByText("Edit");
    await userEvent.click(editButton);
    // Change phone number
    const phoneInput = screen.getByTestId("phone-input");
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, "(555) 999-8888");
    // Cancel changes
    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);
    // Verify values were reverted in the input
    expect(screen.getByTestId("phone-input")).toHaveValue("(555) 123-4567");
  });

  it("handles avatar change", async () => {
    render(<ProfilePage />);

    const changeAvatarButton = screen.getByText("Change Avatar");
    await userEvent.click(changeAvatarButton);

    // Verify the avatar URL was updated
    const avatar = screen.getByAltText("avatar");
    expect(avatar).toHaveAttribute(
      "src",
      expect.stringContaining("url=%2Fnew-avatar.png"),
    );
  });

  it("displays sign-in methods correctly", () => {
    render(<ProfilePage />);

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("displays account information correctly", () => {
    render(<ProfilePage />);

    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    expect(screen.getByText("2024-03-20")).toBeInTheDocument();
  });
});
