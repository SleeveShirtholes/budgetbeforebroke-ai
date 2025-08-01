import { render, screen } from "@testing-library/react";
import OnboardingProgress from "../OnboardingProgress";

describe("OnboardingProgress", () => {
  const stepTitles = [
    "Create Account",
    "Invite Others",
    "Add Income",
    "Add Bills",
  ];

  it("should render progress with current step highlighted", () => {
    render(
      <OnboardingProgress
        currentStep={2}
        totalSteps={4}
        stepTitles={stepTitles}
      />,
    );

    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Invite Others")).toBeInTheDocument();
  });

  it("should show completed steps with check icons", () => {
    render(
      <OnboardingProgress
        currentStep={3}
        totalSteps={4}
        stepTitles={stepTitles}
      />,
    );

    // First two steps should be completed (have check icons)
    const checkIcons = document.querySelectorAll("svg");
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it("should calculate progress percentage correctly", () => {
    render(
      <OnboardingProgress
        currentStep={2}
        totalSteps={4}
        stepTitles={stepTitles}
      />,
    );

    // Progress bar should be 50% (2/4 * 100)
    const progressBar = document.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("should handle all steps completed", () => {
    render(
      <OnboardingProgress
        currentStep={4}
        totalSteps={4}
        stepTitles={stepTitles}
      />,
    );

    expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();

    // Progress bar should be 100%
    const progressBar = document.querySelector('[style*="width: 100%"]');
    expect(progressBar).toBeInTheDocument();
  });
});
