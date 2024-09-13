/*!
 * Gulp Stylelint (v3.0.0-beta): src/writer.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { dirname, normalize } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

import colors from 'ansi-colors';
const { unstyle } = colors;

/**
 * Writes the given text to a log file at the specified destination.
 *
 * @param {string} filePath - The destination path for the file
 * @param {string} content - The text content to write to the file
 * @returns {Promise<void>} A promise that resolves when the file is written
 */
export default async function writeOutputLog(filePath, content) {
  // Ensure the directory exists
  await mkdir(dirname(filePath), { recursive: true });

  // Write the output log
  await writeFile(normalize(filePath), unstyle(content));
}
