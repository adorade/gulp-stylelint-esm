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

> [!NOTE]
> **REQUIREMENTS**:
> Supports **gulp v4 and v5**, **stylelint > 16** and **node >= 18.12.0**.

```sh
# YARN
yarn add stylelint gulp-stylelint-esm -D
# NPM
npm install stylelint gulp-stylelint-esm --save-dev
```

## Quick start

Once you have [configured stylelint](https://stylelint.io/user-guide/configuration/), start with the following code. You will find additional configuration [options](#options) below.

```js
import { src } from 'gulp';
import gStylelintEsm from 'gulp-stylelint-esm';

function lintCssTask() {
  return src('src/**/*.css')
    .pipe(gStylelintEsm());
}
```

## Formatters

Below is the list of currently available **stylelint formatters**. Some of them are bundled with stylelint by default and exposed on `gStylelintEsm.formatters` object. Others need to be installed. You can [write a custom formatter](http://stylelint.io/developer-guide/formatters/) to tailor the reporting to your needs.

Formatters bundled with stylelint: `"compact", "github", "json", "string", "tap", "unix", "verbose"`.

The plugin comes with a built-in formatter called `"stylish"`, which is set as the **default**.

## Options

**gulp-stylelint-esm** supports all [stylelint](https://stylelint.io/user-guide/options) and [Node.js API](https://stylelint.io/user-guide/node-api#options) options except:

- [`files`](http://stylelint.io/user-guide/node-api/#files), code will be provided by gulp instead
- [`formatter`](https://stylelint.io/user-guide/options#formatter), formatters are defined in the `reporters` option
- [`cache`](https://stylelint.io/user-guide/options#cache), gulp caching should be used instead

and accepts a **custom set of options** listed below:

```js
import { src } from 'gulp';
import gStylelintEsm from 'gulp-stylelint-esm';
import { myStylelintFormatter } from 'my-stylelint-formatter';

function lintCssTask() {
  return src('src/**/*.css')
    .pipe(gStylelintEsm({
      failAfterError: true, // true (default) | false
      fix: false,           // false (default) | true
      reporters: [
        { formatter: 'stylish', console: true }, // default
        { formatter: 'json', save: 'report.json' },
        { formatter: myStylelintFormatter, save: 'my-custom-report.txt' }
      ],
      debug: false          // false (default) | true
    }));
}
```

### `failAfterError`

When set to `true`, the process will end with non-zero error code if any error-level warnings were raised. Files are pushed back to the their pipes only if there are no errors. Defaults to `true`.

### `fix`

The `fix: true` (autofix) option instructs stylelint to try to fix as many issues as possible. Defaults to `false`.

> NOTE:
> - fixed files will automatically overwrite the original files; proceed with caution.
> - the fixes are applied to the gulp stream only if there are no errors, to allow usage of other plugins.
> - not all stylelint rules can be automatically fixed, so it's advisable to manually resolve errors.

```js
import { src, dest } from 'gulp';
import gStylelintEsm from 'gulp-stylelint-esm';

function fixCssTask() {
  return src('src/**/*.css')
    .pipe(gStylelintEsm({
      fix: true
    }))
    .pipe(dest('src'));
}
```

### `reporters`

List of reporter configuration objects (see below). Defaults to:

```js
reporters: [
  { formatter: 'stylish', console: true }
]
```

```js
{
  // stylelint results formatter (required):
  // - pass a built-in formatter
  // - pass a function for imported, custom or exposed formatters
  // - pass a string for formatters bundled with stylelint
  //   "stylish (default)", "string", "compact", "github", "json", "tap", "unix", "verbose"
  formatter: stylish,

  // log the formatted result to console (optional):
  console: true

  // save the formatted result to a file (optional):
  save: 'text-report.txt',
}
```

### `debug`

When set to `true`, the error handler will print an error stack trace. Defaults to `false`.

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
