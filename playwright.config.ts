import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
const isLocal = !process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(isLocal
    ? {
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: true,
        },
      }
    : {}),
});
