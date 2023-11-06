module.exports = {
  env: {
    browser: true,
  },
  extends: 'airbnb',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'no-underscore-dangle': 0,
    'react/no-array-index-key': 0,
    'max-len': ['error', { code: 120 }],
    'no-alert': 0,
  },
};
