module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'max-params-no-constructor'
  ],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest-formatting/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/comma-dangle': [
      'error',
      'never'
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/indent': [
      `error`,
      2,
      {
        'SwitchCase': 1,
        'ignoredNodes': [
          `FunctionExpression > .params[decorators.length > 0]`,
          `FunctionExpression > .params > :matches(Decorator, :not(:first-child))`,
          `ClassBody.body > PropertyDefinition[decorators.length > 0] > .key`
        ]
      }
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'variable',
        'format': ['camelCase', 'PascalCase', 'UPPER_CASE'],
        'leadingUnderscore': 'allow',
        'trailingUnderscore': 'allow'
      }
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    'arrow-parens': [
      'error',
      'always'
    ],
    'class-methods-use-this': 'off',
    'comma-dangle': [
      'error',
      'never'
    ],
    'consistent-return': 'off',
    'func-names': 'off',
    'function-paren-newline': [
      'error',
      'multiline-arguments'
    ],
    'import/newline-after-import': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'linebreak-style': 0,
    'max-len': [
      'error',
      {
        'code': 120
      }
    ],
    'no-confusing-arrow': 0,
    'no-console': 'error',
    'no-multi-str': 0,
    'no-param-reassign': 0,
    'no-throw-literal': 0,
    'no-underscore-dangle': 'off',
    'no-unused-vars': [
      'error',
      {
        'argsIgnorePattern': 'next'
      }
    ],
    'no-use-before-define': [
      'error',
      {
        'variables': false
      }
    ],
    'no-var': 'error',
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'max-params-no-constructor/max-params-no-constructor': [
      'error', 3
    ],
    '@typescript-eslint/await-thenable': 'error'
  }
};
