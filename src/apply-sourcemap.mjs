/*!
 * Gulp Stylelint (v2.0.0-dev): src/apply-sourcemap.js
 * Copyright (c) 2023 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { SourceMapConsumer } from 'source-map';

/**
 * Applies a source map to stylelint lint results, updating warning positions based on the original source.
 *
 * @param {Object} lintResult - Results of stylelint linting.
 * @param {Object} sourceMap - Source map object to be applied.
 * @returns {Promise<Object>} A promise resolving with the updated lint results after applying the source map.
 */
export async function applySourcemap(lintResult, sourceMap) {
  /**
   * A SourceMapConsumer instance created from the provided source map.
   * @type {SourceMapConsumer}
   */
  const sourceMapConsumer = await new SourceMapConsumer(sourceMap);

  /**
   * Update lint results by mapping warning positions to their original positions in the source code.
   * @type {Array<Object>}
   */
  lintResult.results = lintResult.results.reduce((memo, result) => {
    if (result.warnings.length) {
      result.warnings.forEach(warning => {
        /**
         * Original position information for the warning obtained from the source map.
         * @type {Object}
         */
        const origPos = sourceMapConsumer.originalPositionFor(warning);

        /**
         * Index of the result with the same source file in the memo array.
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

  /**
   * Destroy the SourceMapConsumer if a destroy method is available.
   */
  if (typeof sourceMapConsumer.destroy === 'function') {
    sourceMapConsumer.destroy();
  }

  // Return the updated lint results after applying the source map
  return lintResult;
}
