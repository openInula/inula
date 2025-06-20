export default {
  preset: "ts-jest",
  testMatch: ["**/__tests__/*.test.[jt]s?(x)"],
  globals: {
    __DEV__: true,
  },
  testEnvironment: 'jsdom'
};
