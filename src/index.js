/*!
 * Gulp Stylelint (v1.1.1): src/index.js
 * Copyright (c) 2023 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import PluginError from 'plugin-error';
import stylelint from 'stylelint';
const { formatters, lint } = stylelint;

import { Transform } from 'node:stream';

import applySourcemap from './apply-sourcemap.js';
import reporterFactory from './reporter-factory.js';

/**
 * Name of this plugin for reporting purposes.
 * @type {String}
 */
const pluginName = 'gulp-stylelint-esm';

/**
 * Stylelint results processor.
 * @param {Object} [options] - Plugin options.
 * @param {String} [options.reportOutputDir] - Common path for all reporters.
 * @param {[Object]} [options.reporters] - Reporter configurations.
 * @param {Boolean} [options.failAfterError] - If true, the process will end with non-zero error code if any error was raised.
 * @param {Boolean} [options.debug] - If true, error stack will be printed.
 * @return {stream} Object stream usable in Gulp pipes.
 */
function gStylelintEsm(options) {
  /**
   * Plugin options with defaults applied.
   * @type Object
   */
  const pluginOptions = Object.assign({
    failAfterError: true,
    debug: false
  }, options);

  /**
   * Lint options for stylelint's `lint` function.
   * @type Object
   */
  const lintOptions = Object.assign({}, options);

  /**
   * List of gulp-stylelint reporters.
   * @type [Function]
   */
  const reporters = (pluginOptions.reporters || [])
    .map(config => reporterFactory(config, pluginOptions));

  /**
   * List of stylelint's lint result promises.
   * @type [Promise]
   */
  const lintPromiseList = [];

  // Remove the stylelint options that cannot be used:
  delete lintOptions.files; // css code will be provided by gulp instead
  delete lintOptions.formatter; // formatters are defined in the `reporters` option
  delete lintOptions.cache; // gulp caching should be used instead

  // Remove gulp-stylelint-esm options so that they don't interfere with stylelint options:
  delete lintOptions.reportOutputDir;
  delete lintOptions.reporters;
  delete lintOptions.debug;

  /**
   * Launches linting of a given file, pushes promises to the promise list.
   *
   * Note that the files are not modified and are pushed
   * back to their pipes to allow usage of other plugins.
   *
   * @param {File} file - Piped file.
   * @param {String} encoding - File encoding.
   * @param {Function} done - File pipe completion callback.
   * @return {undefined} Nothing is returned (done callback is used instead).
   */
  function onFile(file, encoding, done) {
    if (file.isNull()) {
      done(null, file);

      return;
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(pluginName, 'Streaming is not supported'));
      done();

      return;
    }

    const localLintOptions = Object.assign({}, lintOptions, {
      code: file.contents.toString(),
      codeFilename: file.path
    });

    const lintPromise = lint(localLintOptions)
      .then(lintResult => {
        // Checking for the presence of sourceMap.mappings
        // in case sourcemaps are initialized, but still empty:
        return file.sourceMap && file.sourceMap.mappings ?
          applySourcemap(lintResult, file.sourceMap) :
          lintResult;
      })
      .then(lintResult => {
        if (lintOptions.fix && lintResult.output) {
          file.contents = Buffer.from(lintResult.output);
        }

        done(null, file);

        return lintResult;
      })
      .catch(error => {
        done(null, file);

        return Promise.reject(error);
      });

    lintPromiseList.push(lintPromise);
  }

  /**
   * Provides Stylelint result to reporters.
   * @param {[Object]} lintResults - Stylelint results.
   * @return {Promise} Resolved with original lint results.
   */
  function passLintResultsThroughReporters(lintResults) {
    const warnings = lintResults
      .reduce((accumulated, res) => accumulated.concat(res.results), []);

    return Promise
      .all(reporters.map(reporter => reporter(warnings)))
      .then(() => lintResults);
  }

  /**
   * Determines if the severity of a stylelint warning is "error".
   * @param {Object} warning - Stylelint results warning.
   * @return {Boolean} True if warning's severity is "error", false otherwise.
   */
  function isErrorSeverity(warning) {
    return warning.severity === 'error';
  }

  /**
   * Resolves promises and provides accumulated report to reporters.
   * @param {Function} done - Stream completion callback.
   * @return {undefined} Nothing is returned (done callback is used instead).
   */
  function onStreamEnd(done) {
    Promise
      .all(lintPromiseList)
      .then(passLintResultsThroughReporters)
      .then(lintResults => {
        process.nextTick(() => {
          // if the file was skipped, for example, by .stylelintignore, then res.results will be []
          const errorCount = lintResults.filter(res => res.results.length).reduce((sum, res) => {
            return sum + res.results[0].warnings.filter(isErrorSeverity).length;
          }, 0);

          if (pluginOptions.failAfterError && errorCount > 0) {
            this.emit('error', new PluginError(pluginName, `Failed with ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`));
          }

          done();
        });
      })
      .catch(error => {
        process.nextTick(() => {
          this.emit('error', new PluginError(pluginName, error, {
            showStack: Boolean(pluginOptions.debug)
          }));
          done();
        });
      });
  }

  const stream = new Transform({
    objectMode: true,
    highWaterMark: 16,
    transform: onFile,
    flush: onStreamEnd
  });

  return stream.resume();
}

/**
 * Formatters bundled with stylelint by default.
 *
 * User may want to see the list of available formatters,
 * proxy them or pass them as functions instead of strings.
 *
 * @type {Object}
 */
gStylelintEsm.formatters = formatters;

export default gStylelintEsm;
