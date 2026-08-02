import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    pool: "threads", // avoids forked-process startup failures in CI
    // alternatively: pool: "threads", poolOptions: { threads: { singleThread: true } }
  },
});