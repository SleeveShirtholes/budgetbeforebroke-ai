import { render, screen } from "@testing-library/react";

import { formatDate } from "@/utils/date";
import useSWR from "swr";
import SignInMethods from "../SignInMethods";

jest.mock("@/components/Toast", () => ({
    useToast: jest.fn(() => ({ showToast: jest.fn() })),
}));

// Mock useSWR to control the data returned to SignInMethods
jest.mock("swr", () => {
    return jest.fn();
});

describe("SignInMethods", () => {
    const mockMethods = [
        {
            type: "email",
            provider: "Email",
            lastUsed: "2024-03-20T00:00:00Z",
        },
        {
            type: "google",
            provider: "Google",
            lastUsed: "2024-03-19T00:00:00Z",
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders all sign-in methods", () => {
        (useSWR as jest.Mock).mockReturnValue({ data: mockMethods });
        render(<SignInMethods />);
        expect(screen.getByText("Email Account")).toBeInTheDocument();
        expect(screen.getByText("Google Account")).toBeInTheDocument();
        expect(
            screen.getByText(
                (content) => content.includes("Last used:") && content.includes(formatDate("2024-03-20T00:00:00Z"))
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                (content) => content.includes("Last used:") && content.includes(formatDate("2024-03-19T00:00:00Z"))
            )
        ).toBeInTheDocument();
    });

    it("renders correct number of method cards", () => {
        (useSWR as jest.Mock).mockReturnValue({ data: mockMethods });
        render(<SignInMethods />);
        const methodCards = screen.getAllByText(/Account$/);
        expect(methodCards).toHaveLength(mockMethods.length);
    });

    it("renders empty state correctly", () => {
        (useSWR as jest.Mock).mockReturnValue({ data: [] });
        render(<SignInMethods />);
        // Should show the Connect Google Account button
        expect(screen.getByText("Connect Google Account")).toBeInTheDocument();
    });

    it("renders with correct styling classes", () => {
        (useSWR as jest.Mock).mockReturnValue({ data: mockMethods });
        render(<SignInMethods />);
        const container = screen.getByRole("list");
        expect(container).toHaveClass("space-y-4");
    });
});
