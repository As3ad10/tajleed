import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const localBrowsers=fileURLToPath(new URL('./.playwright-browsers/',import.meta.url));
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(localBrowsers)) process.env.PLAYWRIGHT_BROWSERS_PATH=localBrowsers;
export default defineConfig({
  testDir:'./tests/browser',
  timeout:30000,
  use:{baseURL:'http://127.0.0.1:4173',trace:'on-first-retry'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:{command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:120000}
});
