module.exports = {
  drizzle: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: {
      budgetAccounts: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      incomeSources: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      debts: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    },
  })),
};
