/*!
 * Gulp Stylelint (v2.0.0): test/sourcemap.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import gulp from 'gulp';
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
  test('should emit no errors when stylelint rules are satisfied', (done) => {
    const stream = gulp.src(fixtures('original-*.css'), {
        sourcemaps: true
      })
      .pipe(gStylelintEsm({
        config: { rules: {} }
      }));

    stream.on('finish', () => {
      done();
    });
  });
  test('should apply sourcemaps correctly when using a custom sourcemap file', async () => {
    const originalFiles = ['original-a.css', 'original-b.css'];
    const stream = gulp.src(fixtures('original-*.css'), { sourcemaps: true });

    expect.assertions(6);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gulpCleanCss())
          .pipe(gulpConcat('concatenated.css'))
          .pipe(gStylelintEsm({
            config: {rules: { 'declaration-no-important': true }},
            reporters: [{
              formatter(result) {
                expect(result.map(r => r.source)).toEqual(originalFiles);
                expect(result[0].warnings[0].line).toBe(2);
                expect(result[0].warnings[0].column).toBe(9);
                expect(result[1].warnings[0].line).toBe(2);
                expect(result[1].warnings[0].column).toBe(9);
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
  test('should ignore sourcemaps with no sources', async () => {
    const originalFiles = [fixtures('original-a.css'), fixtures('original-b.css')];
    const stream = gulp.src(fixtures('original-*.css'), { sourcemaps: true });

    expect.assertions(6);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            config: {rules: { 'declaration-no-important': true }},
            reporters: [{
              formatter(result) {
                expect(result.map(r => r.source)).toEqual(originalFiles);
                expect(result[0].warnings[0].line).toBe(2);
                expect(result[0].warnings[0].column).toBe(15);
                expect(result[1].warnings[0].line).toBe(2);
                expect(result[1].warnings[0].column).toBe(15);
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
