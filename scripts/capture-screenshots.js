import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const routes = [
  { name: '01-overview', path: '/overview' },
  { name: '02-directory', path: '/employees' },
  { name: '03-profile', path: '/employees/EMP-0941' },
  { name: '04-create-employee', path: '/employees/new' },
  { name: '05-edit-employee', path: '/employees/EMP-0941/edit' },
  { name: '06-onboarding-workspace', path: '/onboarding' },
  { name: '07-onboarding-checklist', path: '/employees/EMP-0941/onboarding' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function main() {
  const browser = await chromium.launch();
  const baseUrl = 'http://localhost:5173';

  for (const vp of viewports) {
    const dir = path.join('screenshots', vp.name);
    fs.mkdirSync(dir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    for (const r of routes) {
      await page.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const filePath = path.join(dir, `${r.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved ${filePath}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
