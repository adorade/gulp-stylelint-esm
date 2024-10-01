/*!
 * Gulp Stylelint (v3.0.0-beta): test/writer.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';

import colors from 'ansi-colors';

import { writeOutputLog } from '../src/writer.mjs';

const __dirname = fileURLToPath(new URL('../', import.meta.url));

describe('Writer Function', () => {
  it('writer should creates a file', async () => {
    const logFilePath = path.resolve(__dirname, 'foo.txt');

    expect.assertions(2);

    try {
      await writeOutputLog(logFilePath, 'test content');

      expect((await fs.stat(logFilePath)).isFile()).toBe(true);
      expect((await fs.readFile(logFilePath)).toString()).toBe('test content');
    } catch (e) {
      throw new Error(`Failed to create log file: ${e.message}`);
    } finally {
      fs.unlink(logFilePath);
    }
  });
  it('writer should creates a directory if it does not exist', async () => {
    const tmpDir = path.resolve(__dirname, 'tmp');
    const logFilePath = path.join(tmpDir, 'foo.txt');

    expect.assertions(3);

    try {
      await writeOutputLog(logFilePath, 'test content');

      expect((await fs.stat(tmpDir)).isDirectory()).toBe(true);
      expect((await fs.stat(logFilePath)).isFile()).toBe(true);
      expect((await fs.readFile(logFilePath)).toString()).toBe('test content');
    } catch (e) {
      throw new Error(`Failed to create log file: ${e.message}`);
    } finally {
      fs.rm(path.dirname(logFilePath), { recursive: true });
    }
  });
  it('writer should strip colors from formatted output', async () => {
    const logFilePath = path.resolve(__dirname, 'foo.txt');

    expect.assertions(1);

    try {
      await writeOutputLog(logFilePath, colors.blue('test content'));

      expect((await fs.readFile(logFilePath)).toString()).toBe('test content');
    } catch (e) {
      throw new Error(`Failed to create log file: ${e.message}`);
    } finally {
      fs.unlink(logFilePath);
    }
  });
});
