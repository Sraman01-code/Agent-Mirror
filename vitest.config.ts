import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Vitest config (M3.1). Node environment (domain logic, no DOM). The `@`
// alias mirrors tsconfig paths so tests import the same modules as the app.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
