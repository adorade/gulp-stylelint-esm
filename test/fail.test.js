/*!
 * Gulp Stylelint (v2.2.0): test/fail-after-error.test.js
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
  test('should not fail after emitting no errors if `failAfterError` is not configured', async () => {
    const stream = gulp.src(fixtures('basic.css'));

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          config: { rules: {} }
        }))
        .on('error', (error) => {
          expect(error).toBe(undefined);
          resolve;
        })
        .on('finish', resolve);
    });
  });
  test('should not fail after emitting no errors if `failAfterError` is set to true', async () => {
    const stream = gulp.src(fixtures('basic.css'));

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: true,
          config: { rules: {} }
        }))
        .on('error', (error) => {
          expect(error).toBe(undefined);
          resolve;
        })
        .on('finish', resolve);
    });
  });
  test('should not fail after emitting no errors if `failAfterError` is set to false', async () => {
    const stream = gulp.src(fixtures('basic.css'));

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: false,
          config: { rules: {} }
        }))
        .on('error', (error) => {
          expect(error).toBe(undefined);
          resolve;
        })
        .on('finish', resolve);
    });
  });
  test('should fail after emitting an error if `failAfterError` is not configured', async () => {
    const stream = gulp.src(fixtures('invalid.css'));
    let errorEmitted = false;

    expect.assertions(2);

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          config: { rules: { 'color-hex-length': 'short' } },
        }))
        .on('error', (error) => {
          errorEmitted = true;
          expect(error.message).toBe('Failed with 1 error');
          resolve;
        })
        .on('finish', resolve);
    });

    expect(errorEmitted).toBe(true);
  });
  test('should fail after emitting errors if `failAfterError` is not configured', async () => {
    const stream = gulp.src(fixtures('invalids.css'));
    let errorEmitted = false;

    expect.assertions(2);

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          config: { rules: { 'color-hex-length': 'short' } },
        }))
        .on('error', (error) => {
          errorEmitted = true;
          expect(error.message).toBe('Failed with 2 errors');
          resolve;
        })
        .on('finish', resolve);
    });

    expect(errorEmitted).toBe(true);
  });
  test('should fail after emitting an error if `failAfterError` is set to true', async () => {
    const stream = gulp.src(fixtures('invalid.css'));
    let errorEmitted = false;

    expect.assertions(2);

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: true,
          config: { rules: { 'color-hex-length': 'short' } },
        }))
        .on('error', (error) => {
          errorEmitted = true;
          expect(error.message).toBe('Failed with 1 error');
          resolve;
        })
        .on('finish', resolve);
    });

    expect(errorEmitted).toBe(true);
  });
  test('should fail after emitting errors if `failAfterError` is set to true', async () => {
    const stream = gulp.src(fixtures('invalids.css'));
    let errorEmitted = false;

    expect.assertions(2);

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: true,
          config: { rules: { 'color-hex-length': 'short' } },
        }))
        .on('error', (error) => {
          errorEmitted = true;
          expect(error.message).toBe('Failed with 2 errors');
          resolve;
        })
        .on('finish', resolve);
    });

    expect(errorEmitted).toBe(true);
  });
  test('should not fail after emitting an error if `failAfterError` is set to false', async () => {
    const stream = gulp.src(fixtures('invalid.css'));
    let errorEmitted = false;

    expect.assertions(1);

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: false,
          config: { rules: { 'color-hex-length': 'short' } },
        }))
        .on('error', () => {
          errorEmitted = true;
          resolve;
        })
        .on('finish', resolve);
    });

    expect(errorEmitted).toBe(false);
  });
  test('should not fail after emitting errors if `failAfterError` is set to false', async () => {
    const stream = gulp.src(fixtures('invalids.css'));
    let errorEmitted = false;

    expect.assertions(1);

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: false,
          config: { rules: { 'color-hex-length': 'short' } },
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
