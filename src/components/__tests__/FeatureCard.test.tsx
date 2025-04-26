import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import FeatureCard from "../FeatureCard";

describe("FeatureCard Component", () => {
  const mockProps = {
    icon: <span>🎯</span>,
    title: "Test Feature",
    description: "This is a test feature description",
  };

  it("renders the feature title", () => {
    render(<FeatureCard {...mockProps} />);
    expect(screen.getByText("Test Feature")).toBeInTheDocument();
  });

  it("renders the feature description", () => {
    render(<FeatureCard {...mockProps} />);
    expect(
      screen.getByText("This is a test feature description"),
    ).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(<FeatureCard {...mockProps} />);
    expect(screen.getByText("🎯")).toBeInTheDocument();
  });

  it("applies custom hover border color", () => {
    render(<FeatureCard {...mockProps} hoverBorderColor="secondary" />);
    const card = screen.getByText("Test Feature").parentElement;
    expect(card).toHaveClass("hover:border-secondary-200");
  });

  it("applies default hover border color when not specified", () => {
    render(<FeatureCard {...mockProps} />);
    const card = screen.getByText("Test Feature").parentElement;
    expect(card).toHaveClass("hover:border-primary-200");
  });
});
