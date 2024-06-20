/*!
 * Gulp Stylelint (v2.1.0): test/reporter-factory.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import fancyLog from 'fancy-log';
import { stub } from 'sinon';

import reporterFactory from '../src/reporter-factory.mjs';

describe('Reporter Functionality', () => {
  test('reporter factory should return a function with a default reporter', () => {
    expect(typeof reporterFactory()).toBe('function');
  });
  test('reporter factory should return a function with a custom reporter', () => {
    expect(typeof reporterFactory('custom')).toBe('function');
  });
  test('reporter should return a promise', () => {
    const reporter = reporterFactory({
      formatter() {
        // empty formatter
      },
    });

    expect(typeof reporter({}).then).toBe('function');
  });
  test('reporter should write to console when console param is true', () => {
    stub(fancyLog, 'info');
    const reporter = reporterFactory({
      formatter() { return 'foo'; },
      console: true
    });

    reporter({});

    expect(fancyLog.info.calledWith('\nfoo\n')).toBeTruthy();

    fancyLog.info.restore();
  });
  test('reporter should not write to console when console param is false', () => {
    stub(fancyLog, 'info');
    const reporter = reporterFactory({
      formatter() { return 'foo'; },
      console: false
    });

    reporter({});

    expect(fancyLog.info.called).toBeFalsy();

    fancyLog.info.restore();
  });
  test('reporter should not write to console if formatter returned only whitespace', () => {
    stub(fancyLog, 'info');
    const reporter = reporterFactory({
      formatter() { return '  \n'; },
      console: true,
    });

    reporter({});

    expect(fancyLog.info.called).toBeFalsy();

    fancyLog.info.restore();
  });
  test('reporter should NOT write to console when console param is undefined', () => {
    stub(fancyLog, 'info');
    const reporter = reporterFactory({
      formatter() { return 'foo'; },
    });

    reporter({});

    expect(fancyLog.info.called).toBeFalsy();

    fancyLog.info.restore();
  });
});
