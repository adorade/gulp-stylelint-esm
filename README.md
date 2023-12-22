# Gulp Stylelint

[![NPM version](https://img.shields.io/npm/v/gulp-stylelint-esm?logo=npm)](https://www.npmjs.org/package/gulp-stylelint-esm)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/adorade/gulp-stylelint-esm?color=green&logo=github)](https://github.com/adorade/gulp-stylelint-esm/blob/main/package.json)
[![license](https://img.shields.io/github/license/adorade/gulp-stylelint-esm)](https://mit-license.org)
[![Depfu Status](https://img.shields.io/depfu/dependencies/github/adorade/gulp-stylelint-esm)](https://depfu.com/repos/github/adorade/gulp-stylelint-esm)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)](https://renovatebot.com/)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/adorade/gulp-stylelint-esm/test.yml?label=Test%20CI&logo=github)](https://github.com/adorade/gulp-stylelint-esm/actions/workflows/test.yml)

This package is pure ESM. Please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

A [Gulp](https://gulpjs.com/) plugin that runs [stylelint](https://github.com/stylelint/stylelint) results through a list of reporters with ESM support.

## Installation

> **REQUIREMENTS**: Supports **stylelint > 16** and **node >= 18.12.0**.

```sh
# YARN
yarn add stylelint gulp-stylelint-esm -D
# NPM
npm install stylelint gulp-stylelint-esm --save-dev
```

## Quick start

Once you have [configured stylelint](https://stylelint.io/user-guide/configuration/) (e.g. you have a _.stylelintrc_ file), start with the following code. You will find additional configuration [options](#options) below.

```js
import gulp from 'gulp';
import gStylelintEsm from 'gulp-stylelint-esm';

function lintCssTask() {
  return gulp
    .src('src/**/*.css')
    .pipe(gStylelintEsm({
      reporters: [
        { formatter: 'string', console: true }
      ]
    }));
}
```

## Formatters

Below is the list of currently available **stylelint formatters**. Some of them are bundled with stylelint by default and exposed on `gStylelintEsm.formatters` object. Others need to be installed. You can [write a custom formatter](http://stylelint.io/developer-guide/formatters/) to tailor the reporting to your needs.

Formatters bundled with stylelint: `"compact"`, `"github"`, `"json"`, `"string (default)"`, `"tap"`, `"unix"`, `"verbose"`.

## Options

**gulp-stylelint-esm** supports all [stylelint](https://stylelint.io/user-guide/options) and [Node.js API](https://stylelint.io/user-guide/node-api#options) options except:

- [`files`](http://stylelint.io/user-guide/node-api/#files), code will be provided by gulp instead
- [`formatter`](https://stylelint.io/user-guide/options#formatter), formatters are defined in the `reporters` option
- [`cache`](https://stylelint.io/user-guide/options#cache), gulp caching should be used instead

and accepts a **custom set of options** listed below:

```js
import gulp from 'gulp';
import gStylelintEsm from 'gulp-stylelint-esm';
import { myStylelintFormatter } from 'my-stylelint-formatter';

function lintCssTask() {
  return gulp
    .src('src/**/*.css')
    .pipe(gStylelintEsm({
      failAfterError: true,
      reportOutputDir: 'reports/lint',
      reporters: [
        { formatter: 'verbose', console: true },
        { formatter: 'json', save: 'report.json' },
        { formatter: myStylelintFormatter, save: 'my-custom-report.txt' }
      ],
      debug: true
    }));
}
```

### `failAfterError`

When set to `true`, the process will end with non-zero error code if any error-level warnings were raised. Defaults to `true`.

### `reportOutputDir`

Base directory for lint results written to filesystem. Defaults to **current working directory** `process.cwd()`.

### `reporters`

List of reporter configuration objects (see below). Defaults to **an empty array** `[]`.

```js
{
  // stylelint results formatter (required):
  // - pass a function for imported, custom or exposed formatters
  // - pass a string for formatters bundled with stylelint
  //   "string (default)", "compact", "github", "json", "tap", "unix", "verbose"
  formatter: myFormatter,

  // save the formatted result to a file (optional):
  save: 'text-report.txt',

  // log the formatted result to console (optional):
  console: true
}
```

### `debug`

When set to `true`, the error handler will print an error stack trace. Defaults to `false`.

## Autofix

The `fix: true` option instructs stylelint to try to fix as many issues as possible. The fixes are applied to the gulp stream. The fixed content can be saved to file using gulp `dest`.

```js
import gulp from 'gulp';
import gStylelintEsm from 'gulp-stylelint-esm';

function fixCssTask() {
  return gulp
    .src('src/**/*.css')
    .pipe(gStylelintEsm({
      fix: true
    }))
    .pipe(gulp.dest('src'));
}
```

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
