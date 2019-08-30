module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "no-console": 0,
    "func-names": 0,
    "comma-dangle": 0,
    "no-underscore-dangle": 0,
    "no-plusplus": 0,
    "no-await-in-loop": 0,
    "global-require": 0
  },
};
