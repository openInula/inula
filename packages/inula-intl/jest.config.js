module.exports = {
    coverageDirectory: 'coverage',
    resetModules: true,
    preset: 'ts-jest/presets/js-with-ts',
    rootDir: process.cwd(),
    testMatch: [
        '<rootDir>/tests/**/*.test.[jt]s?(x)'
    ],
    moduleFileExtensions: ['ts', 'js', 'jsx', 'tsx'],
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/tests/$1',
    },
    transform: {
        "^.+\\.(ts|js|jsx|tsx)$": "babel-jest"
    },
    globals: {
        "ts-jest": {
            "tsconfig": "tsconfig.json"
        }
    },

    testEnvironment: 'jsdom',
};
