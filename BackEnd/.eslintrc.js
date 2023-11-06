module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'max-len': ['error', { code: 120 }],
    'func-names': 0,
  },
};
