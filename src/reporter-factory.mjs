/*!
 * Gulp Stylelint (v2.0.0-dev): src/reporter-factory.js
 * Copyright (c) 2023 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import fancyLog from 'fancy-log';
import stylelint from 'stylelint';
const { formatters } = stylelint;

import { writer } from './writer.mjs';

/**
 * Factory function for creating a stylelint reporter based on the provided configuration and options.
 *
 * @param {Object} config - Configuration options for the reporter.
 * @param {string} [config.formatter] - The formatter to use. Can be a string or a custom formatter function.
 * @param {boolean} [config.console] - Whether to log the formatted text to the console.
 * @param {boolean} [config.save] - Whether to save the formatted text to a file.
 * @param {Object} options - Additional options for the reporter.
 * @param {string} [options.reportOutputDir] - The directory where the report file should be saved.
 * @returns {Function} A function that acts as a stylelint reporter based on the provided configuration.
 */
export function reporterFactory(config = {}, options = {}) {
  /**
   * The formatter to use for formatting lint results.
   *
   * User has a choice of passing a custom formatter function,
   * or a name of formatter bundled with stylelint by default.
   *
   * @type {(string|Function)}
   */
  const formatter = typeof config.formatter === 'string' ?
    formatters[config.formatter] :
    config.formatter;

  /**
   * Stylelint reporter function that processes lint results and performs specified actions.
   *
   * @param {Object} results - Results of stylelint linting.
   * @returns {Promise<Array>} A promise resolving with the results of asynchronous tasks performed by the reporter.
   */
  return function reporter(results) {
    /**
     * An array to store asynchronous tasks to be executed by the reporter.
     * @type {Array<Promise>}
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
     * Save the formatted text to a file if saving is enabled.
     */
    if (config.save) {
      asyncTasks.push(
        writer(formattedText, config.save, options.reportOutputDir)
      );
    }

    // Return a promise that resolves when all asynchronous tasks are completed.
    return Promise.all(asyncTasks);
  };
}
