module.exports = {
    "transform": {
      "^.+\\.(t|j)sx?$": ["@swc/jest"]
    },
    "testEnvironment": "node",
    "testMatch": [ "**/*.test.ts" ],
    moduleNameMapper: { "^~/(.*)$": "<rootDir>/$1" },
    "testTimeout": 10000
  };