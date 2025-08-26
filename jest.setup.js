// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.RESEND_API_KEY = "test-resend-key";
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.SUPPORT_TEAM_EMAIL = "support@test.com";

// Global mocks for database
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(() => {
    const mockSql = jest.fn();
    mockSql.setTypeParser = jest.fn();
    return mockSql;
  }),
}));

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: "test-email-id" }),
    },
  })),
}));

// Mock react-hot-toast for tests
jest.mock("react-hot-toast", () => {
  const React = require("react");
  return {
    Toaster: () => React.createElement("div", { "data-testid": "toaster" }),
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      loading: jest.fn(),
      dismiss: jest.fn(),
    },
  };
});

// Configure testing-library
import { configure } from "@testing-library/react";

configure({
  testIdAttribute: "data-testid",
});

// Increase the default timeout for userEvent
jest.setTimeout(10000);

// Add TextDecoder to global
global.TextDecoder = class TextDecoder {
  decode() {
    return "";
  }
};

// Add TextEncoder to global
if (!global.TextEncoder) {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      // Simple UTF-8 encoding mock
      return new Uint8Array(Array.from(str).map((c) => c.charCodeAt(0)));
    }
  };
}

// Mock global Request, Response, Headers for Next.js server APIs
if (typeof global.Request === "undefined") {
  global.Request = function () {};
}
if (typeof global.Response === "undefined") {
  global.Response = function () {};
}
if (typeof global.Headers === "undefined") {
  global.Headers = function () {};
}

// Mock crypto.randomUUID
if (typeof global.crypto === "undefined") {
  global.crypto = {
    randomUUID: () => "00000000-0000-0000-0000-000000000000",
  };
} else if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () => "00000000-0000-0000-0000-000000000000";
}

// Mock ResizeObserver for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock canvas for Chart.js
const mockCanvasContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  // Additional methods that Chart.js might need
  setLineDash: jest.fn(),
  setLineWidth: jest.fn(),
  setStrokeStyle: jest.fn(),
  setFillStyle: jest.fn(),
  setFont: jest.fn(),
  setTextAlign: jest.fn(),
  setTextBaseline: jest.fn(),
  setGlobalAlpha: jest.fn(),
  setGlobalCompositeOperation: jest.fn(),
  setShadowColor: jest.fn(),
  setShadowBlur: jest.fn(),
  setShadowOffsetX: jest.fn(),
  setShadowOffsetY: jest.fn(),
  setLineCap: jest.fn(),
  setLineJoin: jest.fn(),
  setMiterLimit: jest.fn(),
  setLineDashOffset: jest.fn(),
  setImageSmoothingEnabled: jest.fn(),
  setImageSmoothingQuality: jest.fn(),
};

// Mock HTMLCanvasElement
if (typeof HTMLCanvasElement !== "undefined") {
  Object.defineProperty(global.HTMLCanvasElement.prototype, "getContext", {
    value: jest.fn(() => mockCanvasContext),
  });

  Object.defineProperty(global.HTMLCanvasElement.prototype, "toBlob", {
    value: jest.fn(),
  });
  Object.defineProperty(
    global.HTMLCanvasElement.prototype,
    "getBoundingClientRect",
    {
      value: jest.fn(() => ({ width: 100, height: 100, top: 0, left: 0 })),
    },
  );

  // Mock canvas width and height
  Object.defineProperty(global.HTMLCanvasElement.prototype, "width", {
    get: () => 100,
    set: jest.fn(),
  });

  Object.defineProperty(global.HTMLCanvasElement.prototype, "height", {
    get: () => 100,
    set: jest.fn(),
  });
}
