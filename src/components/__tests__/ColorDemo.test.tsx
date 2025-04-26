import { render, screen } from "@testing-library/react";

import ColorDemo from "../ColorDemo";

describe("ColorDemo", () => {
    it("renders the color palette title", () => {
        render(<ColorDemo />);
        expect(screen.getByText("Color Palette")).toBeInTheDocument();
    });

    it("renders all color section headings", () => {
        render(<ColorDemo />);
        expect(screen.getByText("Primary Colors")).toBeInTheDocument();
        expect(screen.getByText("Secondary Colors")).toBeInTheDocument();
        expect(screen.getByText("Accent Colors")).toBeInTheDocument();
    });

    it("renders all color shades for each color type", () => {
        const { container } = render(<ColorDemo />);
        const colorShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

        // Check primary colors
        colorShades.forEach((shade) => {
            expect(screen.getByText(`primary-${shade}`)).toBeInTheDocument();
            expect(screen.getByText(`bg-primary-${shade}`)).toBeInTheDocument();
            expect(container.querySelector(`.bg-primary-${shade}`)).toBeInTheDocument();
        });

        // Check secondary colors
        colorShades.forEach((shade) => {
            expect(screen.getByText(`secondary-${shade}`)).toBeInTheDocument();
            expect(screen.getByText(`bg-secondary-${shade}`)).toBeInTheDocument();
            expect(container.querySelector(`.bg-secondary-${shade}`)).toBeInTheDocument();
        });

        // Check accent colors
        colorShades.forEach((shade) => {
            expect(screen.getByText(`accent-${shade}`)).toBeInTheDocument();
            expect(screen.getByText(`bg-accent-${shade}`)).toBeInTheDocument();
            expect(container.querySelector(`.bg-accent-${shade}`)).toBeInTheDocument();
        });
    });

    it("renders with correct grid layout classes", () => {
        const { container } = render(<ColorDemo />);
        const colorGrids = container.querySelectorAll(".grid");

        colorGrids.forEach((grid) => {
            expect(grid).toHaveClass("grid-cols-2", "sm:grid-cols-3", "md:grid-cols-5", "gap-4");
        });
    });

    it("renders color swatches with correct styling", () => {
        const { container } = render(<ColorDemo />);
        const colorSwatches = container.querySelectorAll(".h-24");

        colorSwatches.forEach((swatch) => {
            expect(swatch).toHaveClass("w-full", "h-24", "rounded-lg", "border", "border-accent-300", "mb-2");
        });
    });
});
