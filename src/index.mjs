/*!
 * Gulp Stylelint (v2.0.0-dev): src/index.js
 * Copyright (c) 2023 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import PluginError from 'plugin-error';
import stylelint from 'stylelint';
const { formatters, lint } = stylelint;

import { Transform } from 'node:stream';

import { applySourcemap } from './apply-sourcemap.mjs';
import { reporterFactory } from './reporter-factory.mjs';

/**
 * The name of the gulp-stylelint-esm plugin.
 * @type {string}
 */
const pluginName = 'gulp-stylelint-esm';

/**
 * Gulp plugin for stylelint with ES module support.
 *
 * @param {Object} options - Options for the plugin.
 * @param {string} options.reportOutputDir - Common path for all reporters.
 * @param {[Object]} options.reporters - Reporter configurations.
 * @param {boolean} options.failAfterError - Whether to fail the Gulp task after encountering errors.
 * @param {boolean} options.debug - Whether to enable debugging mode.
 * @returns {stream.Transform} A transform stream for processing files in Gulp pipes.
 */
function gStylelintEsm(options) {
  /**
   * The merged options for the plugin.
   * @type {Object}
   */
  const pluginOptions = Object.assign({
    failAfterError: true,
    debug: false
  }, options);

  /**
   * Creates an array of reporter instances based on the provided configuration and plugin options.
   *
   * @param {Object} pluginOptions - Options for the plugin.
   * @param {Array<Object>} pluginOptions.reporters - An array of reporter configurations.
   * @returns {Array<Reporter>} An array of instantiated reporter instances.
   *
   * @type {Array<Function>}
   */
  const reporters = (pluginOptions.reporters || [])
    .map(config => reporterFactory(config, pluginOptions));

  /**
   * Lint options for stylelint's `lint` function.
   * @type {Object}
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
   * A list of lint promises to be resolved for each file in the stream.
   * @type {Array<Promise>}
   */
  let lintPromiseList = [];

  /**
   * Handles each file in the stream, performs linting, and processes the results.
   *
   * Note that the files are not modified and are pushed
   * back to their pipes to allow usage of other plugins.
   *
   * @param {File} file - Piped file.
   * @param {string} encoding - File encoding.
   * @param {Function} done - File pipe callback function to signal completion.
   * @returns {undefined} Nothing is returned (done callback is used instead).
   */
  async function onFile(file, encoding, done) {
    /**
     * Check if the file is null (empty).
     * @type {boolean}
     */
    if (file.isNull()) {
      return done(null, file);
    }

    /**
     * Check if the file is a stream, emit an error if true, and return.
     * @type {boolean}
     */
    if (file.isStream()) {
      this.emit('error', new PluginError(pluginName, 'Streaming is not supported'));

      return done();
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
   * Passes lint results through configured reporters and awaits their execution.
   * @param {Array<Object>} lintResults - Results of linting for each file.
   * @returns {Promise<Array<Object>>} A promise resolving to lint results after passing through reporters.
   */
  async function passLintResultsThroughReporters(lintResults) {
    /**
     * Combine lint results into a single array of warnings.
     * @type {Array<Object>}
     */
    const warnings = lintResults
      .reduce((accumulated, res) => accumulated.concat(res.results), []);

    /**
     * Array of promises representing the execution of each configured reporter.
     * @type {Array<Promise>}
     */
    await Promise.all(
      /**
       * Map each reporter to a promise of its execution with the accumulated warnings.
       * @param {Function} reporter - Reporter function.
       * @returns {Promise} A promise representing the execution of a reporter.
       */
      reporters.map(reporter => reporter(warnings))
    );

    // Return the original lint results after passing through reporters
    return lintResults;
  }

  /**
   * Checks if a warning has an error severity.
   *
   * @param {Object} warning - Stylelint warning object.
   * @returns {boolean} True if the severity is 'error', false otherwise.
   */
  function isErrorSeverity(warning) {
    return warning.severity === 'error';
  }

  /**
   * Handles the end of the stream, resolves lint promises, and triggers error reporting or completion.
   *
   * @param {Function} done - Callback function to signal completion of the stream.
   * @returns {undefined} Nothing is returned (done callback is used instead).
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
            this.emit('error', new PluginError(pluginName, `Failed with ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`));
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
   * The transform stream for processing files.
   * @type {stream.Transform}
   */
  const stream = new Transform({
    objectMode: true,
    transform: onFile,
    flush: onStreamEnd
  });

  // Resuming the stream
  return stream.resume();
}

/**
 * The formatters available for use with the Gulp Stylelint plugin.
 * `formatters` bundled with stylelint by default.
 *
 * @type {Object}
 */
gStylelintEsm.formatters = formatters;

// Exporting the Gulp Stylelint plugin as the default export
export default gStylelintEsm;
