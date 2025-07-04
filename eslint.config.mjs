/*!
 * Gulp Stylelint (v3.0.0): eslint.config.mjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { defineConfig } from "eslint/config";

import babelParser from '@babel/eslint-parser';
import stylelintConfig from "eslint-config-stylelint";
import stylelintJestConfig from "eslint-config-stylelint/jest";

export default defineConfig([
  ...stylelintConfig,
  ...stylelintJestConfig,
  {
    name: "plugin:stylelint",
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        requireConfigFile: false,
      },
    },
    rules: {
      'prefer-object-spread': 'off',
      'n/prefer-global/process': ['error', 'always']
    }
  },
  {
    name: "plugin:stylistic",
    files: ['src/*.mjs', 'test/*.test.js'],
    rules: {
      '@stylistic/semi': ['error', 'always']
    }
  },
  {
    name: "plugin:jest",
    files: ['test/*.test.js'],
    rules: {
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'never']
    }
  },
  {
    name: "plugin:ignore",
    ignores: [
      '.coverage/'
    ]
  }
]);
