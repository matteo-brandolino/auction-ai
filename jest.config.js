module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/services", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  modulePathIgnorePatterns: ["<rootDir>/services/.*/package.json"],
  passWithNoTests: true,
  collectCoverageFrom: ["services/**/src/**/*.ts", "!services/**/src/index.ts"],
  testTimeout: 5000,
};
