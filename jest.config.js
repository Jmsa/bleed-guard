/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  testMatch: [
    "**/reporters/jest/jest.spec.ts",
    "**/detection.spec.ts"
  ]
};