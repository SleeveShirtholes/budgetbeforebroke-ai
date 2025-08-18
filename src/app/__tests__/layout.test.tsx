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

    // Verify that we have children in the body
    expect(body.props.children).toBeDefined();

    // The body has a single SWRConfig child, not an array
    const swrConfig = body.props.children;
    expect(swrConfig).toBeDefined();
    expect(swrConfig.type.name).toBe("SWRConfig");
    expect(swrConfig.props.value).toEqual({
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    });

    // Verify the SWRConfig has children (ToastProvider)
    const toastProvider = swrConfig.props.children;
    expect(toastProvider).toBeDefined();
    expect(toastProvider.type.name).toBe("ToastProvider");

    // Verify the ToastProvider has children including Footer
    const toastChildren = toastProvider.props.children;
    expect(toastChildren).toBeDefined();

    // Check that Footer is present in the ToastProvider children
    const footer = toastChildren[2]; // Footer should be the third child (after main and CookieConsentBanner)
    expect(footer).toBeDefined();
    expect(footer.type.name).toBe("ConditionalFooter");
  });
});
