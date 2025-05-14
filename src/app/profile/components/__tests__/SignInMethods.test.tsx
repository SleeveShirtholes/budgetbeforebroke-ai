import { render, screen } from "@testing-library/react";

import SignInMethods from "../SignInMethods";

describe("SignInMethods", () => {
    const mockMethods = [
        {
            type: "email",
            provider: "Email",
            lastUsed: "2024-03-20",
        },
        {
            type: "google",
            provider: "Google",
            lastUsed: "2024-03-19",
        },
    ];

    it("renders all sign-in methods", () => {
        render(<SignInMethods methods={mockMethods} />);

        // Check if all providers are rendered
        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("Google")).toBeInTheDocument();

        // Check if last used dates are rendered
        expect(screen.getByText("Last used: 2024-03-20")).toBeInTheDocument();
        expect(screen.getByText("Last used: 2024-03-19")).toBeInTheDocument();
    });

    it("renders correct number of manage buttons", () => {
        render(<SignInMethods methods={mockMethods} />);
        const manageButtons = screen.getAllByText("Manage");
        expect(manageButtons).toHaveLength(mockMethods.length);
    });

    it("renders empty state correctly", () => {
        render(<SignInMethods methods={[]} />);
        const manageButtons = screen.queryAllByText("Manage");
        expect(manageButtons).toHaveLength(0);
    });

    it("renders with correct styling classes", () => {
        render(<SignInMethods methods={mockMethods} />);

        // Check if the container has the correct classes
        const container = screen.getByRole("list");
        expect(container).toHaveClass("space-y-4");

        // Check if each method card has the correct classes
        const methodCards = screen.getAllByRole("listitem");
        methodCards.forEach((card) => {
            expect(card).toHaveClass("flex", "items-center", "justify-between", "p-4", "bg-secondary-50", "rounded-lg");
        });
    });
});
