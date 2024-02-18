/*!
 * Gulp Stylelint (v2.0.0-dev): test/writer.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import colors from 'ansi-colors';
import { stub } from 'sinon';

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import writer from '../src/writer.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const tmpDir = path.resolve(__dirname, '../tmp');

describe('Writer Function', () => {
  test('writer should write to cwd if base dir is not specified', async () => {
    stub(process, 'cwd').returns(tmpDir);
    const reportFilePath = path.join(process.cwd(), 'foo.txt');

    expect.assertions(2);

    try {
      await writer('footext', 'foo.txt');

      expect(fs.statSync(reportFilePath).isFile()).toBe(true);
      expect(fs.readFileSync(reportFilePath, 'utf8')).toBe('footext');
    } catch (e) {
      throw new Error(`Failed to create report file: ${e.message}`);
    } finally {
      process.cwd.restore();
      fs.unlinkSync(reportFilePath);
      fs.rmdirSync(tmpDir);
    }
  });
  test('writer should write to a base folder if it is specified', async () => {
    stub(process, 'cwd').returns(tmpDir);
    const reportDirPath = path.join(process.cwd(), 'foodir');
    const reportSubdirPath = path.join(reportDirPath, '/subdir');
    const reportFilePath = path.join(reportSubdirPath, 'foo.txt');

    expect.assertions(2);

    try {
      await writer('footext', 'foo.txt', `${tmpDir}/foodir/subdir`);

      expect(fs.statSync(reportFilePath).isFile()).toBe(true);
      expect(fs.readFileSync(reportFilePath, 'utf8')).toBe('footext');
    } catch (e) {
      throw new Error(`Failed to create report file: ${e.message}`);
    } finally {
      process.cwd.restore();
      fs.unlinkSync(reportFilePath);
      fs.rmdirSync(reportSubdirPath);
      fs.rmdirSync(reportDirPath);
      fs.rmdirSync(tmpDir);
    }
  });
  test('writer should strip colors from formatted output', async () => {
    stub(process, 'cwd').returns(tmpDir);
    const reportFilePath = path.join(process.cwd(), 'foo.txt');

    expect.assertions(1);

    try {
      await writer(colors.blue('footext'), 'foo.txt')

      expect(fs.readFileSync(reportFilePath, 'utf8')).toBe('footext');
    } catch (e) {
      throw new Error(`Failed to create report file: ${e.message}`);
    } finally {
      process.cwd.restore();
      fs.unlinkSync(reportFilePath);
      fs.rmdirSync(tmpDir);
    }
  });
});
