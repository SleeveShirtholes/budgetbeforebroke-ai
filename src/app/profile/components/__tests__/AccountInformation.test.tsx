import { render, screen } from "@testing-library/react";

import { formatDate } from "@/utils/date";
import useSWR from "swr";
import AccountInformation from "../AccountInformation";

// Mock useSWR
jest.mock("swr", () => {
    return jest.fn();
});

describe("AccountInformation", () => {
    const mockData = {
        accountCreated: "2024-03-20",
        lastLogin: "2024-03-21",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the component with account information", () => {
        // Mock useSWR to return data
        (useSWR as jest.Mock).mockReturnValue({
            data: mockData,
            error: null,
            isLoading: false,
        });

        render(<AccountInformation />);

        // Check if the labels are present
        expect(screen.getByText("Account Created")).toBeInTheDocument();
        expect(screen.getByText("Last Login")).toBeInTheDocument();

        // Check if the values are rendered correctly (formatted)
        expect(screen.getByText(formatDate(mockData.accountCreated))).toBeInTheDocument();
        expect(screen.getByText(formatDate(mockData.lastLogin))).toBeInTheDocument();
    });

    it("renders loading state", () => {
        // Mock useSWR to return loading state
        (useSWR as jest.Mock).mockReturnValue({
            data: null,
            error: null,
            isLoading: true,
        });

        render(<AccountInformation />);

        // Check if loading state is shown
        expect(screen.getAllByText("Loading...")).toHaveLength(2);
    });

    it("renders error state", () => {
        // Mock useSWR to return error
        (useSWR as jest.Mock).mockReturnValue({
            data: null,
            error: new Error("Failed to load"),
            isLoading: false,
        });

        render(<AccountInformation />);

        // Check if error message is shown
        expect(screen.getByText("Failed to load account information")).toBeInTheDocument();
    });

    it("maintains the correct layout structure", () => {
        // Mock useSWR to return data
        (useSWR as jest.Mock).mockReturnValue({
            data: mockData,
            error: null,
            isLoading: false,
        });

        const { container } = render(<AccountInformation />);

        // Check if the grid layout is present
        const gridContainer = container.querySelector(".grid");
        expect(gridContainer).toHaveClass("grid-cols-2");

        // Check if there are two sections (Account Created and Last Login)
        const sections = container.querySelectorAll(".grid > div");
        expect(sections).toHaveLength(2);
    });
});
