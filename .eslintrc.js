module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2020': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 11,
  },
  'rules': {
    'max-len': [2, 120, {
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true,
      'ignoreComments': true,
    }],
  },
};
