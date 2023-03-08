/**
 * test/index.spec.js
 */

import gulp from 'gulp';
import test from 'tape';

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import gStylelintEsm from '../src/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Creates a full path to the fixtures glob.
 * @param {String} glob - Src glob.
 * @return {String} Full path.
 */
function fixtures(glob) {
  return path.join(__dirname, 'fixtures', glob);
}

test('should not throw when no arguments are passed', t => {
  t.plan(1);
  t.doesNotThrow(gStylelintEsm);
});

test('should emit an error on streamed file', t => {
  t.plan(1);
  gulp
    .src(fixtures('basic.css'), {
      buffer: false
    })
    .pipe(gStylelintEsm())
    .on('error', error => t.equal(
      error.message,
      'Streaming is not supported',
      'error has been emitted on streamed file'
    ));
});

test('should NOT emit an error when configuration is set', t => {
  t.plan(1);
  gulp
    .src(fixtures('basic.css'))
    .pipe(gStylelintEsm({config: {rules: []}}))
    .on('error', () => t.fail('error has been emitted'))
    .on('finish', () => t.pass('no error emitted'));
});

test('should emit an error when linter complains', t => {
  t.plan(1);
  gulp
    .src(fixtures('invalid.css'))
    .pipe(gStylelintEsm({config: {rules: {
      'color-hex-case': 'lower'
    }}}))
    .on('error', () => t.pass('error has been emitted correctly'));
});

test('should ignore file', t => {
  t.plan(1);
  gulp
    .src([fixtures('basic.css'), fixtures('invalid.css')])
    .pipe(gStylelintEsm({
      config: {rules: {'color-hex-case': 'lower'}},
      ignorePath: fixtures('ignore')
    }))
    .on('finish', () => t.pass('no error emitted'));
});

test('should fix the file without emitting errors', t => {
  t.plan(2);
  gulp
    .src(fixtures('invalid.css'), {
      sourcemaps: true
    })
    .pipe(gStylelintEsm({
      fix: true,
      config: {rules: {'color-hex-case': 'lower'}}
    }))
    .pipe(gulp.dest(path.resolve(__dirname, '../tmp')))
    .on('error', error => t.fail(`error ${error} has been emitted`))
    .on('finish', () => {
      t.equal(
        fs.readFileSync(path.resolve(__dirname, '../tmp/invalid.css'), 'utf8'),
        '.foo {\n  color: #fff;\n}\n',
        'report file has fixed contents'
      );
      t.pass('no error emitted');
    });
});

test('should expose an object with stylelint formatter functions', t => {
  t.plan(2);
  t.equal(typeof gStylelintEsm.formatters, 'object', 'formatters property is an object');

  const gFormatters = Object
    .keys(gStylelintEsm.formatters)
    .map(fName => gStylelintEsm.formatters[fName]);

  t.true(gFormatters.every(f => typeof f === 'function'), 'all formatters are functions');
});
