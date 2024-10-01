/*!
 * Gulp Stylelint (v3.0.0): test/sourcemap.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { src } from 'gulp';

import gulpCleanCss from 'gulp-clean-css';
import gulpConcat from 'gulp-concat';

import path from 'node:path';
import url from 'node:url';

import gStylelintEsm from '../src/index.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function fixtures(glob) {
  return path.join(__dirname, 'fixtures', glob);
}

describe('Sourcemap Handling', () => {
  it('should emit no errors when stylelint rules are satisfied', (done) => {
    const stream = src(fixtures('original-*.css'), {
        sourcemaps: true
      })
      .pipe(gStylelintEsm({
        config: { rules: {} },
        reporters: []
      }));

    stream.on('finish', () => {
      done();
    });
  });

  xit('should apply sourcemaps correctly when using a custom sourcemap file', async () => {
    const stream = src(fixtures('original-*.css'), { sourcemaps: true });

    expect.assertions(5);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gulpCleanCss())
          .pipe(gulpConcat('concatenated.css'))
          .pipe(gStylelintEsm({
            config: {rules: { 'declaration-no-important': true }},
            reporters: [{
              /**
               * @param {import('stylelint').LintResult[]} results
               */
              formatter(results) {
                results.forEach((result) => {
                  switch (path.basename(result.source)) {
                    case 'original-a.css':
                      expect(result.warnings[0].line).toBe(2);
                      expect(result.warnings[0].column).toBe(9);
                      break;
                    case 'original-b.css':
                      expect(result.warnings[0].line).toBe(2);
                      expect(result.warnings[0].column).toBe(9);
                      break;
                  }
                });
              }
            }]
          }))
          .on('error', reject)
          .on('finish', resolve);
      });
    } catch (error) {
      expect(error.message).toBe('Failed with 1 error');
    }
  });
  xit('should ignore sourcemaps with no sources', async () => {
    const stream = src(fixtures('original-*.css'), { sourcemaps: true });

    expect.assertions(5);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            config: {rules: { 'declaration-no-important': true }},
            reporters: [{
              /**
               * @param {import('stylelint').LintResult[]} results
               */
              formatter(results) {
                results.forEach((result) => {
                  switch (path.basename(result.source)) {
                    case 'original-a.css':
                      expect(result.warnings[0].line).toBe(2);
                      expect(result.warnings[0].column).toBe(15);
                      break;
                    case 'original-b.css':
                      expect(result.warnings[0].line).toBe(2);
                      expect(result.warnings[0].column).toBe(15);
                      break;
                  }
                });
              }
            }]
          }))
          .on('error', reject)
          .on('finish', resolve);
      });
    } catch (error) {
      expect(error.message).toBe('Failed with 2 errors');
    }
  });
});
