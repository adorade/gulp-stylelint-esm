/*!
 * Gulp Stylelint (v3.0.0-beta): src/writer.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { dirname, normalize, relative } from 'node:path';
import { mkdir } from 'node:fs/promises';
import writeFileAtomic from 'write-file-atomic';

import colors from 'ansi-colors';
const { blue, green, unstyle } = colors;

/**
 * Writes the given text to a log file at the specified destination.
 *
 * @param {string} filePath - The destination path for the file
 * @param {string} content - The text content to write to the file
 * @returns {Promise<void>} A promise that resolves when the file is written
 */
export async function writeOutputLog(filePath, content) {
  // Ensure the directory exists
  await mkdir(dirname(filePath), { recursive: true });

  // Write the output log
  await writeFileAtomic(normalize(filePath), unstyle(content));
}

/**
 * Overwrites the source file with the given content.
 *
 * @param {string} file - The source file
 * @param {string} content - The content to overwrite the source with
 * @returns {Promise<void>} A promise that resolves when the file is overwritten
 */
export async function overwriteSource(file, content) {
  process.stdout.write(
    `${blue(normalize(relative('.', file.path)))} >> ${green('fixed and overwrote')}\n`
  );

  await writeFileAtomic(normalize(file.path), unstyle(content));
}
