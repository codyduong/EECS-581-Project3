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
    ignorePatterns: ["/out"],
    plugins: ["@typescript-eslint", "roblox-ts", "prettier"],
    rules: {
      "prettier/prettier": "warn",
    },
  }),
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["/out"],
  },
];
