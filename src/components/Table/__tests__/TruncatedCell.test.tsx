import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TruncatedCell from "../TruncatedCell";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe("TruncatedCell", () => {
  const mockClipboard = {
    writeText: jest.fn(),
  };
  Object.assign(navigator, { clipboard: mockClipboard });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders content correctly", () => {
    render(<TruncatedCell content="Test content" />);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<TruncatedCell content="Test" className="custom-class" />);
    const element = screen.getByText("Test").closest("div");
    expect(element).toHaveClass("custom-class");
  });

  it("applies custom maxWidth", () => {
    render(<TruncatedCell content="Test" maxWidth={300} />);
    const element = screen.getByText("Test").closest("div");
    expect(element).toHaveStyle({ maxWidth: "300px" });
  });

  it("shows tooltip on hover when content is truncated", async () => {
    // Mock scrollWidth > clientWidth to simulate truncated content
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      value: 200,
    });

    render(
      <TruncatedCell content="Very long content that should be truncated" />,
    );

    const contentElement = screen.getByText(
      "Very long content that should be truncated",
    );
    fireEvent.mouseEnter(contentElement);

    await waitFor(() => {
      // Look for the tooltip content specifically
      const tooltipContent = screen.getByText(
        "Very long content that should be truncated",
        { selector: "span" },
      );
      expect(tooltipContent).toBeInTheDocument();
    });
  });

  it("copies content to clipboard when copy button is clicked", async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    // Mock scrollWidth > clientWidth to simulate truncated content
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      value: 200,
    });

    render(<TruncatedCell content="Content to copy" />);

    const contentElement = screen.getByText("Content to copy");
    fireEvent.mouseEnter(contentElement);

    await waitFor(() => {
      const copyButton = screen.getByTitle("Copy to clipboard");
      fireEvent.click(copyButton);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith("Content to copy");
  });

  it("shows check icon after copying", async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    // Mock scrollWidth > clientWidth to simulate truncated content
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      value: 200,
    });

    render(<TruncatedCell content="Content to copy" />);

    const contentElement = screen.getByText("Content to copy");
    fireEvent.mouseEnter(contentElement);

    await waitFor(() => {
      const copyButton = screen.getByTitle("Copy to clipboard");
      fireEvent.click(copyButton);
    });

    // Should show check icon after copying
    await waitFor(() => {
      const checkIcon = screen
        .getByTitle("Copy to clipboard")
        .querySelector("svg");
      expect(checkIcon).toHaveClass("text-green-400");
    });
  });

  it("does not show tooltip when content is not truncated", () => {
    // Mock scrollWidth <= clientWidth to simulate non-truncated content
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 200,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      value: 200,
    });

    render(<TruncatedCell content="Short content" />);

    const contentElement = screen.getByText("Short content");
    fireEvent.mouseEnter(contentElement);

    // Should not show tooltip (only the main content should be visible)
    const tooltipContent = screen.queryByText("Short content", {
      selector: "span",
    });
    expect(tooltipContent).not.toBeInTheDocument();
  });

  it("keeps tooltip open when hovering over it", async () => {
    // Mock scrollWidth > clientWidth to simulate truncated content
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      value: 200,
    });

    render(
      <TruncatedCell content="Very long content that should be truncated" />,
    );

    const contentElement = screen.getByText(
      "Very long content that should be truncated",
    );
    fireEvent.mouseEnter(contentElement);

    // Wait for tooltip to appear
    await waitFor(() => {
      const tooltipContent = screen.getByText(
        "Very long content that should be truncated",
        { selector: "span" },
      );
      expect(tooltipContent).toBeInTheDocument();
    });

    // Now hover over the tooltip itself
    const tooltipElement = screen
      .getByText("Very long content that should be truncated", {
        selector: "span",
      })
      .closest("div");
    expect(tooltipElement).toBeInTheDocument();

    if (tooltipElement) {
      fireEvent.mouseEnter(tooltipElement);

      // Tooltip should still be visible
      await waitFor(() => {
        expect(
          screen.getByText("Very long content that should be truncated", {
            selector: "span",
          }),
        ).toBeInTheDocument();
      });
    }
  });
});
