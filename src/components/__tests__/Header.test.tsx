import { fireEvent, render, screen } from "@testing-library/react";

import { ImageProps } from "next/image";
import Header from "../Header";

// Mock the navigationData
jest.mock("@/utils/navigationLoader", () => ({
  navigationData: {
    features: {
      label: "Features",
      items: [
        {
          label: "Analytics",
          description: "Get insights into your spending",
          href: "/dashboard/analytics",
          icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        },
      ],
    },
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Omit<ImageProps, "src"> & { src: string }) => (
    <img {...props} alt={props.alt || "Mock image"} />
  ),
}));

describe("Header", () => {
  const mockUserName = "Test User";
  const mockUserAvatar = "/test-avatar.png";

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<Header />);
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByAltText("User")).toHaveAttribute(
      "src",
      "/default-avatar.png",
    );
  });

  it("renders with custom props", () => {
    render(<Header userName={mockUserName} userAvatar={mockUserAvatar} />);
    expect(screen.getByText(mockUserName)).toBeInTheDocument();
    expect(screen.getByAltText(mockUserName)).toHaveAttribute(
      "src",
      mockUserAvatar,
    );
  });

  it("toggles navigation dropdown on click", () => {
    render(<Header />);
    const featuresButton = screen.getByText("Features");

    // Open dropdown
    fireEvent.click(featuresButton);
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(
      screen.getByText("Get insights into your spending"),
    ).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(featuresButton);
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("closes navigation dropdown when clicking outside", () => {
    render(<Header />);

    // Open dropdown
    fireEvent.click(screen.getByText("Features"));
    expect(screen.getByText("Analytics")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("toggles user dropdown on click", () => {
    render(<Header userName={mockUserName} />);

    // Find and click the user button by its role
    const userButton = screen.getByRole("button", {
      name: new RegExp(mockUserName),
    });
    fireEvent.click(userButton);

    // Verify dropdown content is visible
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(userButton);
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("closes user dropdown when clicking outside", () => {
    render(<Header userName={mockUserName} />);

    // Open dropdown using the button
    const userButton = screen.getByRole("button", {
      name: new RegExp(mockUserName),
    });
    fireEvent.click(userButton);
    expect(screen.getByText("Profile")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("closes dropdowns when clicking menu items", () => {
    render(<Header userName={mockUserName} />);

    // Test navigation dropdown
    fireEvent.click(screen.getByText("Features"));
    const analyticsLink = screen.getByText("Analytics");
    fireEvent.click(analyticsLink);
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();

    // Test user dropdown
    const userButton = screen.getByRole("button", {
      name: new RegExp(mockUserName),
    });
    fireEvent.click(userButton);
    const profileLink = screen.getByText("Profile");
    fireEvent.click(profileLink);
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("handles click events on all user dropdown items", () => {
    render(<Header userName={mockUserName} />);

    // Open user dropdown
    const userButton = screen.getByRole("button", {
      name: new RegExp(mockUserName),
    });
    fireEvent.click(userButton);

    // Click each menu item
    ["Profile", "Settings", "Logout"].forEach((item) => {
      const link = screen.getByRole("menuitem", { name: item });
      fireEvent.click(link);
      // Reopen dropdown for next item
      if (item !== "Logout") {
        fireEvent.click(userButton);
      }
    });

    // Verify dropdown is closed
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });
});
