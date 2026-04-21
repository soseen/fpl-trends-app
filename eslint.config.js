import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["src/**/*.{ts,tsx}", "@/**/*.{ts,tsx}"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
  {
    plugins: {
      "react-hooks": pluginReactHooks,
      "unused-imports": pluginUnusedImports,
      prettier: eslintPluginPrettier,
    },
    settings: {
      react: {
        version: "19.0.0",
      },
    },
    rules: {
      /* Prettier */
      "prettier/prettier": [
        "error",
        {
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: false,
        },
      ],

      /* React */
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/self-closing-comp": "error",
      "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      /* TypeScript */
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],

      /* Unused imports (auto-fixable) */
      "unused-imports/no-unused-imports": "error",

      /* General quality */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-duplicate-imports": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    ignores: ["dist/", "node_modules/", "webpack.config.js"],
  },
];
