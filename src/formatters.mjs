/*!
 * Gulp Stylelint (v4.0.0): src/formatters.mjs
 * Copyright (c) 2023-26 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================= */

import stylelint from 'stylelint';

/**
 * @typedef {import('stylelint').Formatter} Formatter
 * @typedef {Record<string, Formatter>} FormatterDictionary
 */

/** @type {FormatterDictionary} */
const { formatters } = stylelint;

/** @type {FormatterDictionary} */
export const gFormatters = formatters;
