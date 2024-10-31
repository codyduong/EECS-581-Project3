import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {
    "eslint:recommended": true,
    "@typescript-eslint/recommended": true,
    "plugin:roblox-ts/recommended": true,
    "plugin:prettier/recommended": true,
  },
});

export default [
  ...compat.config({
    parser: "@typescript-eslint/parser",
    parserOptions: {
      jsx: true,
      useJSXTextNode: true,
      ecmaVersion: 2018,
      sourceType: "module",
      project: "./tsconfig.json",
    },
    ignorePatterns: ["/out", "**/*.mjs"],
    plugins: ["@typescript-eslint", "roblox-ts", "prettier", "no-relative-import-paths"],
    rules: {
      "prettier/prettier": "warn",
      "no-relative-import-paths/no-relative-import-paths": ["error", { allowSameFolder: true, rootDir: "src" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
        },
      ],
    },
  }),
  {
    files: ["**/*.ts", "**/*.tsx", "*.mjs"],
    ignores: ["/out"],
  },
];
