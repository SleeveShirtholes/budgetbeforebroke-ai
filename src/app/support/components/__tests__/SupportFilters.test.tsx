import { fireEvent, render, screen } from "@testing-library/react";

import SupportFilters from "../SupportFilters";

describe("SupportFilters", () => {
    const mockOnIssueViewChange = jest.fn();
    const mockOnCreateRequest = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders both tabs", () => {
        render(
            <SupportFilters
                issueView="my"
                onIssueViewChange={mockOnIssueViewChange}
                onCreateRequest={mockOnCreateRequest}
            />
        );
        expect(screen.getByText("My Issues")).toBeInTheDocument();
        expect(screen.getByText("All Public Issues")).toBeInTheDocument();
    });

    it("renders create request button", () => {
        render(
            <SupportFilters
                issueView="my"
                onIssueViewChange={mockOnIssueViewChange}
                onCreateRequest={mockOnCreateRequest}
            />
        );
        expect(screen.getByText("Create New Support Request")).toBeInTheDocument();
    });

    it("calls onCreateRequest when create button is clicked", () => {
        render(
            <SupportFilters
                issueView="my"
                onIssueViewChange={mockOnIssueViewChange}
                onCreateRequest={mockOnCreateRequest}
            />
        );
        fireEvent.click(screen.getByText("Create New Support Request"));
        expect(mockOnCreateRequest).toHaveBeenCalledTimes(1);
    });

    it("calls onIssueViewChange when tab is clicked", () => {
        render(
            <SupportFilters
                issueView="my"
                onIssueViewChange={mockOnIssueViewChange}
                onCreateRequest={mockOnCreateRequest}
            />
        );
        fireEvent.click(screen.getByText("All Public Issues"));
        expect(mockOnIssueViewChange).toHaveBeenCalledWith("public");
    });
});
