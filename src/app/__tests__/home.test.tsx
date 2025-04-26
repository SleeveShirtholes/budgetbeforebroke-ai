import { render, screen } from "@testing-library/react";

import Home from "../page";

// Mock the components used in the home page
jest.mock("@/components/Navigation", () => {
    return function MockNavigation() {
        return <nav data-testid="navigation">Navigation</nav>;
    };
});

jest.mock("@/components/Hero", () => {
    return function MockHero() {
        return <section data-testid="hero">Hero Section</section>;
    };
});

jest.mock("@/components/Features", () => {
    return function MockFeatures() {
        return <section data-testid="features">Features Section</section>;
    };
});

jest.mock("@/components/CTA", () => {
    return function MockCTA() {
        return <section data-testid="cta">Call to Action</section>;
    };
});

jest.mock("@/components/Footer", () => {
    return function MockFooter() {
        return <footer data-testid="footer">Footer</footer>;
    };
});

describe("Home Page", () => {
    it("renders all main sections", () => {
        render(<Home />);

        expect(screen.getByTestId("navigation")).toBeInTheDocument();
        expect(screen.getByTestId("hero")).toBeInTheDocument();
        expect(screen.getByTestId("features")).toBeInTheDocument();
        expect(screen.getByTestId("cta")).toBeInTheDocument();
        expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("renders with the correct layout structure", () => {
        const { container } = render(<Home />);

        // Check for the main container with background gradient
        const mainContainer = container.firstChild as HTMLElement;
        expect(mainContainer).toHaveClass("min-h-screen", "bg-gradient-to-b", "from-accent-50", "to-white");
    });
});
