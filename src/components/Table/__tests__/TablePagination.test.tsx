import { fireEvent, render, screen } from "@testing-library/react";

import TablePagination from "../TablePagination";

describe("TablePagination Component", () => {
    const mockOnPageChange = jest.fn();

    beforeEach(() => {
        mockOnPageChange.mockClear();
    });

    it("renders pagination controls", () => {
        render(
            <TablePagination
                currentPage={1}
                totalPages={5}
                onPageChange={mockOnPageChange}
                showPagination={true}
                togglePagination={() => {}}
            />
        );

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("handles page changes", () => {
        render(
            <TablePagination
                currentPage={1}
                totalPages={5}
                onPageChange={mockOnPageChange}
                showPagination={true}
                togglePagination={() => {}}
            />
        );

        fireEvent.click(screen.getByText("3"));
        expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it("disables previous button on first page", () => {
        render(
            <TablePagination
                currentPage={1}
                totalPages={5}
                onPageChange={mockOnPageChange}
                showPagination={true}
                togglePagination={() => {}}
            />
        );

        const prevButton = screen.getByRole("button", { name: /previous/i });
        expect(prevButton).toBeDisabled();
    });

    it("disables next button on last page", () => {
        render(
            <TablePagination
                currentPage={5}
                totalPages={5}
                onPageChange={mockOnPageChange}
                showPagination={true}
                togglePagination={() => {}}
            />
        );

        const nextButton = screen.getByRole("button", { name: /next/i });
        expect(nextButton).toBeDisabled();
    });

    it("shows ellipsis for many pages", () => {
        render(
            <TablePagination
                currentPage={5}
                totalPages={10}
                onPageChange={mockOnPageChange}
                showPagination={true}
                togglePagination={() => {}}
            />
        );

        expect(screen.getAllByText("...")).toHaveLength(2);
    });

    it("handles previous page navigation", () => {
        render(
            <TablePagination
                currentPage={3}
                totalPages={5}
                onPageChange={mockOnPageChange}
                showPagination={true}
                togglePagination={() => {}}
            />
        );

        const prevButton = screen.getByRole("button", { name: /previous/i });
        fireEvent.click(prevButton);
        expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it("handles next page navigation", () => {
        render(
            <TablePagination
                currentPage={3}
                totalPages={5}
                onPageChange={mockOnPageChange}
                showPagination={true}
                togglePagination={() => {}}
            />
        );

        const nextButton = screen.getByRole("button", { name: /next/i });
        fireEvent.click(nextButton);
        expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it("shows correct page range near start", () => {
        render(
            <TablePagination
                currentPage={2}
                totalPages={10}
                onPageChange={mockOnPageChange}
                showPagination={true}
                togglePagination={() => {}}
            />
        );

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("...")).toBeInTheDocument();
    });

    it("shows correct page range near end", () => {
        render(
            <TablePagination
                currentPage={9}
                totalPages={10}
                onPageChange={mockOnPageChange}
                showPagination={true}
                togglePagination={() => {}}
            />
        );

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("8")).toBeInTheDocument();
        expect(screen.getByText("9")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("...")).toBeInTheDocument();
    });
});
