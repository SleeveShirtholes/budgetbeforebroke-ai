const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next/image$": "<rootDir>/src/__mocks__/next/image.js",
    "^better-auth$": "<rootDir>/src/__mocks__/better-auth.js",
    "^better-auth/(.*)$": "<rootDir>/src/__mocks__/better-auth/$1",
  },
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  // Allow ESM modules for problematic packages
  transformIgnorePatterns: [
    "/node_modules/(?!(uncrypto|better-auth|nanostores|better-call|@floating-ui|react-hook-form|nanoid)/)",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx|mjs)$": ["babel-jest", { presets: ["next/babel"] }],
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
