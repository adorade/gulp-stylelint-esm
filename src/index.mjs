/*!
 * Gulp Stylelint (v3.0.0-beta): src/index.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import PluginError from '@adorade/plugin-error';
import stylelint from 'stylelint';
const { lint } = stylelint;

import { Transform } from 'node:stream';

import applySourcemap from './apply-sourcemap.mjs';
import { overwriteSource } from '../src/writer.mjs';
import reporterFactory from './reporter-factory.mjs';

/**
 * @typedef {import('stylelint').LinterOptions} LinterOptions
 * @typedef {import('stylelint').LinterResult} LinterResult
 * @typedef {import('vinyl')} File
 *
 * @typedef {Object} PluginOptions
 * @property {boolean} [failAfterError=true] - Whether to fail the Gulp task after encountering lint errors
 * @property {boolean} [fix=false] - Whether to automatically fix lint issues
 * @property {boolean} [debug=false] - Whether to enable debug mode
 * @property {Array<Object>} [reporters] - Configuration for custom reporters
 */

/**
 * The name of the Gulp plugin.
 * @type {string}
 */
const pluginName = 'gulp-stylelint-esm';

/**
 * Gulp plugin for Stylelint.
 *
 * @param {LinterOptions & PluginOptions} options - Combined Stylelint and plugin options
 * @returns {Transform} A transform stream for processing files
 */
export default function gStylelintEsm(options) {
  /**
   * Merges default options with user-provided options.
   * @type {Required<PluginOptions>}
   */
  const pluginOptions = {
    // Default values
    failAfterError: true,
    fix: false,
    debug: false,
    reporters: [{ formatter: 'stylish', console: true }],

    // Overwrite default values with provided options
    ...options
  };

  /**
   * Creates an array of reporter instances based on the provided configuration and plugin options.
   * @param {Object} pluginOptions - Options for the plugin
   * @param {Object[]} pluginOptions.reporters - An array of reporter configurations
   * @returns {Reporter[]} An array of instantiated reporter instances
   * @type {Function[]}
   */
  const reporters = pluginOptions.reporters
    .map(config => reporterFactory(config, pluginOptions));

  /**
   * Options for linting, excluding properties not relevant to stylelint.
   * @type {LinterOptions}
   */
  const linterOptions = { ...options };

  // --- Remove the stylelint options that cannot be used:
  delete linterOptions.files;     // css code will be provided by gulp instead
  delete linterOptions.formatter; // formatters are defined in the `reporters` option
  delete linterOptions.cache;     // gulp caching should be used instead

  // --- Remove plugin options so that they don't interfere with stylelint options:
  delete linterOptions.reporters;
  delete linterOptions.debug;

  /**
   * List to store lint promises for each file.
   * @type {Promise<LinterResult>[]}
   */
  let lintPromiseList = [];
  let hasErrors = false;    // Track whether any errors occur
  const files = [];         // Track all files for gulp

  /**
   * Creates a PluginError instance from an error object or string.
   *
   * @param {Error | string | null} error - The error object or string
   * @returns {PluginError} - A PluginError instance
   */
  const createPluginError = (error) => {
    if (error instanceof PluginError)
      return error;

    if (error == null)
      error = 'An unknown error occurred!';

    const pluginError = new PluginError(pluginName, error, {
      showStack: Boolean(pluginOptions.debug)
    });

    return pluginError;
  };

  /**
   * Transforms the lint results into a single result object.
   *
   * @param {LinterResult[]} originalLintResult - Original lint results
   * @returns {LinterResult[]} - Transformed lint results
   */
  const transformLintResults = (originalLintResult) => {
    // Combine all results into a single object
    const combinedResult = originalLintResult.reduce((acc, current) => {
      // Merge results arrays
      acc.results = [...acc.results, ...current.results];

      // Merge ruleMetadata objects
      acc.ruleMetadata = { ...acc.ruleMetadata, ...current.ruleMetadata };

      // Merge reportedDisables arrays
      acc.reportedDisables = [...acc.reportedDisables, ...current.reportedDisables];

      // Set errored to true if any result has errored
      acc.errored = acc.errored || current.errored;

      return acc;
    }, {
      cwd: originalLintResult[0].cwd,
      errored: false,
      results: [],
      report: '',
      reportedDisables: [],
      ruleMetadata: {}
    });

    // Generate the report string
    combinedResult.report = JSON.stringify(
      combinedResult.results.map(result => ({
        source: result.source,
        deprecations: result.deprecations,
        invalidOptionWarnings: result.invalidOptionWarnings,
        parseErrors: result.parseErrors,
        errored: result.errored,
        warnings: result.warnings
      }))
    );

    // Return the transformed result as a single-element array
    return [combinedResult];
  };

  /**
   * Passes lint results through user-defined reporters.
   *
   * @param {LinterResult[]} lintResults - Results of stylelint for each file
   * @returns {Promise<LinterResult[]>} - Promise resolving to lint results
   */
  const passLintResultsThroughReporters = async (lintResults) => {
    /**
     * Array of promises representing the execution of each configured reporter.
     * @type {Promise[]}
     */
    await Promise.all(
      /**
       * Map each reporter to a promise of its execution with the accumulated warnings.
       * @param {Function} reporter - Reporter function
       * @returns {Promise} A promise representing the execution of a reporter
       */
      reporters.flatMap(reporter => lintResults.map(lintResult => reporter(lintResult)))
    );

    // Return the original lint results after passing through reporters
    return lintResults;
  };

  /**
   * Count of errors in lint results.
   *
   * @param {LinterResult[]} lintResult
   * @type {Function} - Function to count errors in lint results
   * @returns {undefined} - Nothing is returned
   * @throws {PluginError} - If an error occurs during the counting process
   */
  const countErrors = (lintResult) => {
    /**
     * Count of errors in lint results.
     * @type {number}
     */
    let errorCount = 0;

    for (const item of lintResult) {
      for (const result of item.results) {
        const errorWarnings = result.warnings.filter(
          warning => warning.severity === 'error'
        );

        errorCount += errorWarnings.length;
      }
    }

    /**
     * Emit an error and trigger the completion callback if there
     * are errors and `failAfterError` is enabled.
     */
    if (pluginOptions.failAfterError && errorCount > 0) {
      const pl = `${errorCount === 1 ? '' : 's'}`;

      throw createPluginError({
        name:     `Stylelint Error${pl}`,
        message:  `Failed with ${errorCount} error${pl}`,
      });
    }
  };

  /**
   * Creates a promise for linting a single file.
   *
   * @param {File} file - Vinyl file object
   * @param {LinterOptions} lintOptions - Options for linting
   * @returns {Promise<LinterResult>} - Promise resolving to lint results
   * @throws {PluginError} - If an error occurs during linting
   */
  const createLintPromise = async (file, lintOptions) => {
    /**
     * Options for linting the current file.
     * @type {LinterOptions}
     */
    const localLinterOptions = {
      ...lintOptions,
      code: file.contents.toString(),
      codeFilename: file.path,
    };

    try {
      /**
       * Promise for linting piped file(s) and processing the lint results.
       * @type {Promise<Object>}
       */
      let lintResult = await lint(localLinterOptions);

      /**
       * Apply sourcemap to lint result if sourcemap is present in the file.
       * @type {Object}
       */
      if (file.sourceMap && file.sourceMap.mappings) {
        lintResult = await applySourcemap(lintResult, file.sourceMap);
      }

      /**
       * If fix option is enabled and there are fixes in the lint result, update file contents.
       * @type {boolean}
       */
      if (pluginOptions.fix && lintResult.code !== file.contents.toString()) {
        file.contents = Buffer.from(lintResult.code);

        /**
         * Overwrite the source file with the fixed code.
         * @type {Function}
         */
        await overwriteSource(file, lintResult.code);
      }

      /**
       * If there are lint errors, set file contents to null to prevent further processing.
       * @type {boolean}
       */
      if (lintResult.errored) {
        hasErrors = true;
      }

      /**
       * Return the lint result.
       * @type {Object}
       */
      return lintResult;
    } catch (error) {
      /**
       * Throw a PluginError if an error occurs during linting.
       * @type {PluginError}
       */
      throw createPluginError(error);
    }
  };

  /**
   * Handles each file in the stream, performs linting, and processes the results.
   *
   * NOTE: files are pushed back to the their pipes only if there are no errors,
   *       to allow usage of other plugins.
   *
   * @param {File} file - Vinyl file object
   * @param {string} encoding - File encoding
   * @param {Function} done - Callback function to signal completion
   */
  const onFile = (file, encoding, done) => {
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
     * Promise for linting the current file.
     * @type {Promise<Object>}
     */
    const lintPromise = new Promise((resolve, reject) => {
      createLintPromise(file, linterOptions)
        .then(lintResult => resolve(lintResult))
        .catch(error => reject(error));
    });

    /**
     * Add the lint promise to the list.
     * @type {Promise<Object>}
     */
    lintPromiseList.push(lintPromise);

    /**
     * Push the file back to the stream.
     * @type {File}
     */
    files.push(file);

    // Don't push the file back to the stream yet
    done();
  };

  /**
   * Handles the end of the stream, emitting errors if necessary.
   *
   * @param {Function} done - Callback function to signal completion of the stream
   */
  const onStreamEnd = async function(done) {
    if (lintPromiseList.length === 0) {
      return done();
    }

    try {
      /**
       * Array of lint results.
       * @type {LinterResult[]}
       */
      const lintResults = await Promise.all(lintPromiseList);

      /**
       * Transformed lint results.
       * @type {LinterResult[]}
       */
      const transformedResults = transformLintResults(lintResults);

      /**
       * Passed lint results through user-defined reporters.
       * @type {LinterResult[]}
       */
      const reportedResults = await passLintResultsThroughReporters(transformedResults);

      /**
       * Check if there were any errors.
       * @type {boolean}
       */
      if (pluginOptions.failAfterError && hasErrors) {
        // If failAfterError is enabled and there were no errors,
        // we don't push any files back
        countErrors(reportedResults);
      } else {
        // If no errors, we can push all files back to the stream pipe
        files.forEach(file => this.push(file));
        done();
      }
    } catch (error) {
      /**
       * Ender the stream with an error.
       * @type {Function}
       */
      done(error);

      /**
       * Throw a PluginError if an error occurs during linting.
       * @type {PluginError}
       */
      throw createPluginError(error);
    }
  };

  /**
   * Gulp transform stream for linting CSS files using stylelint.
   *
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
