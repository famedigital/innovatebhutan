import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default compat({
  ignores: [
    ".next/**",
    "node_modules/**",
    "out/**",
    "*.config.js",
    "*.config.mjs",
    "build/**",
    ".turbo/**"
  ],
}, {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
  },
  plugins: {
    "react": react.configs.flat.recommended,
    "react-hooks": reactHooks.configs.flat.recommended,
  },
  extends: [
    "next/core-web-vitals",
    "next/typescript",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react/react-in-jsx-scope": "off",
  },
});
