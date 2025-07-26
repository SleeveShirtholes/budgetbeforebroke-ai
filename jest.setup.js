// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Global mocks for database
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => {
    const mockSql = jest.fn();
    mockSql.setTypeParser = jest.fn();
    return mockSql;
  }),
}));

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}));

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
