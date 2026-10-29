import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "archive/**",
  ]),
  // Browser tests, the Playwright config and helper scripts are CommonJS .js on purpose (the
  // workspace compliance checker scans .js for requirement IDs; docs/architecture.md, Testing).
  {
    files: ["tests/e2e/**/*.js", "playwright.config.js", "scripts/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
