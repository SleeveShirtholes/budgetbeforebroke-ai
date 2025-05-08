import RootLayout from "../layout";

// Mock the Inter font
jest.mock("next/font/google", () => ({
  Inter: () => ({
    className: "inter-font",
    subsets: ["latin"],
  }),
}));

describe("RootLayout", () => {
  it("renders with correct structure and props", async () => {
    const testContent = "Test Content";
    const layout = await RootLayout({ children: <div>{testContent}</div> });

    // Verify the root structure
    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("en");

    const body = layout.props.children;
    expect(body.type).toBe("body");
    expect(body.props.className).toBe("bg-pastel-gradient inter-font");

    // Verify the ToastProvider and main content
    const toastProvider = body.props.children;
    expect(toastProvider.type.name).toBe("ToastProvider");
    expect(toastProvider.props.defaultPosition).toBe("bottom-left");

    const main = toastProvider.props.children;
    expect(main.type).toBe("main");
    expect(main.props.className).toBe("pt-0");
    expect(main.props.children.props.children).toBe(testContent);
  });
});
