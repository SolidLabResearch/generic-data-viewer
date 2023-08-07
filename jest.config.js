const esModules = ['(gridjs-react)', 'gridjs', 'jose', '@inrupt'].join('|');

export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
  },
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules})`
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
