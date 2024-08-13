/*!
 * Gulp Stylelint (v2.2.0): test/formatters.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { gFormatters } from '../src/formatters.mjs';

describe('Plugin formatters', () => {
  test('should expose formatters property as an object', () => {
    expect(typeof gFormatters === 'object').toBe(true);
  });
  test('all built-in formatters are exposed on `stylelint` object', async () => {
    expect(Object.keys(gFormatters)).toHaveLength(7);
    expect(typeof (await gFormatters.compact)([])).toBe('string');
    expect(typeof (await gFormatters.github)([], {})).toBe('string');
    expect(typeof (await gFormatters.json)([])).toBe('string');
    expect(typeof (await gFormatters.string)([])).toBe('string');
    expect(typeof (await gFormatters.tap)([])).toMatch('string');
    expect(typeof (await gFormatters.unix)([])).toBe('string');
    expect(typeof (await gFormatters.verbose)([])).toMatch('string');
  });
  test('should expose an object with `stylelint` formatter promises', () => {
    const formatters = Object.values(gFormatters);

    expect(formatters.every(async (f) => typeof await f.then === 'function')).toBe(true);
  });
});
