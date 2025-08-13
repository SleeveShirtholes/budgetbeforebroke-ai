import { render, screen } from "@testing-library/react";

import HighlightedText from "../HighlightedText";

describe("HighlightedText Component", () => {
  it("renders text without highlighting when no highlight term is provided", () => {
    render(<HighlightedText text="Sample text" highlight="" />);
    expect(screen.getByText("Sample text")).toBeInTheDocument();
    expect(
      screen.queryByText("Sample text", { selector: ".bg-yellow-200" }),
    ).not.toBeInTheDocument();
  });

  it("highlights matching text", () => {
    render(<HighlightedText text="Hello World" highlight="World" />);
    const highlightedPart = screen.getByText("World", {
      selector: ".bg-yellow-200",
    });
    expect(highlightedPart).toHaveClass("bg-yellow-200");
  });

  it("handles case-insensitive matching", () => {
    render(<HighlightedText text="Hello WORLD" highlight="world" />);
    const highlightedPart = screen.getByText("WORLD", {
      selector: ".bg-yellow-200",
    });
    expect(highlightedPart).toHaveClass("bg-yellow-200");
  });

  it("handles special regex characters in search term", () => {
    render(
      <HighlightedText text="Text (with) special chars" highlight="(with)" />,
    );
    const highlightedParts = screen.getAllByText("with", {
      selector: ".bg-yellow-200",
    });
    expect(highlightedParts).toHaveLength(2);
    highlightedParts.forEach((part) => {
      expect(part).toHaveClass("bg-yellow-200");
    });
  });

  it("handles empty highlight string", () => {
    render(<HighlightedText text="Hello World" highlight="" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("handles no matches", () => {
    render(<HighlightedText text="Hello World" highlight="xyz" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("handles multiple occurrences of the search term", () => {
    render(<HighlightedText text="Text with more text" highlight="text" />);
    const highlightedParts = screen.getAllByText("Text", { exact: false });
    expect(highlightedParts).toHaveLength(2);
    highlightedParts.forEach((part) => {
      expect(part).toHaveClass("bg-yellow-200");
    });
  });

  it("handles partial matches", () => {
    render(<HighlightedText text="Testing text" highlight="test" />);
    const highlightedPart = screen.getByText("Test");
    expect(highlightedPart).toHaveClass("bg-yellow-200");
  });

  it("preserves non-matching text", () => {
    render(<HighlightedText text="Before match after" highlight="match" />);
    expect(screen.getByText(/Before/)).toBeInTheDocument();
    const highlightedPart = screen.getByText("match", {
      selector: ".bg-yellow-200",
    });
    expect(highlightedPart).toHaveClass("bg-yellow-200");
    expect(screen.getByText(/after/)).toBeInTheDocument();
  });

  it("handles empty text", () => {
    render(<HighlightedText text="" highlight="test" />);
    expect(screen.getByTestId("empty-span")).toBeInTheDocument();
  });

  it("handles null or undefined values", () => {
    render(
      <HighlightedText text={null as unknown as string} highlight="test" />,
    );
    expect(screen.getByTestId("empty-span")).toBeInTheDocument();
  });

  it("handles numbers and other non-string values", () => {
    render(<HighlightedText text={123 as unknown as string} highlight="12" />);
    const highlightedPart = screen.getByText("12");
    expect(highlightedPart).toHaveClass("bg-yellow-200");
  });

  it("handles whitespace in search term", () => {
    render(<HighlightedText text="Hello World" highlight="Hello " />);
    const highlightedPart = screen.getByText("Hello", {
      selector: ".bg-yellow-200",
    });
    expect(highlightedPart).toHaveClass("bg-yellow-200");
  });
});
