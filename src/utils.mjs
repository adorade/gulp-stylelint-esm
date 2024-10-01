/*!
 * Gulp Stylelint (v3.0.0): src/utils.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import colors from 'ansi-colors';
const { red, yellow, dim, underline } = colors;

/**
 * @import {Severity} from 'stylelint'
 *
 * @param {Severity} severity
 * @param {Record<Severity, number>} counts
 * @returns {void}
 */
export function calcSeverityCounts(severity, counts) {
  switch (severity) {
    case 'error':
      counts.error += 1;
      break;
    case 'warning':
      counts.warning += 1;
      break;
    default:
      throw new Error(`Unknown severity: "${severity}"`);
  }
}

/**
 * @param {import('stylelint').LintResult[]} results
 * @returns {string}
 */
export function deprecationsFormatter(results) {
  const allDeprecationWarnings = results.flatMap((result) => result.deprecations || []);

  if (allDeprecationWarnings.length === 0) {
    return '';
  }

  const seenText = new Set();
  const lines = [];

  for (const { text, reference } of allDeprecationWarnings) {
    if (seenText.has(text)) continue;

    seenText.add(text);

    let line = ` ${dim('-')} ${text}`;

    if (reference) {
      line += dim(` See: ${underline(reference)}`);
    }

    lines.push(line);
  }

  return ['', yellow('Deprecation warnings:'), ...lines, ''].join('\n');
}

/**
 * @param {import('stylelint').LintResult[]} results
 * @return {string}
 */
export function invalidOptionsFormatter(results) {
  const allInvalidOptionWarnings = results.flatMap((result) =>
    (result.invalidOptionWarnings || []).map((warning) => warning.text),
  );
  const uniqueInvalidOptionWarnings = [...new Set(allInvalidOptionWarnings)];

  return uniqueInvalidOptionWarnings.reduce((output, warning) => {
    output += red('Invalid Option: ');
    output += warning;

    return `${output}\n`;
  }, '\n');
}

/**
 * Format the message text to be displayed in the console.
 *
 * @param {import('stylelint').Warning} message
 * @return {string}
 */
export function formatMessageText(message) {
  let result = message.text;

  // Remove all control characters (newline, tab and etc)
  result = result.replace(/[\u0001-\u001A]+/g, ' ').replace(/\.$/, ''); // eslint-disable-line no-control-regex

  const ruleString = ` (${message.rule})`;

  if (result.endsWith(ruleString)) {
    result = result.slice(0, result.lastIndexOf(ruleString));
  }

  return result;
}

/**
 * pluralize - Returns the plural form of the given word.
 *
 * @param {number} count
 * @returns {string}
 */
export const pluralize = (count) => count === 1 ? '' : 's';
