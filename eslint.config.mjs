import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import _import from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...fixupConfigRules(
    compat.extends("prettier", "plugin:import/typescript", "plugin:import/warnings"),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      prettier,
    },

    rules: {
      "prettier/prettier": 1,
      "import/no-named-as-default-member": 0,

      "import/newline-after-import": [
        1,
        {
          count: 1,
        },
      ],

      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],

          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "{components,config}",
              group: "internal",
            },
            {
              pattern: "{assets,components,hooks,modules,services,utils}/{*,*/**}",
              group: "internal",
            },
          ],

          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "sort-imports": "off",
      "import/no-named-as-default": "off",
      "no-redeclare": "off",
      "@typescript-eslint/no-redeclare": "off",
    },
  },
];
