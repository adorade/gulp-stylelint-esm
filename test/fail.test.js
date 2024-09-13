/*!
 * Gulp Stylelint (v3.0.0-beta): test/fail.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import gulp from 'gulp';

import path from 'node:path';
import url from 'node:url';

import gStylelintEsm from '../src/index.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function fixtures(glob) {
  return path.join(__dirname, 'fixtures', glob);
}

describe('Fail after error', () => {
  it('should NOT FAIL after emitting no errors if `failAfterError` is not configured', async () => {
    const stream = gulp.src(fixtures('basic.css'));

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          config: { rules: {} },
          reporters: []
        }))
        .on('error', (error) => {
          expect(error).toBe(undefined);
          resolve;
        })
        .on('finish', resolve);
    });
  });
  it('should NOT FAIL after emitting no errors if `failAfterError` is set to true', async () => {
    const stream = gulp.src(fixtures('basic.css'));

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: true,
          config: { rules: {} },
          reporters: []
        }))
        .on('error', (error) => {
          expect(error).toBe(undefined);
          resolve;
        })
        .on('finish', resolve);
    });
  });
  it('should NOT FAIL after emitting no errors if `failAfterError` is set to false', async () => {
    const stream = gulp.src(fixtures('basic.css'));

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: false,
          config: { rules: {} },
          reporters: []
        }))
        .on('error', (error) => {
          expect(error).toBe(undefined);
          resolve;
        })
        .on('finish', resolve);
    });
  });

  xit('should FAIL after emitting an error if `failAfterError` is not configured', async () => {
    const stream = gulp.src(fixtures('invalid.css'));
    let errorEmitted = false;

    expect.assertions(2);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            config: { rules: { 'color-hex-length': 'short' } },
          }))
          .on('error', (error) => {
            errorEmitted = true;
            reject(error);
          })
          .on('finish', resolve);
      });
    } catch (error) {
      expect(error.message).toBe('Failed with 1 error');
    }

    expect(errorEmitted).toBe(true);
  });
  xit('should FAIL after emitting an error if `failAfterError` is set to true', async () => {
    const stream = gulp.src(fixtures('invalid.css'));
    let errorEmitted = false;

    expect.assertions(2);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            failAfterError: true,
            config: { rules: { 'color-hex-length': 'short' } },
          }))
          .on('error', (error) => {
            errorEmitted = true;
            reject(error);
          })
          .on('finish', resolve);
      });
    } catch (error) {
      expect(error.message).toBe('Failed with 1 error');
    }

    expect(errorEmitted).toBe(true);
  });

  it('should NOT FAIL after emitting an error if `failAfterError` is set to false', async () => {
    const stream = gulp.src(fixtures('invalid.css'));
    let errorEmitted = false;

    expect.assertions(1);

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: false,
          config: { rules: { 'color-hex-length': 'short' } },
          reporters: []
        }))
        .on('error', () => {
          errorEmitted = true;
          resolve;
        })
        .on('finish', resolve);
    });

    expect(errorEmitted).toBe(false);
  });
});
