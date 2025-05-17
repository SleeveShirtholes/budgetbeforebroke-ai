import { fireEvent, render, screen } from "@testing-library/react";

import React from "react";
import Tabs from "../Tabs";

describe("Tabs", () => {
  const mockOptions = [
    { label: "Tab 1", value: "tab1" },
    { label: "Tab 2", value: "tab2" },
    { label: "Tab 3", value: "tab3" },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders all tab options", () => {
    render(<Tabs options={mockOptions} value="tab1" onChange={mockOnChange} />);

    mockOptions.forEach((option) => {
      expect(
        screen.getByRole("tab", { name: option.label }),
      ).toBeInTheDocument();
    });
  });

  it("shows the correct tab as active", () => {
    render(<Tabs options={mockOptions} value="tab2" onChange={mockOnChange} />);

    const activeTab = screen.getByRole("tab", { name: "Tab 2" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
    expect(activeTab).toHaveClass("bg-primary-600");
  });

  it("calls onChange when a tab is clicked", () => {
    render(<Tabs options={mockOptions} value="tab1" onChange={mockOnChange} />);

    fireEvent.click(screen.getByRole("tab", { name: "Tab 2" }));
    expect(mockOnChange).toHaveBeenCalledWith("tab2");
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-class";
    render(
      <Tabs
        options={mockOptions}
        value="tab1"
        onChange={mockOnChange}
        className={customClass}
      />,
    );

    const tabList = screen.getByRole("tablist");
    expect(tabList).toHaveClass(customClass);
  });

  it("handles keyboard navigation", () => {
    // Wrapper to simulate parent state
    function TabsWrapper() {
      const [selected, setSelected] = React.useState("tab1");
      return (
        <Tabs options={mockOptions} value={selected} onChange={setSelected} />
      );
    }
    render(<TabsWrapper />);

    const firstTab = screen.getByRole("tab", { name: "Tab 1" });
    const secondTab = screen.getByRole("tab", { name: "Tab 2" });

    // Focus the first tab
    firstTab.focus();

    // Press right arrow key
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    expect(secondTab).toHaveFocus();

    // Press left arrow key
    fireEvent.keyDown(secondTab, { key: "ArrowLeft" });
    expect(firstTab).toHaveFocus();
  });

  it("maintains proper ARIA attributes", () => {
    render(<Tabs options={mockOptions} value="tab1" onChange={mockOnChange} />);

    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab, index) => {
      const isActive = index === 0; // tab1 is active
      expect(tab).toHaveAttribute("aria-selected", isActive.toString());
      expect(tab).toHaveAttribute("tabIndex", isActive ? "0" : "-1");
    });
  });
});
