import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: './tests/browser', fullyParallel: false, workers: 1, retries: 0,
 timeout: 30000, reporter: 'list',
 use: { baseURL: 'http://localhost:3200', browserName: 'chromium', headless: true,
   viewport: {width:1440,height:900}, locale:'en-US',timezoneId:'UTC',
   trace:'off',screenshot:'off',video:'off' },
});
