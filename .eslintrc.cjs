/**
 * ESLint configuration for the Playwright + TypeScript test automation framework.
 *
 * - Uses @typescript-eslint for strict, type-aware linting of the sources.
 * - Enforces Playwright best practices via eslint-plugin-playwright.
 * - Delegates formatting concerns to Prettier (eslint-config-prettier is last).
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'playwright', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/playwright-test',
    'plugin:prettier/recommended',
  ],
  rules: {
    // Prettier drives all formatting; report mismatches as ESLint errors.
    'prettier/prettier': 'error',

    // TypeScript: sensible defaults for a test automation framework.
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', disallowTypeAnnotations: false },
    ],
    '@typescript-eslint/no-empty-function': 'warn',

    // General quality rules.
    'no-console': 'off', // Logging is expected in a test framework.
    eqeqeq: ['error', 'smart'],
    'no-duplicate-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    curly: ['error', 'multi-line'],

    // Playwright-specific safety nets.
    'playwright/no-focused-test': 'error',
    'playwright/no-skipped-test': 'warn',
    'playwright/no-conditional-in-test': 'off',
    'playwright/expect-expect': 'off',
  },
  overrides: [
    {
      files: ['tests/**/*.ts', '**/*.spec.ts'],
      rules: {
        // Tests often use setup blocks or helper asserts that the plugin mis-detects.
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['*.cjs', '*.js', 'scripts/**/*.js'],
      parserOptions: {
        project: null,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'test-results/',
    'playwright-report/',
    'allure-results/',
    'allure-report/',
    'coverage/',
    'archived-results/',
    '*.min.js',
  ],
};
