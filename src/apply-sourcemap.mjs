/*!
 * Gulp Stylelint (v2.0.0-dev): src/apply-sourcemap.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import {TraceMap, originalPositionFor} from '@jridgewell/trace-mapping';

/**
 * Applies a sourcemap to stylelint lint results, updating warning positions.
 * @param {Object} lintResult - Stylelint lint results.
 * @param {Object} sourceMap - Source map object.
 * @returns {Promise<Object>} - Promise resolving to updated lint results with sourcemap applied.
 */
export default async function applySourcemap(lintResult, sourceMap) {
  /**
   * Source map consumer for the provided source map.
   * @type {TraceMap}
   */
  const sourceMapConsumer = new TraceMap(sourceMap);

  /**
   * Applies sourcemap to lint results, updating warning positions.
   * @type {Object[]}
   */
  lintResult.results = lintResult.results.reduce((memo, result) => {
    if (result.warnings.length) {
      result.warnings.forEach(warning => {
        /**
         * Original position information for the warning from the sourcemap.
         * @type {Object}
         */
        const origPos = originalPositionFor(sourceMapConsumer, warning);

        /**
         * Index of a result with the same source in the memo array.
         * @type {number}
         */
        const sameSourceResultIndex = memo.findIndex(r => r.source === origPos.source);

        // Update warning properties with original position information
        warning.line = origPos.line;
        warning.column = origPos.column;

        // Add or update result in the memo array based on the source file
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
  }, []);

  // Return the updated lint results after applying the source map
  return lintResult;
}
