module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node"
  ],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/tests/**/*.test.[jt]s?(x)"],
  testPathIgnorePatterns: [
    "\\\\node_modules\\\\"
  ],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.(ts|tsx)$": "babel-jest"
  },
};
