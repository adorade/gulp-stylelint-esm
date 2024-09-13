/* eslint-disable no-console */
/*!
 * Gulp Stylelint (v3.0.0-beta): src/index-test.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import PluginError from '@adorade/plugin-error';
import stylelint from 'stylelint';
const { lint } = stylelint;

import { Transform } from 'node:stream';

import applySourcemap from './apply-sourcemap.mjs';
import reporterFactory from './reporter-factory.mjs';

const pluginName = 'gulp-stylelint-esm';

export default function gStylelintEsm(options) {
  const pluginOptions = {
    // Default values
    failAfterError: true,
    fix: false,
    debug: false,
    reporters: [{ formatter: 'string', console: true }],

    // Overwrite default values with provided options
    ...options
  };

  const reporters = pluginOptions.reporters
    .map(config => reporterFactory(config, pluginOptions));

  const linterOptions = { ...options };

  delete linterOptions.files;
  delete linterOptions.formatter;
  delete linterOptions.cache;

  delete linterOptions.reporters;
  delete linterOptions.debug;

  let lintPromiseList = [];
  let hasErrors = false;
  const files = [];

  function createPluginError(error) {
    if (error instanceof PluginError)
      return error;

    if (error == null)
      error = 'An unknown error occurred!';

    const pluginError = new PluginError(pluginName, error, {
      showStack: Boolean(pluginOptions.debug)
    });

    return pluginError;
  }

  function transformLintResults(originalLintResult) {
    const combinedResult = originalLintResult.reduce((acc, current) => {
      acc.results = [...acc.results, ...current.results];
      acc.ruleMetadata = { ...acc.ruleMetadata, ...current.ruleMetadata };
      acc.reportedDisables = [...acc.reportedDisables, ...current.reportedDisables];
      acc.errored = acc.errored || current.errored;

      return acc;
    }, {
      cwd: originalLintResult[0].cwd,
      errored: false,
      results: [],
      report: '',
      reportedDisables: [],
      ruleMetadata: {}

      // errored: originalLintResult[0].errored,
      // results: originalLintResult[0].results,
      // report: originalLintResult[0].report,
      // reportedDisables: originalLintResult[0].reportedDisables,
      // ruleMetadata: originalLintResult[0].ruleMetadata,
    });

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

    return [combinedResult];
  }

  async function passLintResultsThroughReporters(lintResults) {
    await Promise.all(
      reporters.flatMap(reporter => lintResults.map(lintResult => reporter(lintResult)))
    );

    return lintResults;
  }

  // async function passLintResultsThroughReporters(lintResults) {
  //   const results = await Promise.allSettled(
  //     reporters.flatMap(reporter => lintResults.map(lintResult => reporter(lintResult)))
  //   );

  //   const rejectedResults = results.filter(result => result.status === 'rejected');

  //   if (rejectedResults.length > 0) {
  //     // Handle rejected promises
  //     for (const rejectedResult of rejectedResults) {
  //       const error = rejectedResult.reason;

  //       console.error(`Reporter failed: ${error.message}`);

  //       // You can also log the stack trace if needed
  //       if (pluginOptions.debug) {
  //         console.error(error.stack);
  //       }
  //     }
  //   }

  //   // Return the original lint results after passing through reporters
  //   return lintResults;
  // }

  function countErrors(lintResult) {
    let errorCount = 0;

    lintResult.forEach(item => {
      item.results.forEach(result => {
        const errorWarnings = result.warnings.filter(
          warning => warning.severity === 'error'
        );

        errorCount += errorWarnings.length;
      });
    });

    // for (const item of lintResult) {
    //   for (const result of item.results) {
    //     const errorWarnings = result.warnings.filter(
    //       warning => warning.severity === 'error'
    //     );

    //     errorCount += errorWarnings.length;
    //   }
    // }

    if (pluginOptions.failAfterError && errorCount > 0) {
      const pl = `${errorCount === 1 ? '' : 's'}`;

      throw createPluginError({
        name:     `Stylelint Error${pl}`,
        message:  `Failed with ${errorCount} error${pl}`,
      });
    }
  }

  async function onFile(file, encoding, done) {
    if (file.isNull()) {
      return done(null, file);
    }

    if (file.isStream()) {
      return done(new PluginError(pluginName, 'Streaming is not supported'));
    }

    const localLinterOptions = {
      ...linterOptions,
      code: file.contents.toString(),
      codeFilename: file.path
    };

    try {
      let lintResult = await lint(localLinterOptions);

      if (file.sourceMap && file.sourceMap.mappings) {
        lintResult = await applySourcemap(lintResult, file.sourceMap);
      }

      if (pluginOptions.fix && lintResult.code) {
        file.contents = Buffer.from(lintResult.code);
      }

      if (lintResult.errored) {
        hasErrors = true;
      }

      lintPromiseList.push(lintResult);

      files.push(file);

      done();
    } catch (error) {
      throw createPluginError(error);
    }
  }

  function onStreamEnd(done) {
    Promise
      .all(lintPromiseList)
      .then(transformLintResults)
      .then(passLintResultsThroughReporters)
      .then(lintResults => {
        if (pluginOptions.failAfterError && hasErrors) {
          countErrors.call(this, lintResults);
        } else {
          files.forEach(file => this.push(file));
          done();
        }
      })
      .catch(error => {
        // console.log(error);
        throw createPluginError(error);
      });
  }

  const stream = new Transform({
    objectMode: true,
    transform: onFile,
    flush: onStreamEnd
  });

  return stream.resume();
}
