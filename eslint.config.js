module.exports = {
    languageOptions: {
        globals: {
            commonjs: true,
            es6: true,
            jest: true,
            node: true
        }
    },
    extends: [
        'eslint:recommended',
    ],
    globals: {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    parserOptions: {
        ecmaVersion: 2022
    },
    rules: {
        "no-unused-vars": 1
    },
    ignorePatterns: ["dist/*"],
}
