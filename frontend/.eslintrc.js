module.exports = {
  env: {
    browser: true,
  },
  extends: "airbnb",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaFeatures: {
        jsx: true
    },
    ecmaVersion: 2020,
    sourceType: "module"
  },
  plugins: [
    "react"
  ],
  rules: {}
};
