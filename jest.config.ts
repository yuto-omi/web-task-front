import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["<rootDir>/tests/**/*.test.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  cacheDirectory: "/home/omi/.jest-cache",
};

export default config;
