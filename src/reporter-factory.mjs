/*!
 * Gulp Stylelint (v2.0.0-dev): src/reporter-factory.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import fancyLog from 'fancy-log';

/**
 * @typedef {Object} FormatterConfig
 * @property {string|Function} formatter - The formatter to be used for formatting results.
 * @property {boolean} [console=true] - Whether to log the formatted text to the console.
 * @property {string} [save] - The file path to save the formatted text to.
 */

import { gFormatters } from './formatters.mjs';
import writer from './writer.mjs';

/**
 * Factory function for creating reporters based on the provided configuration.
 * @param {FormatterConfig} [config={}] - Configuration for the reporter.
 * @param {Object} [options={}] - Additional options.
 * @returns {Function} - Reporter function.
 */
export default function reporterFactory(config = {}, options = {}) {
  /**
   * Asynchronous reporter function.
   * @param {Object[]} results - Results to be reported.
   * @returns {Promise<void>} - A promise that resolves when the reporting is complete.
   */
  async function reporter(results) {
    /**
     * The formatter to be used for formatting results.
     * @type {string|Function}
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
    const formattedText = formatter(results);

    /**
     * Log the formatted text to the console if console logging is enabled and the text is not empty.
     */
    if (config.console && formattedText.trim()) {
      asyncTasks.push(
        fancyLog.info(`\n${formattedText}\n`)
      );
    }

    /**
     * Saves the formatted text to a file if configured to do so.
     */
    if (config.save) {
      asyncTasks.push(
        writer(formattedText, config.save, options.reportOutputDir)
      );
    }

    // Return a promise that resolves when all asynchronous tasks are completed.
    return Promise.all(asyncTasks);
  }

  return reporter;
}
