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
    expect(Array.isArray(body.props.children)).toBe(true);
    expect(body.props.children.length).toBeGreaterThan(0);

    // Verify the SWRConfig wrapper exists and has the right props
    const swrConfig = body.props.children[0];
    expect(swrConfig).toBeDefined();
    expect(swrConfig.props.value).toEqual({
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    });

    // Verify the Footer is present
    const footer = body.props.children[1];
    expect(footer).toBeDefined();
    expect(footer.type.name).toBe("Footer");
  });
});
