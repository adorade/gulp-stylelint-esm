/*!
 * Gulp Stylelint (v2.0.0-dev): src/writer.js
 * Copyright (c) 2023 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import ansiColors from 'ansi-colors';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Writes formatted text to a file and resolves a promise when the writing process is complete.
 *
 * @param {string} text - The formatted text to be written to the file.
 * @param {string} dest - The destination path for the file.
 * @param {string} [destRoot=process.cwd()] - The root directory for resolving the destination path.
 * @returns {Promise<void>} A promise that resolves when the writing process is complete.
 */
export function writer(text, dest, destRoot = process.cwd()) {
  /**
   * The full path to the destination file.
   * @type {string}
   */
  const fullpath = path.resolve(destRoot, dest);

  /**
   * A promise representing the writing process.
   * @type {Promise<void>}
   */
  return new Promise((resolve, reject) => {
    /**
     * Create directories recursively if they don't exist.
     */
    fs.mkdir(path.dirname(fullpath), { recursive: true }, mkdirpError => {
      if (mkdirpError) {
        reject(mkdirpError);
      } else {
        /**
         * Write the formatted text to the destination file, removing ANSI colors.
         */
        fs.writeFile(fullpath, ansiColors.unstyle(text), fsWriteFileError => {
          if (fsWriteFileError) {
            reject(fsWriteFileError);
          } else {
            resolve();
          }
        });
      }
    });
  });
}
