/*!
 * Gulp Stylelint (v3.0.0): jest.config.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 *
 * https://jestjs.io/docs/configuration
 * ========================================================================== */

/** @type {import('jest').Config} */
const config =  {
  displayName: {
    name: "Gulp Stylelint Plugin",
    color: "cyan",
  },
  clearMocks: true,
  collectCoverageFrom: [
    "src/*.mjs"
  ],
  coverageDirectory: "./.coverage/",
  coverageReporters: [
    "html",
    "text"
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  // fakeTimers: {
  //   enableGlobally: true,
  // },
  transform: {
    "\\.mjs?$": "babel-jest"
  },
  roots: ["test"],
  testRegex: ".*\\.test\\.js$"
}

export default config;
