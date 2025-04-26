import RootLayout from "../layout";

// Mock the Inter font
jest.mock("next/font/google", () => ({
  Inter: () => ({
    className: "inter-font",
    subsets: ["latin"],
  }),
}));

// Mock the Header component
jest.mock("@/components/Header", () => {
  return function MockHeader() {
    return <header data-testid="header">Mock Header</header>;
  };
});

describe("RootLayout", () => {
  it("renders with correct structure and props", async () => {
    const testContent = "Test Content";
    const layout = await RootLayout({ children: <div>{testContent}</div> });

    // Verify the root structure
    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("en");

    const body = layout.props.children;
    expect(body.type).toBe("body");
    expect(body.props.className).toBe("inter-font");

    // Verify the body contains Header and main
    const [header, main] = body.props.children;
    expect(header.type.name).toBe("MockHeader");
    expect(main.type).toBe("main");
    expect(main.props.className).toBe("pt-16");

    // Verify the main content
    expect(main.props.children.props.children).toBe(testContent);
  });
});
