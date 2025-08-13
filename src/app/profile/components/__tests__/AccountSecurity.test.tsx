import { render, screen } from "@testing-library/react";

import { formatDateSafely } from "@/utils/date";
import useSWR from "swr";
import AccountSecurity from "../AccountSecurity";

jest.mock("@/components/Toast", () => ({
  useToast: jest.fn(() => ({ showToast: jest.fn() })),
}));
jest.mock("swr", () => jest.fn());

describe("AccountSecurity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state for passkeys and account", () => {
    (useSWR as jest.Mock).mockImplementation((key) => {
      if (key === "passkeys") return { data: null };
      if (key === "account") return { data: null };
      return {};
    });
    render(<AccountSecurity />);
    expect(screen.getByText("Your Passkeys")).toBeInTheDocument();
    expect(screen.getByText("Loading passkeys...")).toBeInTheDocument();
    expect(screen.getByText("Create Password")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add a password to your account for additional security",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders with no passkeys and no password", () => {
    (useSWR as jest.Mock).mockImplementation((key) => {
      if (key === "passkeys") return { data: [] };
      if (key === "account") return { data: { hasPassword: false } };
      return {};
    });
    render(<AccountSecurity />);
    expect(screen.getByText("Your Passkeys")).toBeInTheDocument();
    expect(
      screen.getByText("Add a passkey for quick and secure sign-in"),
    ).toBeInTheDocument();
    expect(screen.getByText("Create Password")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add a password to your account for additional security",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders with passkeys and password", () => {
    const passkeys = [
      {
        id: "1",
        name: "MacBook Pro",
        deviceType: "Laptop",
        createdAt: new Date("2024-02-29T00:00:00Z"),
      },
    ];
    (useSWR as jest.Mock).mockImplementation((key) => {
      if (key === "passkeys") return { data: passkeys };
      if (key === "account")
        return {
          data: {
            hasPassword: true,
            passwordLastChanged: new Date("2024-03-09T00:00:00Z"),
          },
        };
      return {};
    });
    render(<AccountSecurity />);
    expect(screen.getByText("Your Passkeys")).toBeInTheDocument();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(
      screen.getByText(
        `Laptop • Added ${formatDateSafely("2024-02-29T00:00:00Z", "MMM dd, yyyy")}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Change Password")).toBeInTheDocument();
    expect(
      screen.getByText(
        `Last changed: ${formatDateSafely("2024-03-09T00:00:00Z", "MMM dd, yyyy")}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
  });
});
