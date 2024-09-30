/*!
 * Gulp Stylelint (v3.0.0-beta): src/stylish-formatter.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { relative } from 'node:path';
import table from 'text-table';

import colors from 'ansi-colors';
const { blue, green, red, yellow, dim, unstyle } = colors;

import {
  calcSeverityCounts,
  deprecationsFormatter,
  formatMessageText,
  invalidOptionsFormatter,
  pluralize as pl
} from './utils.mjs';

// Symbols for different severity levels
const symbols = {
  info: blue('ℹ'),
  warning: yellow('⚠'),
  error: red('✖'),
  success: green('✔'),
  fixable: blue('✔'),
};

/**
 * @type {import('stylelint').Formatter}
 * @param {import('stylelint').LintResult[]} results
 * @param {import('stylelint').LinterReturnValue} returnValue
 * @returns {string}
 */
export default function stylishFormatter(results, returnValue) {
  let output = invalidOptionsFormatter(results);

  output += deprecationsFormatter(results);

  const resultCounts = { error: 0, warning: 0 };
  const fixableCounts = { error: 0, warning: 0 };
  const metaData = returnValue.ruleMetadata;

  results.forEach((fileResult) => {
    const warnings = fileResult.warnings;
    const fileSource = fileResult.source;

    if (warnings && warnings.length > 0) {
      output += `\n${blue(relative('.', fileSource))}\n`;

      output += table(
        warnings.map((warning) => {
          const symbol = warning.severity === 'error' ? symbols.error : symbols.warning;
          const text = formatMessageText(warning);

          // Update severity counts
          calcSeverityCounts(warning.severity, resultCounts);

          const fixable = metaData?.[warning.rule]?.fixable;
          let ruleFixable = '';

          if (fixable === true) {
            // Update fixable counts
            calcSeverityCounts(warning.severity, fixableCounts);
            ruleFixable = symbols.fixable;
          }

          return [
            '',
            warning.line,
            warning.column,
            symbol,
            text,
            ruleFixable,
            dim(`${warning.rule}`)
          ];
        }),
        {
          align: ['', 'r', 'l', 'c', 'l', 'l', 'l'],
          stringLength(str) {
            return unstyle(str).length;
          },
        },
      )
        .split('\n')
        .map(el => el.replace(/(\d+)\s+(\d+)/u, (_m, p1, p2) => dim(`${p1}:${p2}`)).trimEnd())
        .join('\n');

      output += '\n';
    }
  })

  // Ensure consistent padding
  output = output.trim();

  if (output !== '') {
    output = `\n${output}\n`;

    const errorCount = resultCounts.error;
    const warningCount = resultCounts.warning;
    const total = errorCount + warningCount;

    if (total > 0) {
      const error = red(`${errorCount} error${pl(errorCount)}`);
      const warning = yellow(`${warningCount} warning${pl(warningCount)}`);
      const symbol = errorCount > 0 ? symbols.error : symbols.warning;

      output += `\n${symbol} ${total} problem${pl(total)} (${error}, ${warning})`;
    }

    const fixErrorCount = fixableCounts.error;
    const fixWarningCount = fixableCounts.warning;

    if (fixErrorCount > 0 || fixWarningCount > 0) {
      let fixErrorText;
      let fixWarningText;

      if (fixErrorCount > 0) {
        fixErrorText = red(`${fixErrorCount} error${pl(fixErrorCount)}`);
      }

      if (fixWarningCount > 0) {
        fixWarningText = yellow(`${fixWarningCount} warning${pl(fixWarningCount)}`);
      }

      const countText = [fixErrorText, fixWarningText].filter(Boolean).join(' and ');

      output += `\n  ${countText} potentially fixable with the ${green('"fix: true"')} option.`;
    }

    output += '\n\n';
  }

  return output;
}
