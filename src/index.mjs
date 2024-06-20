/*!
 * Gulp Stylelint (v2.0.0): src/index.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

/**
 * @typedef {Object} LintOptions
 * @property {string} [code] - The CSS code to lint.
 * @property {string} [codeFilename] - The filename associated with the CSS code.
 */

/**
 * @typedef {Object} PluginOptions
 * @property {boolean} [failAfterError=true] - Whether to fail the Gulp task after encountering lint errors.
 * @property {boolean} [debug=false] - Whether to enable debug mode.
 * @property {Object[]} [reporters] - Configuration for custom reporters.
 */

/**
 * @typedef {Object} ReporterConfig
 * @property {Function} reporter - The custom reporter function.
 * @property {Object} options - Options for the custom reporter.
 */

import PluginError from '@adorade/plugin-error';
import stylelint from 'stylelint';
const { lint } = stylelint;

import { Transform } from 'node:stream';

import applySourcemap from './apply-sourcemap.mjs';
import reporterFactory from './reporter-factory.mjs';

/**
 * The name of the Gulp plugin.
 * @type {string}
 */
const pluginName = 'gulp-stylelint-esm';

/**
 * Gulp plugin for linting CSS using stylelint.
 * @param {PluginOptions} options - Options for the Gulp plugin.
 * @returns {NodeJS.ReadWriteStream} - A Gulp transform stream.
 */
export default function gStylelintEsm(options) {
  /**
   * Merges default options with user-provided options.
   * @type {PluginOptions}
   */
  const pluginOptions = Object.assign({
    failAfterError: true,
    debug: false
  }, options);

  /**
   * Creates an array of reporter instances based on the provided configuration and plugin options.
   * @param {Object} pluginOptions - Options for the plugin.
   * @param {Object[]} pluginOptions.reporters - An array of reporter configurations.
   * @returns {Reporter[]} An array of instantiated reporter instances.
   * @type {Function[]}
   */
  const reporters = (pluginOptions.reporters || [])
    .map(config => reporterFactory(config, pluginOptions));

  /**
   * Options for linting, excluding properties not relevant to stylelint.
   * @type {LintOptions}
   */
  const lintOptions = Object.assign({}, options);

  // --- Remove the stylelint options that cannot be used:
  delete lintOptions.files;     // css code will be provided by gulp instead
  delete lintOptions.formatter; // formatters are defined in the `reporters` option
  delete lintOptions.cache;     // gulp caching should be used instead

  // --- Remove plugin options so that they don't interfere with stylelint options:
  delete lintOptions.reportOutputDir;
  delete lintOptions.reporters;
  delete lintOptions.debug;

  /**
   * List to store lint promises for each file.
   * @type {Promise[]}
   */
  const lintPromiseList = [];

  /**
   * Handles each file in the stream, performs linting, and processes the results.
   *
   * Note that the files are not modified and are pushed
   * back to their pipes to allow usage of other plugins.
   *
   * @param {File} file - Piped file.
   * @param {string} encoding - File encoding.
   * @param {Function} done - Callback function to signal completion.
   * @returns {undefined} Nothing is returned (done callback is usedinstead).
   */
  function onFile(file, encoding, done) {
    if (file.isNull()) {
      return done(null, file);
    }

    /**
     * Check if the file is a stream, emit an error if true, and return.
     * @type {boolean}
     */
    if (file.isStream()) {
      return done(new PluginError(pluginName, 'Streaming is not supported'));
    }

    /**
     * Options for linting the current file.
     * @type {Object}
     */
    const localLintOptions = Object.assign({}, lintOptions, {
      code: file.contents.toString(),
      codeFilename: file.path
    });

    /**
     * Promise for linting piped file(s) and processing the lint results.
     * @type {Promise<Object>}
     */
    const lintPromise = lint(localLintOptions)
      .then(lintResult => {
        /**
         * Apply sourcemap to lint result if sourcemap is present in the file.
         * @type {Object}
         */
        return file.sourceMap && file.sourceMap.mappings ?
          applySourcemap(lintResult, file.sourceMap) :
          lintResult;
      })
      .then(lintResult => {
        /**
         * If fix option is enabled and there are fixes in the lint result, update file contents.
         * @type {boolean}
         */
        if (lintOptions.fix && lintResult.code) {
          file.contents = Buffer.from(lintResult.code);
        }

        // Signal completion of processing for the piped file(s)
        done(null, file);

        return lintResult;
      })
      .catch(error => {
        // Signal completion of processing for the current file with an error
        done(null, file);

        // Propagate the error
        return Promise.reject(error);
      });

    // Add the lint promise to the list
    lintPromiseList.push(lintPromise);
  }

  /**
   * Passes lint results through user-defined reporters.
   * @param {import('stylelint').LinterResult[]} lintResults - Results of stylelint for each file.
   * @returns {Promise<import('stylelint').LinterResult[]>} - Promise resolving to lint results.
   */
  async function passLintResultsThroughReporters(lintResults) {
    /**
     * Array of promises representing the execution of each configured reporter.
     * @type {Promise[]}
     */
    await Promise.all(
      /**
       * Map each reporter to a promise of its execution with the accumulated warnings.
       * @param {Function} reporter - Reporter function.
       * @returns {Promise} A promise representing the execution of a reporter.
       */
      reporters.flatMap(reporter => lintResults.map(lintResult => reporter(lintResult)))
    );

    // Return the original lint results after passing through reporters
    return lintResults;
  }

  /**
   * Checks if a warning has an error severity.
   * @param {Object} warning - Stylelint warning object.
   * @returns {boolean} - True if the severity is 'error', false otherwise.
   */
  function isErrorSeverity(warning) {
    return warning.severity === 'error';
  }

  /**
   * Handles the end of the stream, emitting errors if necessary.
   * @param {Function} done - Callback function to signal completion of the stream.
   * @returns {undefined} Nothing is returned (done callback is usedinstead).
   */
  function onStreamEnd(done) {
    /**
     * Promise that resolves with lint results after all lint promises are settled.
     * @type {Promise<Array<Object>>}
     */
    Promise
      .all(lintPromiseList)
      .then(passLintResultsThroughReporters)
      .then(lintResults => {
        /**
         * Schedule the execution of a callback on the next tick of the event loop.
         * @type {Function}
         */
        process.nextTick(() => {
          /**
           * Count of errors in lint results.
           * If the file was skipped, then res.results will be []
           * for example, by .stylelintignore or `options.ignorePath`
           * @type {number}
           */
          const errorCount = lintResults
            .filter(res => res.results.length)
            .reduce((sum, res) => {
              return sum + res.results[0].warnings.filter(isErrorSeverity).length;
            }, 0);

          /**
           * Emit an error and trigger the completion callback if there are errors and failAfterError is enabled.
           */
          if (pluginOptions.failAfterError && errorCount > 0) {
            this.emit('error', new PluginError(
              pluginName,
              `Failed with ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`
            ));
          }

          // Signal completion of the stream
          done();
        });
      })
      .catch(error => {
        /**
         * Schedule the execution of a callback on the next tick of the event loop.
         * @type {Function}
         */
        process.nextTick(() => {
          /**
           * Emit an error and trigger the completion callback with an error if an exception occurs.
           */
          this.emit('error', new PluginError(pluginName, error, {
            showStack: Boolean(pluginOptions.debug)
          }));

          // Signal completion of the stream
          done();
        });
      });
  }

  /**
   * Gulp transform stream for linting CSS files using stylelint.
   * @type {NodeJS.ReadWriteStream}
   */
  const stream = new Transform({
    objectMode: true,
    transform: onFile,
    flush: onStreamEnd
  });

  // Resuming the stream
  return stream.resume();
}
