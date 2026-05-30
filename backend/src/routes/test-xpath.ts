import { Router, Request, Response } from 'express';
import { getPage } from '../services/browser';
import { TestXPathRequest, TestXPathResponse } from '../types';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { url, xpath } = req.body as TestXPathRequest;

  if (!url || !xpath) {
    return res.status(400).json({ error: 'url and xpath are required' });
  }

  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;

  const { page, close } = await getPage(normalizedUrl);

  try {
    const result = await page.evaluate((xpathExpr: string) => {
      try {
        const snapshot = document.evaluate(
          xpathExpr,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        const count = snapshot.snapshotLength;
        const matches: any[] = [];

        for (let i = 0; i < Math.min(count, 10); i++) {
          const node = snapshot.snapshotItem(i) as Element;
          if (node) {
            matches.push({
              tag: node.tagName?.toLowerCase() || 'unknown',
              text: node.textContent?.trim().substring(0, 100) || '',
              outerHTML: node.outerHTML?.substring(0, 300) || '',
            });
          }
        }

        return {
          matchCount: count,
          matches,
          status: count === 0 ? 'none' : count === 1 ? 'unique' : 'multiple',
        };
      } catch (e: any) {
        return { matchCount: 0, matches: [], status: 'none', error: e.message };
      }
    }, xpath);

    const response: TestXPathResponse = {
      xpath,
      matchCount: result.matchCount,
      status: result.status as any,
      matches: result.matches,
    };

    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    await close();
  }
});

export default router;
