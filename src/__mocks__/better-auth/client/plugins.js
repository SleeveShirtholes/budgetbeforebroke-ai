export const passkeyClient = () => ({
  register: jest.fn(),
  authenticate: jest.fn(),
  isSupported: jest.fn(() => true),
});
