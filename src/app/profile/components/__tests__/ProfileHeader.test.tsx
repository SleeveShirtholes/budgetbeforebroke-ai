import { fireEvent, render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import ProfileHeader from "../ProfileHeader";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    ...props
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    [key: string]: string | number | boolean | undefined;
  }) => {
    // Using a div with data-testid to make it easier to test
    return (
      <div
        data-testid="next-image"
        style={{
          position: "relative",
          width: width,
          height: height,
        }}
        {...props}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          role="img"
          aria-label={alt}
        />
      </div>
    );
  },
}));

// Mock URL.createObjectURL
beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "mock-url");
});

describe("ProfileHeader", () => {
  const mockProps = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://example.com/avatar.jpg",
    onAvatarChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user information correctly", () => {
    render(<ProfileHeader {...mockProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("displays avatar with correct props", () => {
    render(<ProfileHeader {...mockProps} />);

    const avatar = screen.getByRole("img", { name: mockProps.name });
    expect(avatar).toHaveStyle({
      backgroundImage: `url(${mockProps.avatar})`,
    });
    expect(screen.getByTestId("next-image")).toBeInTheDocument();
  });

  it("handles avatar click and file selection", async () => {
    const user = userEvent.setup();
    render(<ProfileHeader {...mockProps} />);

    const avatar = screen.getByRole("img", { name: mockProps.name });
    await user.click(avatar);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, "files", {
        value: [file],
      });
      fireEvent.change(input);
    }

    expect(mockProps.onAvatarChange).toHaveBeenCalledWith("mock-url");
  });

  it("shows camera icon on hover", async () => {
    const user = userEvent.setup();
    render(<ProfileHeader {...mockProps} />);

    const avatarContainer = screen.getByTestId("next-image");
    await user.hover(avatarContainer);
    expect(screen.getByTestId("camera-icon")).toBeVisible();
  });
});
