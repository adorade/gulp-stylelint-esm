/*!
 * Gulp Stylelint (v3.0.0-beta): test/testutils/creatVinil.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import VinylFile from 'vinyl';
import { resolve } from 'node:path';

export const createVinylDirectory = () => {
    const directory = new VinylFile({ path: process.cwd(), contents: null, isDirectory: true });

    return directory;
};

export const createVinylFile = (path, contents) => {
    const file = new VinylFile({ path: resolve(path), contents: Buffer.from(contents) });

    return file;
};
