import { plugin as shadcn } from "@shadcn/lint";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import envExample from "./eslint/env-example.mts";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [".env.example"],
    plugins: { "env-example": envExample },
    processor: "env-example/dotenv",
    rules: { "env-example/layout": "error" },
  },
  {
    files: ["src/**/*.{ts,tsx,mts}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}"],
    ignores: ["src/env.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Declare the variable in src/env.ts and import env from @/env.",
        },
      ],
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { shadcn },
    rules: {
      "shadcn/no-restyle": ["error", { allow: ["layout"] }],
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": "error",
    },
  },
  {
    files: ["src/shared/components/ui/**"],
    rules: {
      "shadcn/no-restyle": "off",
      "shadcn/no-arbitrary-values": "off",
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    ".e2e/**",
    "test-results/**",
    "next-env.d.ts",
    "convex/_generated/**",
    // Agent skill/tooling trees (vendored scripts, not app source):
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".cursor/**",
  ]),
]);

export default eslintConfig;
