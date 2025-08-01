module.exports = {
  neon: jest.fn(() => {
    const mockSql = jest.fn();
    mockSql.setTypeParser = jest.fn();
    return mockSql;
  }),
};
