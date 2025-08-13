import { render, screen } from "@testing-library/react";

import { useToast } from "@/components/Toast";
import userEvent from "@testing-library/user-event";
import React from "react";
import useSWR from "swr";
import ProfilePage from "../page";

// Mock the useToast hook
jest.mock("@/components/Toast", () => ({
  useToast: jest.fn(),
}));

// Mock useSWR
jest.mock("swr", () => jest.fn());

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

// Test-scoped variable to simulate avatar changes
let testAvatar = "/avatar.png";

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
      <div data-testid="avatar" style={{ backgroundImage: `url(${avatar})` }} />
      <button
        onClick={() => {
          testAvatar = "/new-avatar.png";
          onAvatarChange("/new-avatar.png");
        }}
      >
        Change Avatar
      </button>
    </div>
  );
  ProfileHeader.displayName = "ProfileHeader";
  return ProfileHeader;
});

jest.mock("../components/ProfileInformation", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ProfileInformation = (props: any) => (
    <div data-testid="profile-information">
      <div>{props.name}</div>
      <div>{props.email}</div>
      <input
        data-testid="phone-input"
        value={props.phoneNumber}
        disabled={!props.isEditing}
      />
      {props.isEditing && (
        <div>
          <button onClick={props.onCancel}>Cancel</button>
          <button
            type="submit"
            disabled={props.isLoading}
            onClick={() => {
              props.onSubmit({
                name: props.name,
                email: props.email,
                phoneNumber: props.phoneNumber,
              });
            }}
          >
            {props.isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
  ProfileInformation.displayName = "ProfileInformation";
  return ProfileInformation;
});

jest.mock("../components/SignInMethods", () => {
  const SignInMethods = ({
    methods = [],
  }: {
    methods?: Array<{ type: string; provider: string }>;
  }) => (
    <div data-testid="sign-in-methods">
      {methods?.map((method) => <div key={method.type}>{method.provider}</div>)}
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
  const AccountInformation = () => (
    <div data-testid="account-information">
      <div>Loading...</div>
      <div>Loading...</div>
    </div>
  );
  AccountInformation.displayName = "AccountInformation";
  return AccountInformation;
});

describe("ProfilePage", () => {
  const mockShowToast = jest.fn();
  const mockProfileData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "(555) 123-4567",
    avatar: "/avatar.png",
  };

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (useSWR as jest.Mock).mockReturnValue({
      data: { ...mockProfileData, avatar: testAvatar },
    });
    testAvatar = "/avatar.png";
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
    // Check phone number in input values
    expect(screen.getByTestId("phone-input")).toHaveValue("(555) 123-4567");
  });

  it("cancels editing and reverts changes", async () => {
    render(<ProfilePage />);
    // Click edit button
    const editButton = screen.getByText("Edit");
    await userEvent.click(editButton);

    // Click cancel button
    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    // Verify phone input is disabled
    const phoneInput = screen.getByTestId("phone-input");
    expect(phoneInput).toBeDisabled();
  });
});
