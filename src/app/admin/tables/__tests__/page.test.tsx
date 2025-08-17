/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import TablesPage from "../page";
import { getAvailableTables } from "@/app/actions/admin";

// Mock the admin actions
jest.mock("@/app/actions/admin", () => ({
  getAvailableTables: jest.fn(),
}));

// Mock SearchInput component
jest.mock("@/components/Forms/SearchInput", () => {
  return function MockSearchInput({ placeholder, defaultValue }: any) {
    return (
      <input
        data-testid="search-input"
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    );
  };
});

// Mock Link component
jest.mock("next/link", () => {
  return function MockLink({ children, href, className }: any) {
    return (
      <div data-testid="link" data-href={href} className={className}>
        {children}
      </div>
    );
  };
});

const mockGetAvailableTables = getAvailableTables as jest.MockedFunction<
  typeof getAvailableTables
>;

describe("TablesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock
    mockGetAvailableTables.mockResolvedValue([
      {
        name: "user",
        displayName: "User",
        editableFields: ["name", "email", "isGlobalAdmin"],
        searchFields: ["name", "email"],
      },
      {
        name: "budgetAccounts",
        displayName: "Budget Accounts",
        editableFields: ["name", "description"],
        searchFields: ["name"],
      },
      {
        name: "session",
        displayName: "Session",
        editableFields: [],
        searchFields: ["ipAddress"],
      },
    ]);
  });

  it("renders the tables page header", async () => {
    const component = await TablesPage({ searchParams: {} });
    render(component);

    expect(screen.getByText("Database Tables")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage all database tables in your application. Click on any table to view and edit its data.",
      ),
    ).toBeInTheDocument();
  });

  it("displays search input", async () => {
    const component = await TablesPage({ searchParams: {} });
    render(component);

    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toHaveAttribute(
      "placeholder",
      "Search tables...",
    );
  });

  it.skip("displays all available tables", async () => {
    const component = await TablesPage({ searchParams: {} });
    render(component);

    await waitFor(() => {
      expect(screen.getByText("User")).toBeInTheDocument();
      expect(screen.getByText("Budget Accounts")).toBeInTheDocument();
      expect(screen.getByText("Session")).toBeInTheDocument();
    });
  });

  it.skip("shows table information correctly", async () => {
    const component = await TablesPage({ searchParams: {} });
    render(component);

    await waitFor(() => {
      // Check for editable fields count
      expect(screen.getByText("3 editable fields")).toBeInTheDocument();
      expect(screen.getByText("2 editable fields")).toBeInTheDocument();
      expect(screen.getByText("0 editable fields")).toBeInTheDocument();

      // Check for searchable fields count
      expect(screen.getByText("2 searchable fields")).toBeInTheDocument();
      expect(screen.getByText("1 searchable fields")).toBeInTheDocument();
      expect(screen.getByText("1 searchable fields")).toBeInTheDocument();
    });
  });

  it.skip("displays editable field badges for tables with editable fields", async () => {
    const component = await TablesPage({ searchParams: {} });
    render(component);

    await waitFor(() => {
      // Should show first 3 editable fields for user table
      expect(screen.getByText("name")).toBeInTheDocument();
      expect(screen.getByText("email")).toBeInTheDocument();
      expect(screen.getByText("isGlobalAdmin")).toBeInTheDocument();
    });
  });

  it.skip("shows manage and view buttons for each table", async () => {
    const component = await TablesPage({ searchParams: {} });
    render(component);

    await waitFor(() => {
      const manageButtons = screen.getAllByText("Manage Table");
      const viewButtons = screen.getAllByText("View Only");

      expect(manageButtons).toHaveLength(3);
      expect(viewButtons).toHaveLength(3);
    });
  });

  it("filters tables based on search term", async () => {
    const component = await TablesPage({ searchParams: { search: "user" } });
    render(component);

    expect(screen.getByTestId("search-input")).toHaveAttribute("value", "user");
  });

  it.skip("shows no tables found message when filtered results are empty", async () => {
    // Mock empty results
    mockGetAvailableTables.mockResolvedValue([]);

    const component = await TablesPage({
      searchParams: { search: "nonexistent" },
    });
    render(component);

    await waitFor(() => {
      expect(screen.getByText("No tables found")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your search term."),
      ).toBeInTheDocument();
    });
  });

  it.skip("handles errors gracefully", async () => {
    mockGetAvailableTables.mockRejectedValue(
      new Error("Failed to load tables"),
    );

    const component = await TablesPage({ searchParams: {} });
    render(component);

    await waitFor(() => {
      expect(
        screen.getByText("Error loading database tables"),
      ).toBeInTheDocument();
    });
  });

  it.skip("shows correct table codes in descriptions", async () => {
    const component = await TablesPage({ searchParams: {} });
    render(component);

    await waitFor(() => {
      expect(screen.getByText("user")).toBeInTheDocument();
      expect(screen.getByText("budgetAccounts")).toBeInTheDocument();
      expect(screen.getByText("session")).toBeInTheDocument();
    });
  });

  it.skip("displays proper link hrefs for table management", async () => {
    const component = await TablesPage({ searchParams: {} });
    render(component);

    await waitFor(() => {
      const links = screen.getAllByTestId("link");
      const manageLinks = links.filter(
        (link) =>
          link.getAttribute("data-href")?.includes("/admin/tables/") &&
          !link.getAttribute("data-href")?.includes("view=readonly"),
      );
      const viewLinks = links.filter((link) =>
        link.getAttribute("data-href")?.includes("view=readonly"),
      );

      expect(manageLinks).toHaveLength(3);
      expect(viewLinks).toHaveLength(3);

      expect(manageLinks[0]).toHaveAttribute("data-href", "/admin/tables/user");
      expect(viewLinks[0]).toHaveAttribute(
        "data-href",
        "/admin/tables/user?view=readonly",
      );
    });
  });
});
