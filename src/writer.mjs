/*!
 * Gulp Stylelint (v2.1.0): src/writer.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import colors from 'ansi-colors';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Writes text content to a file on the file system.
 * @param {string} text - The content to be written to the file.
 * @param {string} dest - The relative or absolute path of the destination file.
 * @param {string} [destRoot=process.cwd()] - The root directory for the destination file (default: current working directory).
 * @returns {Promise<void>} - A promise that resolves when the writing process is complete.
 */
export default function writer(text, dest, destRoot = process.cwd()) {
  /**
   * The full path of the destination file, resolving from the destination root.
   * @type {string}
   */
  const fullpath = path.resolve(destRoot, dest);

  /**
   * Promise to handle the asynchronous writing process.
   * @type {Promise<void>}
   */
  return new Promise((resolve, reject) => {
    /**
     * Creates directories recursively for the destination file.
     * @param {Error} mkdirpError - Error object if directory creation fails.
     */
    fs.mkdir(path.dirname(fullpath), { recursive: true }, mkdirpError => {
      if (mkdirpError) {
        reject(mkdirpError);
      } else {
        /**
         * Writes the text content to the destination file after successful directory creation.
         * @param {Error} fsWriteFileError - Error object if file writing fails.
         */
        fs.writeFile(fullpath, colors.unstyle(text), fsWriteFileError => {
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
