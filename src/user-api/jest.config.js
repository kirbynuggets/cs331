module.exports = {
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/client/'],
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1'
    }
  };