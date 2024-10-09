/*!
 * Gulp Stylelint (v3.0.0): test/testutils/cleanOutput.js
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
symbolConversions.set('♻', 'o');

/**
 * Cleans and transforms the output string by removing ANSI styling and replacing certain symbols.
 *
 * @param {string} output - The original output string to be cleaned.
 * @returns {string} The cleaned and transformed output string.
 */
function getCleanOutput(output) {
  let cleanOutput = unstyle(output).trim();

  for (const [nix, win] of symbolConversions.entries()) {
    cleanOutput = cleanOutput.replace(new RegExp(nix, 'g'), win);
  }

  return cleanOutput;
}

/**
 * Cleans and formats the output of a Stylelint formatter.
 *
 * @param {import('stylelint').Formatter} formatter - The Stylelint formatter function to be used.
 * @param {import('stylelint').LintResult[]} results - An array of Stylelint lint results to be formatted.
 * @param {Pick<import('stylelint').LinterResult, 'ruleMetadata'>} [returnValue={ ruleMetadata: {} }] - Optional return value with rule metadata.
 * @returns {string} The cleaned and formatted output string.
 */
export function cleanFormatterOutput(formatter, results, returnValue = { ruleMetadata: {} }) {
  return getCleanOutput(formatter(results, returnValue));
}
