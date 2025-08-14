import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import Navigation from "../Navigation";

// Mock the auth client
jest.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: jest.fn(),
    signOut: jest.fn(),
  },
}));

const mockUseSession = jest.fn();
const mockSignOut = jest.fn();

// Get the mocked module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const authClientModule = require("@/lib/auth-client");
authClientModule.authClient.useSession = mockUseSession;
authClientModule.authClient.signOut = mockSignOut;

describe("Navigation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the logo text", () => {
    mockUseSession.mockReturnValue({ data: null });
    render(<Navigation />);
    expect(screen.getByText("BBB")).toBeInTheDocument();
  });

  describe("when user is not authenticated", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null });
    });

    it("renders sign in and sign up buttons on desktop", () => {
      render(<Navigation />);
      const signInButtons = screen.getAllByText("Sign In");
      const signUpButtons = screen.getAllByText("Sign Up");
      expect(signInButtons).toHaveLength(1); // Desktop only (mobile uses icon)
      expect(signUpButtons).toHaveLength(2); // Desktop + Mobile
    });

    it("renders mobile navigation with icons and sign up button", () => {
      render(<Navigation />);
      // Check for mobile sign up button (kept as text for better UX)
      expect(screen.getAllByText("Sign Up")).toHaveLength(2);
      // Check for mobile sign in icon (aria-label)
      expect(screen.getByLabelText("Sign In")).toBeInTheDocument();
    });

    it("has correct link destinations", () => {
      render(<Navigation />);
      const signInLinks = screen.getAllByText("Sign In");
      const signUpLinks = screen.getAllByText("Sign Up");

      // Check desktop links
      expect(signInLinks[0].closest("a")).toHaveAttribute(
        "href",
        "/auth/signin",
      );
      expect(signUpLinks[0].closest("a")).toHaveAttribute(
        "href",
        "/auth/signup",
      );
    });

    it("does not show dashboard button, sign out button, or avatar", () => {
      render(<Navigation />);
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
      expect(screen.queryByText("User")).not.toBeInTheDocument();
    });
  });

  describe("when user is authenticated", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "John Doe",
            email: "john@example.com",
            image: "https://example.com/avatar.jpg",
          },
        },
      });
    });

    it("renders dashboard button, sign out button, and avatar on desktop", () => {
      render(<Navigation />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
      // Avatar should be present (either as image or initials)
      const avatars = screen.getAllByRole("img", { name: "John Doe" });
      expect(avatars).toHaveLength(2); // Desktop + Mobile
    });

    it("renders mobile navigation with icons and avatar", () => {
      render(<Navigation />);
      // Check for mobile dashboard icon
      expect(screen.getByLabelText("Go to Dashboard")).toBeInTheDocument();
      // Check for mobile sign out icon
      expect(screen.getByLabelText("Sign Out")).toBeInTheDocument();
      // Avatar should be present
      const avatars = screen.getAllByRole("img", { name: "John Doe" });
      expect(avatars).toHaveLength(2); // Desktop + Mobile
    });

    it("does not show sign in and sign up buttons", () => {
      render(<Navigation />);
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
    });

    it("has correct dashboard link destination", () => {
      render(<Navigation />);
      expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
        "href",
        "/dashboard",
      );
    });

    it("calls signOut when sign out button is clicked", () => {
      render(<Navigation />);
      const signOutButtons = screen.getAllByText("Sign Out");
      signOutButtons[0].click(); // Click desktop button
      expect(mockSignOut).toHaveBeenCalled();
    });

    it("calls signOut when mobile sign out icon is clicked", () => {
      render(<Navigation />);
      const mobileSignOutButton = screen.getByLabelText("Sign Out");
      mobileSignOutButton.click();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it("shows avatar with user initials when no image is provided", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "John Doe",
            email: "john@example.com",
            image: null,
          },
        },
      });
      render(<Navigation />);
      const initials = screen.getAllByText("JD");
      expect(initials).toHaveLength(2); // Desktop + Mobile
    });
  });
});
