/*!
 * Gulp Stylelint (v3.0.0): test/index.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { dest, src } from 'gulp';

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { stub } from 'sinon';

import gStylelintEsm from '../src/index.mjs';

import { createVinylFile } from './testUtils/createVinil.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function fixtures(glob) {
  return path.join(__dirname, 'fixtures', glob);
}

describe('Plugin Functionality', () => {
  it('should not throw when no arguments are passed', (done) => {
    expect(() => { gStylelintEsm(); }).not.toThrow();
    done();
  });
  it('should emit an error on streamed file', (done) => {
    const stream = src(fixtures('basic.css'), {
      buffer: false
    });

    stream
      .pipe(gStylelintEsm())
      .on('error', (error) => {
        expect(error.message).toBe('Streaming is not supported');
      });

    done();
  });
  it('should not emit an error on buffered file', (done) => {
    const stream = src(fixtures('basic.css'), {
      buffer: true
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
  it('should NOT throw an error when configuration is set', (done) => {
    const stream = src(fixtures('basic.css'))
      .pipe(
        gStylelintEsm({
          config: { rules: {} }
        })
      );

    expect(() => { stream; }).not.toThrow();
    done();
  });
  it('should throw an error when configuration is NOT set', async () => {
    const stream = gStylelintEsm();

    const file = createVinylFile('basic.css', '.foo { color: #f00; }');

    const done = stub();

    stream._transform(file, 'utf-8', done);

    await expect(async () => {
      await stream._flush(done);
    }).rejects.toThrow('No configuration provided');
  });
  it('should throw an error when linter complains', async () => {
    const stream = gStylelintEsm({
      config: { rules: { 'color-hex-length': 'short' } },
      reporters: []
    });

    const file = createVinylFile('invalid.css', '.foo { color: #ffffff; }');

    const done = stub();

    stream._transform(file, 'utf-8', done);

    await expect(async () => {
      await stream._flush(done);
    }).rejects.toThrow('Failed with 1 error');
  });
  it('should ignore file', async () => {
    const stream = src([fixtures('basic.css'), fixtures('invalid.css')]);

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
  it('should overwrite the source file when `fix` option is set', async () => {
    stub(process.stdout, 'write');
    const outputDir = path.resolve(__dirname, '../tmpa');

    const file = createVinylFile('invalid.css', '.foo {\n  color: #ffffff;\n}\n');
    const content = file.contents.toString('utf8');
    const outputFilePath = path.join(outputDir, 'invalid.css');

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFilePath, content, 'utf8');

    const stream = src(outputFilePath);

    expect.assertions(1);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            config: { rules: { 'color-hex-length': 'short' } },
            fix: true
          }))
          .on('error', reject)
          .on('finish', resolve);
      });

      const outputFileContents = fs.readFileSync(outputFilePath, 'utf8');

      expect(outputFileContents).toBe('.foo {\n  color: #fff;\n}\n');
    } catch (error) {
      throw new Error(`Unexpected error: ${error}`);
    } finally {
      fs.unlinkSync(outputFilePath);
      fs.rmdirSync(outputDir);
      process.stdout.write.restore();
    }
  });
  it('should fix the file without emitting errors', async () => {
    stub(process.stdout, 'write');
    const inputDir = path.resolve(__dirname, '../tmpb');
    const outputDir = path.resolve(__dirname, '../tmpc');

    const file = createVinylFile('invalid.css', '.foo {\n  color: #ffffff;\n}\n');
    const content = file.contents.toString('utf8');

    const inputFilePath = path.join(inputDir, 'invalid.css');
    const outputFilePath = path.join(outputDir, 'invalid.css');

    fs.mkdirSync(inputDir, { recursive: true });
    fs.writeFileSync(inputFilePath, content, 'utf8');

    const stream = src(inputFilePath);

    expect.assertions(1);

    try {
      await new Promise((resolve, reject) => {
        stream
          .pipe(gStylelintEsm({
            config: { rules: { 'color-hex-length': 'short' } },
            fix: true
          }))
          .on('error', reject)
          .pipe(dest(outputDir))
          .on('finish', resolve);
      });

      const outputFileContents = fs.readFileSync(outputFilePath, 'utf8');

      expect(outputFileContents).toBe('.foo {\n  color: #fff;\n}\n');
    } catch (error) {
      throw new Error(`Unexpected error: ${error}`);
    } finally {
      fs.unlinkSync(inputFilePath);
      fs.unlinkSync(outputFilePath);
      fs.rmdirSync(inputDir);
      fs.rmdirSync(outputDir);
      process.stdout.write.restore();
    }
  });
});
