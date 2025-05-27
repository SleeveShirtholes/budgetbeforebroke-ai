// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

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
