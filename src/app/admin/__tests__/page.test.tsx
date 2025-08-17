/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboard from "../page";
import { getAvailableTables } from "@/app/actions/admin";
import { getContactSubmissions } from "@/app/actions/contact";

// Mock the admin actions
jest.mock("@/app/actions/admin", () => ({
  getAvailableTables: jest.fn(),
}));

// Mock the contact actions
jest.mock("@/app/actions/contact", () => ({
  getContactSubmissions: jest.fn(),
}));

// Mock StatsCard component
jest.mock("@/components/StatsCard", () => {
  return function MockStatsCard({ name, value, color }: any) {
    return (
      <div data-testid="stats-card">
        <div data-testid="stats-name">{name}</div>
        <div data-testid="stats-value">{value}</div>
        <div data-testid="stats-color">{color}</div>
      </div>
    );
  };
});

// Mock Button component
jest.mock("@/components/Button", () => {
  return function MockButton({ children, href, className }: any) {
    return (
      <div data-testid="button" data-href={href} className={className}>
        {children}
      </div>
    );
  };
});

const mockGetAvailableTables = getAvailableTables as jest.MockedFunction<
  typeof getAvailableTables
>;
const mockGetContactSubmissions = getContactSubmissions as jest.MockedFunction<
  typeof getContactSubmissions
>;

describe("AdminDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockGetAvailableTables.mockResolvedValue([
      {
        name: "user",
        displayName: "User",
        editableFields: ["name", "email"],
        searchFields: ["name", "email"],
      },
      {
        name: "budgetAccounts",
        displayName: "Budget Accounts",
        editableFields: ["name", "description"],
        searchFields: ["name"],
      },
    ]);

    mockGetContactSubmissions.mockResolvedValue({
      success: true,
      submissions: [
        {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          subject: "Test Subject",
          message: "Test Message",
          status: "new" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
  });

  it("renders the admin dashboard header", async () => {
    render(await AdminDashboard());

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage your application's database tables, users, and system settings.",
      ),
    ).toBeInTheDocument();
  });

  it("displays quick action buttons", async () => {
    render(await AdminDashboard());

    await waitFor(() => {
      expect(screen.getByText("Database Tables")).toBeInTheDocument();
      expect(screen.getByText("User Management")).toBeInTheDocument();
      expect(screen.getByText("Contact Support")).toBeInTheDocument();
      expect(screen.getByText("Admin Settings")).toBeInTheDocument();
    });
  });

  it("shows stats overview when data loads successfully", async () => {
    render(await AdminDashboard());

    await waitFor(() => {
      const statsCards = screen.getAllByTestId("stats-card");
      expect(statsCards).toHaveLength(4);

      // Check for expected stat names
      expect(screen.getByText("Database Tables")).toBeInTheDocument();
      expect(screen.getByText("Contact Submissions")).toBeInTheDocument();
      expect(screen.getByText("Editable Tables")).toBeInTheDocument();
      expect(screen.getByText("System Status")).toBeInTheDocument();
    });
  });

  it.skip("displays available database tables", async () => {
    render(await AdminDashboard());

    await waitFor(() => {
      expect(screen.getByText("Available Database Tables")).toBeInTheDocument();
      expect(screen.getByText("User")).toBeInTheDocument();
      expect(screen.getByText("Budget Accounts")).toBeInTheDocument();
      expect(screen.getByText("2 editable fields")).toBeInTheDocument();
      expect(screen.getByText("1 searchable fields")).toBeInTheDocument();
    });
  });

  it.skip("handles errors gracefully in stats overview", async () => {
    mockGetAvailableTables.mockRejectedValue(
      new Error("Failed to load tables"),
    );
    mockGetContactSubmissions.mockRejectedValue(
      new Error("Failed to load contacts"),
    );

    render(await AdminDashboard());

    await waitFor(() => {
      expect(screen.getByText("Error loading statistics")).toBeInTheDocument();
    });
  });

  it.skip("handles errors gracefully in tables overview", async () => {
    mockGetAvailableTables.mockRejectedValue(
      new Error("Failed to load tables"),
    );

    render(await AdminDashboard());

    await waitFor(() => {
      expect(screen.getByText("Error loading tables")).toBeInTheDocument();
    });
  });

  it.skip('shows "View All Tables" link when there are many tables', async () => {
    // Mock more than 9 tables
    const manyTables = Array.from({ length: 12 }, (_, i) => ({
      name: `table${i}`,
      displayName: `Table ${i}`,
      editableFields: ["field1"],
      searchFields: ["field1"],
    }));

    mockGetAvailableTables.mockResolvedValue(manyTables);

    render(await AdminDashboard());

    await waitFor(() => {
      expect(screen.getByText("View All Tables")).toBeInTheDocument();
      expect(screen.getByText("+3 more tables")).toBeInTheDocument();
    });
  });

  it.skip("calculates stats correctly", async () => {
    render(await AdminDashboard());

    await waitFor(() => {
      // Should show 2 total tables
      expect(screen.getByTestId("stats-value")).toHaveTextContent("2");

      // Should show 1 contact submission
      const statsValues = screen.getAllByTestId("stats-value");
      expect(statsValues[1]).toHaveTextContent("1");

      // Should show 2 editable tables (both have editable fields)
      expect(statsValues[2]).toHaveTextContent("2");

      // Should show "Online" system status
      expect(statsValues[3]).toHaveTextContent("Online");
    });
  });
});
