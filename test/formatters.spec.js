/*!
 * Gulp Stylelint (v2.0.0-dev): test/formatters.spec.js
 * Copyright (c) 2023 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import test from 'tape';

import gStylelintEsm from '../src/index.mjs';

const gFormatters = gStylelintEsm.formatters;

test('should expose an object with stylelint formatter', t => {
  t.plan(2);
  const length = Object.keys(gFormatters).length;

  t.equal(typeof gFormatters, 'object', '`formatters` property is an object');
  t.equal(length, 7, '`formatters` object has 7 properties');
});

test('all built-in formatters are exposed on `stylelint` object', async t => {
  t.plan(7);

  t.equal(typeof (await gFormatters.compact)([]), 'string', '`compact` is a string');
  t.equal(typeof (await gFormatters.github)([], {}), 'string', '`github` is a string');
  t.equal(typeof (await gFormatters.json)([]), 'string', '`json` is a string');
  t.equal(typeof (await gFormatters.string)([]), 'string', '`string` is a string');
  t.equal(typeof (await gFormatters.tap)([]), 'string', '`tap` is a string');
  t.equal(typeof (await gFormatters.unix)([]), 'string', '`unix` is a string');
  t.equal(typeof (await gFormatters.verbose)([]), 'string', '`verbose` is a string');
});
