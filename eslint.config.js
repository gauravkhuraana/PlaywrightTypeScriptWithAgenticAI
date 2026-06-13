// ESLint v9 flat config
// Docs: https://eslint.org/docs/latest/use/configure/configuration-files

const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const playwright = require("eslint-plugin-playwright");
const prettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      "node_modules/**",
      "playwright-report/**",
      "allure-report/**",
      "allure-results/**",
      "archived-results/**",
      "test-results/**",
      "logs/**",
      "coverage/**",
      "dist/**",
      "build/**",
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript files
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
    },
  },

  // JavaScript files
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    plugins: { prettier },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "warn",
    },
  },

  // Playwright test files
  {
    files: ["tests/**/*.ts", "**/*.spec.ts", "**/*.test.ts"],
    plugins: { playwright },
    rules: {
      ...playwright.configs["flat/recommended"].rules,
    },
  },
];
