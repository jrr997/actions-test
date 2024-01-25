// eslint.config.js
const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  rules: {
    'no-console': 'off',
    'n/prefer-global/process': 'never',
  },
})
