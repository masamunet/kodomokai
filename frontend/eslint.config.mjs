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
    // Local scripts
    "debug-*.js",
    "scripts/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-var": "off",
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement > JSXIdentifier[name=/^(div|span|h[1-6]|p|a|button|input|textarea|select|option|ul|ol|li|table|tr|td|th|img)$/]",
          message: "Raw HTML elements are not allowed in feature code. Use UI primitives from @/ui/** instead.",
        },
        {
          selector: "JSXAttribute[name.name='className']",
          message:
            "className is not allowed outside of UI components. Use predefined UI components with variants.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@radix-ui/*", "class-variance-authority"],
              message: "Do not import UI libraries directly. Use @/ui/** components.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
