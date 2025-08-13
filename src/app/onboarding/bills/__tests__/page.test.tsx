import { render, screen } from "@testing-library/react";
import Bills from "../page";

// Mock the router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the toast
jest.mock("@/components/Toast", () => ({
  showToast: jest.fn(),
}));

describe("Bills Page", () => {
  it("should render the bills page", () => {
    render(<Bills />);
    expect(
      screen.getByText("Add Recurring Bills (Optional)"),
    ).toBeInTheDocument();
  });
});
