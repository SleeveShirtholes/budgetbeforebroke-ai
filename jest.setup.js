// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Configure testing-library
import { configure } from "@testing-library/react";

configure({
  testIdAttribute: "data-testid",
});

// Increase the default timeout for userEvent
jest.setTimeout(10000);
