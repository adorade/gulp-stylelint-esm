/*!
 * Gulp Stylelint (v3.0.0): src/apply-sourcemap.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import {TraceMap, originalPositionFor} from '@jridgewell/trace-mapping';

/**
 * @typedef {Object} Warning
 * @property {number} line
 * @property {number} column
 *
 * @typedef {Object} Result
 * @property {string} source
 * @property {Warning[]} warnings
 *
 * @typedef {Object} LintResult
 * @property {Result[]} results
 */

/**
 * Applies source map to the lint result.
 *
 * @param {LintResult} lintResult - The result of the linting process
 * @param {Object} sourceMap - The source map object
 * @returns {Promise<LintResult>} The lint result with applied source map
 */
export default async function applySourcemap(lintResult, sourceMap) {
  /** @type {TraceMap} */
  const sourceMapConsumer = new TraceMap(sourceMap);

  lintResult.results = lintResult.results.reduce((memo, result) => {
    if (result.warnings.length) {
      result.warnings.forEach(warning => {
        /** @type {import('@jridgewell/trace-mapping').OriginalMapping} */
        const origPos = originalPositionFor(sourceMapConsumer, warning);

        const sameSourceResultIndex = memo.findIndex(r => r.source === origPos.source);

        warning.line = origPos.line;
        warning.column = origPos.column;

        if (sameSourceResultIndex === -1) {
          memo.push(Object.assign({}, result, {
            source: origPos.source,
            warnings: [warning]
          }));
        } else {
          memo[sameSourceResultIndex].warnings.push(warning);
        }
      });
    } else {
      memo.push(result);
    }

    return memo;
  }, /** @type {Result[]} */ ([]));

  return lintResult;
}
