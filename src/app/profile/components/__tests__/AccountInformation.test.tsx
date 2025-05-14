import { render, screen } from "@testing-library/react";

import AccountInformation from "../AccountInformation";

describe("AccountInformation", () => {
    const mockProps = {
        accountCreated: "2024-03-20",
        lastLogin: "2024-03-21",
    };

    it("renders the component with account information", () => {
        render(<AccountInformation {...mockProps} />);

        // Check if the labels are present
        expect(screen.getByText("Account Created")).toBeInTheDocument();
        expect(screen.getByText("Last Login")).toBeInTheDocument();

        // Check if the values are rendered correctly
        expect(screen.getByText(mockProps.accountCreated)).toBeInTheDocument();
        expect(screen.getByText(mockProps.lastLogin)).toBeInTheDocument();
    });

    it("renders with different dates", () => {
        const differentProps = {
            accountCreated: "2023-01-01",
            lastLogin: "2023-12-31",
        };

        render(<AccountInformation {...differentProps} />);

        expect(screen.getByText(differentProps.accountCreated)).toBeInTheDocument();
        expect(screen.getByText(differentProps.lastLogin)).toBeInTheDocument();
    });

    it("maintains the correct layout structure", () => {
        const { container } = render(<AccountInformation {...mockProps} />);

        // Check if the grid layout is present
        const gridContainer = container.querySelector(".grid");
        expect(gridContainer).toHaveClass("grid-cols-2");

        // Check if there are two sections (Account Created and Last Login)
        const sections = container.querySelectorAll(".grid > div");
        expect(sections).toHaveLength(2);
    });
});
