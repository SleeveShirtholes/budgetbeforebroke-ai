import { render, screen } from "@testing-library/react";

import TransactionsPage from "../page";

// Mock the TableExample component
jest.mock("@/components/Table/TableExample", () => {
    return function MockTableExample() {
        return <div data-testid="table-example">Transactions Table Example</div>;
    };
});

describe("Transactions Page", () => {
    it("renders the TableExample component", () => {
        render(<TransactionsPage />);
        expect(screen.getByTestId("table-example")).toBeInTheDocument();
        expect(screen.getByText("Transactions Table Example")).toBeInTheDocument();
    });
});
