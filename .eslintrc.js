module.exports = {
  /* your base configuration of choice */
  extends: 'eslint:recommended',

  parser: 'typescript-eslint-parser',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  globals: {
    __static: true
  },

  plugins: [
    'html'
  ]
}