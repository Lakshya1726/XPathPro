import { Router, Request, Response } from 'express';
import { getPage } from '../services/browser';
import { extractXPaths } from '../services/xpath';
import { addToHistory } from '../services/history';
import { ExtractResponse } from '../types';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const { page, close } = await getPage(normalizedUrl);

  try {
    const entries = await extractXPaths(page);

    const uniqueCount = entries.filter((e) => e.uniqueStatus === 'unique').length;
    const multipleCount = entries.filter((e) => e.uniqueStatus === 'multiple').length;

    addToHistory({
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
      totalElements: entries.length,
      uniqueCount,
    });

    const response: ExtractResponse = {
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
      totalElements: entries.length,
      uniqueCount,
      multipleCount,
      entries,
    };

    res.json(response);
  } catch (err: any) {
    console.error('Extraction error:', err);
    res.status(500).json({ error: err.message || 'Extraction failed' });
  } finally {
    await close();
  }
});

export default router;
