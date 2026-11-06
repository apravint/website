import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next registers the jsx-a11y plugin with only a few rules;
  // enable the full recommended set so accessibility regressions fail lint.
  { rules: { ...jsxA11y.flatConfigs.recommended.rules } },
  {
    // These React Compiler rules flag long-standing patterns in the game and
    // view components (setState in effects, refs mutated in the render loop).
    // Keep them visible as warnings until those components are reworked.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated or non-web output.
    "docs/**",
    "android/**",
    "public/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
