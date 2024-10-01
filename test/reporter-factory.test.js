/*!
 * Gulp Stylelint (v3.0.0): test/reporter-factory.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import { stub } from 'sinon';

import reporterFactory from '../src/reporter-factory.mjs';

const __dirname = fileURLToPath(new URL('../', import.meta.url));

describe('Reporter Functionality', () => {
  it('reporter factory should return a function with a default reporter', () => {
    expect(typeof reporterFactory()).toBe('function');
  });
  it('reporter factory should return a function with a custom reporter', () => {
    expect(typeof reporterFactory('custom')).toBe('function');
  });
  it('reporter should return a promise', () => {
    const reporter = reporterFactory({
      formatter() {
        // empty formatter
      },
    });

    expect(typeof reporter({}).then).toBe('function');
  });
});
describe('Reporter Behavior with console', () => {
  it('reporter should write to console when console param is true', () => {
    stub(process.stdout, 'write');
    const reporter = reporterFactory({
      formatter() { return 'foo'; },
      console: true
    });

    reporter({});

    expect(process.stdout.write.calledWith('foo')).toBeTruthy();

    process.stdout.write.restore();
  });
  it('reporter should NOT write to console when console param is false', () => {
    stub(process.stdout, 'write');
    const reporter = reporterFactory({
      formatter() { return 'foo'; },
      console: false
    });

    reporter({});

    expect(process.stdout.write.called).toBeFalsy();

    process.stdout.write.restore();
  });
  it('reporter should NOT write to console if formatter returned only whitespace', () => {
    stub(process.stdout, 'write');
    const reporter = reporterFactory({
      formatter() { return '  \n'; },
      console: true,
    });

    reporter({});

    expect(process.stdout.write.called).toBeFalsy();

    process.stdout.write.restore();
  });
  it('reporter should NOT write to console when console param is undefined', () => {
    stub(process.stdout, 'write');
    const reporter = reporterFactory({
      formatter() { return 'foo'; },
    });

    reporter({});

    expect(process.stdout.write.called).toBeFalsy();

    process.stdout.write.restore();
  });
});
describe('Reporter Behavior with log file', () => {
  it('reporter should writes a file when formatter returns a string', async () => {
    const logFilePath = path.resolve(__dirname, 'foo.txt');

    const reporter = reporterFactory({
      formatter() { return 'test content'; },
      log: logFilePath,
    });

    await reporter({});

    expect((await fs.stat(logFilePath)).isFile()).toBeTruthy();
    expect((await fs.readFile(logFilePath)).toString()).toBe('test content');

    await fs.unlink(logFilePath);
  });
  it('reporter should writes to a directory when formatter returns a string', async () => {
    const tmpDir = path.resolve(__dirname, 'tmp');
    const logFilePath = path.join(tmpDir, 'foo.txt');

    const reporter = reporterFactory({
      formatter() { return 'test content'; },
      log: logFilePath,
    });

    await reporter({});

    expect((await fs.stat(tmpDir)).isDirectory()).toBeTruthy();
    expect((await fs.stat(logFilePath)).isFile()).toBeTruthy();
    expect((await fs.readFile(logFilePath)).toString()).toBe('test content');

    await fs.rm(path.dirname(logFilePath), { recursive: true, force: true });
  });
  it('reporter should writes an empty file when formatter returns an empty string', async () => {
    const logFilePath = path.resolve(__dirname, 'foo.txt');

    const reporter = reporterFactory({
      formatter() { return ''; },
      log: logFilePath,
    });

    await reporter({});

    expect((await fs.stat(logFilePath)).isFile()).toBeTruthy();
    expect((await fs.readFile(logFilePath)).toString()).toBe('');

    await fs.unlink(logFilePath);
  });
  it('reporter should NOT writes a file when log param is undefined', async () => {
    const logFilePath = path.resolve(__dirname, 'foo.txt');

    const reporter = reporterFactory({
      formatter() { return 'foo'; },
    });

    await reporter({});

    await expect(fs.access(logFilePath, fs.constants.F_OK)).rejects.toThrow();
  });
});
