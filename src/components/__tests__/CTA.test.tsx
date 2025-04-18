import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import CTA from "../CTA";

describe("CTA Component", () => {
    it("renders the heading", () => {
        render(<CTA />);
        expect(screen.getByText("Ready to take control of your finances?")).toBeInTheDocument();
    });

    it("renders the description", () => {
        render(<CTA />);
        expect(screen.getByText("Join thousands of users who are already budgeting smarter.")).toBeInTheDocument();
    });

    it("renders the call to action button", () => {
        render(<CTA />);
        const button = screen.getByText("Start Your Free Trial");
        expect(button).toBeInTheDocument();
        expect(button.closest("a")).toHaveAttribute("href", "/signup");
    });
});
