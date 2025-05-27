export const createAuthClient = jest.fn(() => ({
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    updateUser: jest.fn(),
    useSession: jest.fn(() => ({ data: { user: { name: "Test User", email: "test@example.com" } } })),
}));
