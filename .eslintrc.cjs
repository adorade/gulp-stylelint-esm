module.exports = {
    parser: "@babel/eslint-parser",
    env: {
        browser: true,
        node: true,
        es6: true
    },
    extends: 'stylelint',
    globals: {
        module: true
    },
    parserOptions: {
        ecmaVersion: 2017,
        requireConfigFile: false,
        sourceType: 'module',
    },
    rules: {
        'prefer-object-spread': 'off'
    }
}
