/**
 * test/sourcemap.spec.js
 */

import gulp from 'gulp';
import gulpCleanCss from 'gulp-clean-css';
import gulpConcat from 'gulp-concat';
import gulpRename from 'gulp-rename';
import test from 'tape';

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

test('should emit no errors when stylelint rules are satisfied', t => {
  t.plan(1);
  gulp
    .src(fixtures('original-*.css'), {
      sourcemaps: true
    })
    .pipe(gStylelintEsm({
      config: {rules: {}}
    }))
    .on('finish', () => t.pass('no error emitted'));
});

test('should apply sourcemaps correctly', t => {
  t.plan(6);
  gulp
    .src(fixtures('original-*.css'), {
      sourcemaps: true
    })
    .pipe(gulpCleanCss())
    .pipe(gulpConcat('concatenated.css'))
    .pipe(gulpRename({prefix: 'renamed-'}))
    .pipe(gStylelintEsm({
      config: {rules: {
        'declaration-no-important': true
      }},
      reporters: [{
        formatter(lintResult) {
          t.deepEqual(
            lintResult.map(r => r.source),
            ['original-a.css', 'original-b.css'],
            'there are two files'
          );
          t.equal(
            lintResult[0].warnings[0].line,
            2,
            'original-a.css has an error on line 2'
          );
          t.equal(
            lintResult[0].warnings[0].column,
            9,
            'original-a.css has an error on column 9'
          );
          t.equal(
            lintResult[1].warnings[0].line,
            2,
            'original-b.css has an error on line 2'
          );
          t.equal(
            lintResult[1].warnings[0].column,
            9,
            'original-b.css has an error on column 9'
          );
        }
      }]
    }))
    .on('error', () => t.pass('error has been emitted correctly'));
});

test('should ignore empty sourcemaps', t => {
  t.plan(6);
  gulp
    .src(fixtures('original-*.css'), {
      sourcemaps: true
    })
    .pipe(gStylelintEsm({
      config: {rules: {
        'declaration-no-important': true
      }},
      reporters: [{
        formatter(lintResult) {
          t.deepEqual(
            lintResult.map(r => r.source),
            [
              path.join(__dirname, 'fixtures', 'original-a.css'),
              path.join(__dirname, 'fixtures', 'original-b.css')
            ],
            'there are two files'
          );
          t.equal(
            lintResult[0].warnings[0].line,
            2,
            'original-a.css has an error on line 2'
          );
          t.equal(
            lintResult[0].warnings[0].column,
            14,
            'original-a.css has an error on column 14'
          );
          t.equal(
            lintResult[1].warnings[0].line,
            2,
            'original-b.css has an error on line 2'
          );
          t.equal(
            lintResult[1].warnings[0].column,
            15,
            'original-b.css has an error on column 15'
          );
        }
      }]
    }))
    .on('error', () => t.pass('error has been emitted correctly'));
});
