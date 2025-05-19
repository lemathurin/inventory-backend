import 'jest';

// Executed before EACH individual test
beforeEach(() => {
  jest.clearAllMocks(); // Reset all mocks to their initial state
});

// GLOBAL replacement of console functions
global.console = {
  ...console,                    // Keep all original methods
  log: jest.fn(),               // Replace console.log with a mock function
  error: jest.fn(),             // Replace console.error with a mock function
  warn: jest.fn(),              // Replace console.warn with a mock function
};