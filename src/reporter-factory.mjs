/*!
 * Gulp Stylelint (v3.0.0-beta): src/reporter-factory.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { gFormatters } from './formatters.mjs';
import writeOutputLog from './writer.mjs';

/**
 * @typedef {import('stylelint').LintResult} LintResult
 * @typedef {import('stylelint').Formatter} Formatter
 * @typedef {(formattedText: string, filePath: string) => Promise<void>} Writer
 *
 * @typedef {Object} Config
 * @property {string | Formatter} formatter
 * @property {boolean} [console]
 * @property {string} [save]
 */

/**
 * Creates a reporter function based on the provided configuration.
 *
 * @param {Config} config
 * @returns {(result: {results: LintResult[]}) => Promise<void[]>}
 */
export default function reporterFactory(config = {}) {
  /**
   * Asynchronous reporter function.
   * @param {Object} result
   * @param {LintResult[]} result.results
   * @returns {Promise<void[]>}
   */
  async function reporter(result) {
    /**
     * The formatter to be used for formatting results.
     * @type {Formatter}
     */
    const formatter = typeof config.formatter === 'string' ?
      await gFormatters[config.formatter] :
      config.formatter;

    /**
     * An array to store asynchronous tasks to be executed by the reporter.
     * @type {Promise<void>[]}
     */
    const asyncTasks = [];

    /**
     * The formatted text produced by the specified formatter.
     * @type {string}
     */
    const formattedText = formatter(result.results, result);

    /**
     * Log the formatted text to the console if console logging is enabled
     * and the text is not empty.
     */
    if (config.console && formattedText.trim()) {
      asyncTasks.push(
        process.stdout.write(formattedText.trimStart())
      );
    }

    /**
     * Saves the formatted text to a log file if configured to do so.
     */
    if (config.log) {
      asyncTasks.push(
        writeOutputLog(config.log, formattedText.trim())
      );
    }

    // Return a promise that resolves when all asynchronous tasks are completed
    return Promise.all(asyncTasks);
  }

  return reporter;
}
