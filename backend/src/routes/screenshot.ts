import { Router, Request, Response } from 'express';
import { getPageWithImages } from '../services/browser';
import { ScreenshotRequest, ScreenshotResponse } from '../types';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { url, xpath } = req.body as ScreenshotRequest;

  if (!url || !xpath) {
    return res.status(400).json({ error: 'url and xpath are required' });
  }

  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;

  const { page, close } = await getPageWithImages(normalizedUrl);

  try {
    // Highlight element with red border
    const matchCount = await page.evaluate((xpathExpr: string) => {
      try {
        const snapshot = document.evaluate(
          xpathExpr,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        const count = snapshot.snapshotLength;

        for (let i = 0; i < count; i++) {
          const node = snapshot.snapshotItem(i) as HTMLElement;
          if (node && node.style) {
            node.style.outline = '3px solid #ff4444';
            node.style.outlineOffset = '2px';
            node.style.backgroundColor = 'rgba(255, 68, 68, 0.15)';
            node.scrollIntoView({ behavior: 'instant', block: 'center' });
          }
        }
        return count;
      } catch {
        return 0;
      }
    }, xpath);

    await page.waitForTimeout(500);

    const screenshotBuffer = await page.screenshot({
      fullPage: false,
      type: 'jpeg',
      quality: 80,
    });

    const imageBase64 = screenshotBuffer.toString('base64');

    const response: ScreenshotResponse = {
      imageBase64,
      matchCount,
    };

    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    await close();
  }
});

export default router;
