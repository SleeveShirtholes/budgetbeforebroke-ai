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
  eq: jest.fn(),
  and: jest.fn(),
  sql: jest.fn(),
  desc: jest.fn(),
  asc: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  inArray: jest.fn(),
  relations: jest.fn(() => ({})),
};
