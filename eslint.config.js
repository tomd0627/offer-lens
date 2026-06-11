import globals from 'globals';

export default [
  {
    files: ['js/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        analyzeOffer: 'readonly',
        renderResult: 'readonly',
        getPlainTextReport: 'readonly',
      },
    },
    rules: {
      eqeqeq: 'error',
      'no-console': 'warn',
      'no-unused-vars': 'error',
    },
  },
];
