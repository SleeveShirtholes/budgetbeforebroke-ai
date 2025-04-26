import { render, screen } from "@testing-library/react";

import ColorsPage from "../colors/page";

// Mock the ColorDemo component
jest.mock("@/components/ColorDemo", () => {
    return function MockColorDemo() {
        return <div data-testid="color-demo">Color Demo Component</div>;
    };
});

describe("Colors Page", () => {
    it("renders the ColorDemo component", () => {
        render(<ColorsPage />);
        expect(screen.getByTestId("color-demo")).toBeInTheDocument();
        expect(screen.getByText("Color Demo Component")).toBeInTheDocument();
    });
});
