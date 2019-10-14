module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    "react/jsx-filename-extension": 0,
    "no-console": 0,
    "react/prefer-stateless-function": 0,
    "import/prefer-default-export": 0,
    "comma-dangle": 0,
    "react/prop-types": 0,
    "no-alert": 0,
    "no-underscore-dangle": 0,
    "jsx-a11y/click-events-have-key-events": 0,
    "jsx-a11y/no-noninteractive-element-interactions": 0,
    "jsx-a11y/no-static-element-interactions": 0,
    "class-methods-use-this": 0,
    "react/no-array-index-key": 0,
    "no-nested-ternary": 0
  },
};
