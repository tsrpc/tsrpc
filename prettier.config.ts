import type { Config } from "prettier";

const config: Config = {
  // Basic Configuration
  printWidth: 100, // Line width 100 (industry trend from 80 to 100, suitable for modern wide screens)
  tabWidth: 2, // 2 spaces indentation (TypeScript community standard)
  useTabs: false, // Use spaces instead of tabs
  semi: true, // Use semicolons (TypeScript official recommendation, avoid ASI issues)
  singleQuote: true, // Use single quotes (cleaner, industry mainstream)

  // Quotes and Commas
  quoteProps: "as-needed", // Only add quotes to object properties when needed
  trailingComma: "all", // Trailing commas (ES5+, better git diff, reduce merge conflicts)

  // Brackets and Spacing
  bracketSpacing: true, // { foo: bar } instead of {foo: bar}
  bracketSameLine: false, // JSX/TSX tag > on separate line (better for folding and readability)

  // Arrow Functions
  arrowParens: "always", // Always use parentheses (x) => x (type safety, consistency)

  // Line Breaks and Whitespace
  endOfLine: "lf", // Unix-style line breaks (cross-platform consistency)
  proseWrap: "preserve", // Preserve Markdown text wrapping as-is

  // HTML/Vue/Angular
  htmlWhitespaceSensitivity: "css", // Follow CSS display property
  vueIndentScriptAndStyle: false, // No extra indent for <script> and <style> in Vue files

  // Other
  embeddedLanguageFormatting: "auto", // Auto-format embedded code blocks
  singleAttributePerLine: false, // Don't force single attribute per line (flexibility)

  // Plugins Configuration (if using related plugins)
  plugins: [],

  // File-specific Overrides
  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 200, // Allow longer line width for JSON files
      },
    },
    // {
    //   files: "*.md",
    //   options: {
    //     proseWrap: "always", // Markdown auto-wrap
    //     printWidth: 80,
    //   },
    // },
  ],
};

export default config;
