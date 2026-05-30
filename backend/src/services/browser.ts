import { Browser, chromium, Page } from 'playwright';

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

export async function getPage(url: string): Promise<{ page: Page; close: () => Promise<void> }> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // Block heavy resources to speed up loading
  await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot}', (route) => {
    route.abort();
  });

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Give JS a moment to render
    await page.waitForTimeout(2000);
  } catch (err) {
    // If navigation failed, try with a more lenient strategy
    try {
      await page.goto(url, { waitUntil: 'commit', timeout: 15000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      // Accept whatever loaded
    }
  }

  return {
    page,
    close: async () => {
      await context.close();
    },
  };
}

export async function getPageWithImages(url: string): Promise<{ page: Page; close: () => Promise<void> }> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
  } catch (err) {
    try {
      await page.goto(url, { waitUntil: 'commit', timeout: 15000 });
    } catch (e) {}
  }

  return {
    page,
    close: async () => {
      await context.close();
    },
  };
}

process.on('exit', async () => {
  if (browserInstance) {
    await browserInstance.close();
  }
});
