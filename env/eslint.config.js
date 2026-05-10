import antfu from "@antfu/eslint-config";

export default antfu(
  {
    type: "lib",
    typescript: true,
    formatters: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: "double",
    },
  },
  {
    ignores: ["node_modules/**"],
    rules: {
      "node/no-process-env": "off",
      "test/prefer-lowercase-title": "off",
      "unicorn/filename-case": "off",
    },
  },
  {
    files: ["tests/*.ts"],
    rules: {
      "perfectionist/sort-named-imports": "off",
    },
  },
);
