import { fireEvent, render, screen } from "@testing-library/react";

import ProfileHeader from "../ProfileHeader";
import userEvent from "@testing-library/user-event";

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

        const avatar = screen.getByRole("img", { name: mockProps.name });
        await user.hover(avatar);
        expect(screen.getByTestId("camera-icon")).toBeVisible();
    });
});
