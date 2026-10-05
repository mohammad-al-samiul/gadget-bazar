/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    './base.js',
    'prettier'
  ],
  env: {
    browser: true,
    node: true,
    es2022: true
  }
};
