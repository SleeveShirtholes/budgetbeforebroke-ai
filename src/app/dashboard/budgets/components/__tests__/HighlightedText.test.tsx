import { render, screen } from "@testing-library/react";

import { HighlightedText } from "../HighlightedText";

describe("HighlightedText", () => {
  it("renders text without highlighting when no search query is provided", () => {
    render(<HighlightedText text="Test Category" searchQuery="" />);
    expect(screen.getByText("Test Category")).toBeInTheDocument();
  });

  it("highlights matching text when search query is provided", () => {
    render(<HighlightedText text="Test Category" searchQuery="Test" />);
    expect(screen.getByText("Test", { selector: "span" })).toHaveClass(
      "bg-yellow-200",
    );
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("handles case-insensitive matching", () => {
    render(<HighlightedText text="Test Category" searchQuery="test" />);
    expect(screen.getByText("Test", { selector: "span" })).toHaveClass(
      "bg-yellow-200",
    );
  });

  it("highlights multiple matches in the text", () => {
    render(<HighlightedText text="Test Test Category" searchQuery="Test" />);
    const highlightedTexts = screen.getAllByText("Test", { selector: "span" });
    expect(highlightedTexts).toHaveLength(2);
    highlightedTexts.forEach((text) => {
      expect(text).toHaveClass("bg-yellow-200");
    });
  });
});
