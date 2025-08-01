import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import OnboardingPage from "../page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

const mockPush = jest.fn();

describe("OnboardingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it("should render onboarding steps", () => {
    render(<OnboardingPage />);

    expect(screen.getByText("Welcome to")).toBeInTheDocument();
    expect(screen.getByText("Budget Before Broke")).toBeInTheDocument();
    expect(screen.getByText("Create Budget Account")).toBeInTheDocument();
    expect(screen.getByText("Invite Others")).toBeInTheDocument();
    expect(screen.getByText("Add Income")).toBeInTheDocument();
    expect(screen.getByText("Set Up Categories")).toBeInTheDocument();
    expect(screen.getByText("Add Recurring Bills")).toBeInTheDocument();
  });

  it("should show required labels for account, income, and categories steps", () => {
    render(<OnboardingPage />);

    const requiredLabels = screen.getAllByText("Required");
    expect(requiredLabels).toHaveLength(3);
  });

  it("should navigate to account step when step is clicked", () => {
    render(<OnboardingPage />);

    const accountStep = screen
      .getByText("Create Budget Account")
      .closest("div");
    fireEvent.click(accountStep!);

    expect(mockPush).toHaveBeenCalledWith("/onboarding/account");
  });

  it("should navigate to account step when Get Started is clicked", () => {
    render(<OnboardingPage />);

    const getStartedButton = screen.getByText("Get Started");
    fireEvent.click(getStartedButton);

    expect(mockPush).toHaveBeenCalledWith("/onboarding/account");
  });

  it("should load completed steps from localStorage", () => {
    const mockGetItem = jest.fn(() => JSON.stringify(["account", "income"]));
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: mockGetItem,
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    render(<OnboardingPage />);

    expect(mockGetItem).toHaveBeenCalledWith("onboardingProgress");
  });

  it("should show skip option when account step is completed", () => {
    const mockGetItem = jest.fn(() => JSON.stringify(["account"]));
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: mockGetItem,
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    render(<OnboardingPage />);

    expect(
      screen.getByText("Skip remaining and go to dashboard"),
    ).toBeInTheDocument();
  });

  it("should navigate to dashboard when skip is clicked", () => {
    const mockGetItem = jest.fn(() => JSON.stringify(["account"]));
    const mockRemoveItem = jest.fn();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: mockGetItem,
        setItem: jest.fn(),
        removeItem: mockRemoveItem,
      },
      writable: true,
    });

    render(<OnboardingPage />);

    const skipButton = screen.getByText("Skip remaining and go to dashboard");
    fireEvent.click(skipButton);

    expect(mockRemoveItem).toHaveBeenCalledWith("onboardingProgress");
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
