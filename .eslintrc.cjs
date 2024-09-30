/*!
 * Gulp Stylelint (v2.2.0): .eslintrc.cjs
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    node: true,
    es6: true
  },
  extends: 'stylelint',
  parserOptions: {
    ecmaVersion: 2024,
    requireConfigFile: false,
    sourceType: 'module',
  },
  rules: {
    'prefer-object-spread': 'off',
    'n/prefer-global/process': ['error', 'always']
  },
  overrides: [
    {
      files: [
        'test/*.test.js',
        'test/*.spec.js',
        'bin/*.spec.js'
      ],
      env: {
        jest: true
      },
      rules: {
        '@stylistic/js/arrow-parens': ['error', 'always'],
      }
    }
  ]
}
