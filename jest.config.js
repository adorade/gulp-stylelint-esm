/*!
 * Gulp Stylelint (v2.1.0): jest.config.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

/** @type {import('jest').Config} */
const config =  {
  clearMocks: true,
  // collectCoverage: true,
  collectCoverageFrom: [
    "src/*.mjs"
  ],
  coverageDirectory: "./.coverage/",
  coverageReporters: [
    "html",
    "lcov",
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
  transform: {
    "\\.mjs?$": "babel-jest"
  },
  roots: ["test"],
  testRegex: ".*\\.test\\.js$"
}

export default config;
