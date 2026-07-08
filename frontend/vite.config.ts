/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/notes": "http://localhost:3000",
      "/health": "http://localhost:3000"
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"]
  }
});
