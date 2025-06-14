import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      // Dependencies
      "node_modules/**",
      ".next/**",
      
      // Build outputs
      "out/**",
      "build/**",
      "dist/**",
      
      // Generated files
      ".next/types/**",
      "tsconfig.tsbuildinfo",
      
      // Database and migration files
      "**/*.sql",
      "migrations/**",
      
      // Supabase functions (Deno)
      "supabase/functions/**",
      
      // Scripts
      "scripts/**",
      "**/*.js",
      
      // Test files
      "test/**",
      "**/*.test.*",
      "**/*.spec.*",
      
      // Configuration files
      "next.config.js",
      "tailwind.config.*",
      "postcss.config.*",
      "vitest.config.*",
      
      // Environment files
      ".env*",
      
      // Log files
      "*.log",
      
      // Temporary files
      "*.tmp",
      "*.temp"
    ],
    rules: {
      // Désactiver les règles trop strictes
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      
      // Règles React moins strictes
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "warn",
      
      // Règles Next.js
      "@next/next/no-img-element": "warn",
      
      // Règles générales de code
      "no-console": "off",
      "no-unused-vars": "off" // Désactivé en faveur de @typescript-eslint/no-unused-vars
    }
  }
];

export default eslintConfig;
