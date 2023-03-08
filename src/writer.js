/**
 * src/writer.js
 */

import ansiColors from 'ansi-colors';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Creates the output folder and writes formatted text to a file.
 * @param {String} text - Text to write (may be color-coded).
 * @param {String} dest - Destination path relative to destRoot.
 * @param {String} [destRoot] - Destination root folder, defaults to cwd.
 * @return {Promise} Resolved when folder is created and file is written.
 */
export default function writer(text, dest, destRoot = process.cwd()) {
  const fullpath = path.resolve(destRoot, dest);

  return new Promise((resolve, reject) => {
    fs.mkdir(path.dirname(fullpath), { recursive: true }, mkdirpError => {
      if (mkdirpError) {
        reject(mkdirpError);
      } else {
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
};
