export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  setupFiles: ['<rootDir>/jest.setup.js'],
  silent: true,
};
