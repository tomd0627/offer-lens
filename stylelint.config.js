export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    'media-feature-range-notation': null,
    'order/properties-alphabetical-order': true,
    'property-no-vendor-prefix': [
      true,
      { ignoreProperties: ['-webkit-text-size-adjust', '-webkit-appearance'] },
    ],
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$',
      { message: 'Expected class selector to follow BEM naming convention' },
    ],
    'value-keyword-case': ['lower', { ignoreFunctions: [], ignoreKeywords: ['Georgia'] }],
  },
};
