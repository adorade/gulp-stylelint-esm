/*!
 * Gulp Stylelint (v3.0.0-beta): test/testutils/cleanOutput.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import colors from 'ansi-colors';
const { unstyle } = colors;

const symbolConversions = new Map();

symbolConversions.set('ℹ', 'i');
symbolConversions.set('✔', '√');
symbolConversions.set('⚠', '‼');
symbolConversions.set('✖', '×');

/**
 * @param {string} output
 * @returns {string}
 */
function getCleanOutput(output) {
  let cleanOutput = unstyle(output).trim();

  for (const [nix, win] of symbolConversions.entries()) {
    cleanOutput = cleanOutput.replace(new RegExp(nix, 'g'), win);
  }

  return cleanOutput;
}

/**
 * @param {import('stylelint').Formatter} formatter
 * @param {import('stylelint').LintResult[]} results
 * @param {Pick<import('stylelint').LinterResult, 'ruleMetadata'>} [returnValue]
 * @returns {string}
 */
export function cleanFormatterOutput(formatter, results, returnValue = { ruleMetadata: {} }) {
  return getCleanOutput(formatter(results, returnValue));
}
