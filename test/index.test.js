/*!
 * Gulp Stylelint (v2.1.0): test/index.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import gulp from 'gulp';

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import gStylelintEsm from '../src/index.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function fixtures(glob) {
  return path.join(__dirname, 'fixtures', glob);
}

describe('Plugin Functionality', () => {
  test('should not throw when no arguments are passed', (done) => {
    expect(() => { gStylelintEsm(); }).not.toThrow();
    done();
  });
  test('should emit an error on streamed file', (done) => {
    const stream = gulp.src(fixtures('basic.css'), {
      buffer: false,
    });

    stream
      .pipe(gStylelintEsm())
      .on('error', (error) => {
        expect(error.message).toBe('Streaming is not supported');
      });

    done();
  });
  test('should not emit an error on buffered file', (done) => {
    const stream = gulp.src(fixtures('basic.css'), {
      buffer: true,
    });

    stream
      .pipe(gStylelintEsm({
        config: { rules: {} }
      }))
      .on('error', (error) => {
        expect(error).toBe(undefined);
      });

    done();
  });
  test('should NOT emit an error when configuration is set', async () => {
    const stream = gulp.src(fixtures('basic.css'));

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            config: { rules: {} }
          }))
          .on('error', reject)
          .on('finish', resolve);
      });
    } catch (error) {
      throw new Error(`Unexpected error: ${error}`);
    }
  });
  test('should emit an error when configuration is NOT set', async () => {
    const stream = gulp.src(fixtures('basic.css'));

    expect.assertions(1);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm())
          .on('error', () => reject(new Error('Error emitted')))
          .on('finish', resolve);
      });
    } catch (error) {
      expect(error.message).toBe('Error emitted');
    }
  });
  test('should emit an error when linter complains', async () => {
    const stream = gulp.src(fixtures('invalid.css'));

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            config: { rules: { 'color-hex-length': 'short' } }
          }))
          .on('error', () => reject(new Error('Error emitted')))
          .on('finish', resolve);
      });
    } catch (error) {
      expect(error.message).toBe('Error emitted');
    }
  });
  test('should ignore file', async () => {
    const stream = gulp.src([fixtures('basic.css'), fixtures('invalid.css')]);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            config: { rules: { 'color-hex-length': 'short' } },
            ignorePath: fixtures('ignore')
          }))
          .on('finish', resolve)
          .on('error', reject);
      });
    } catch (error) {
      throw new Error(`Unexpected error: ${error}`);
    }
  });
  test('should fix the file without emitting errors', async () => {
    const inputFilePath = fixtures('invalid.css');
    const outputDir = path.resolve(__dirname, '../tmp');
    const outputFilePath = path.join(outputDir, 'invalid.css');

    const stream = gulp.src(inputFilePath, {
      sourcemaps: true,
    });

    expect.assertions(1);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            config: { rules: { 'color-hex-length': 'short' } },
            fix: true,
          }))
          .on('error', reject)
          .pipe(gulp.dest(outputDir))
          .on('finish', resolve);
      });

      const outputFileContents = fs.readFileSync(outputFilePath, 'utf8');

      expect(outputFileContents).toBe('.foo {\n  color: #fff;\n}\n');
    } catch (error) {
      throw new Error(`Unexpected error: ${error}`);
    } finally {
      fs.unlinkSync(outputFilePath);
      fs.rmdirSync(outputDir);
    }
  });
  test('should emit an error if there was a finish event with failAfterError', async () => {
    const stream = gulp.src(fixtures('invalid.css'));

    expect.assertions(1);

    await new Promise((resolve) => {
      stream
        .pipe(gStylelintEsm({
          failAfterError: true,
          config: { rules: { 'color-hex-length': 'short' } },
        }))
        .on('error', (error) => {
          expect(error.message).toBe('Failed with 1 error');
          resolve();
        })
        .on('finish', () => {
          throw new Error('There should be no finish event');
        });
    });
  });
});
