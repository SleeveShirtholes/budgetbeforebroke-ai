import { render, screen } from "@testing-library/react";

import CategoryDetailPanel from "../CategoryDetailPanel";

describe("CategoryDetailPanel", () => {
    it("renders a list of merchants", () => {
        render(<CategoryDetailPanel merchants={["Amazon", "Target"]} />);
        expect(screen.getByText("Merchants in this Category")).toBeInTheDocument();
        expect(screen.getByText("Amazon")).toBeInTheDocument();
        expect(screen.getByText("Target")).toBeInTheDocument();
    });

    it("renders empty state when no merchants", () => {
        render(<CategoryDetailPanel merchants={[]} />);
        expect(screen.getByText("No merchants for this category.")).toBeInTheDocument();
    });
});
