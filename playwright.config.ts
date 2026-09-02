import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  timeout: 120000,
  expect: {
    timeout: 120000,
  },
  workers: 5,
  use: {
    baseURL: 'https://practicesoftwaretesting.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    launchOptions: {
      slowMo: 1500,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      }
    },
  ]
});