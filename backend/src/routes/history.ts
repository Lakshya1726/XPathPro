import { Router, Request, Response } from 'express';
import { getHistory, clearHistory } from '../services/history';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(getHistory());
});

router.delete('/', (_req: Request, res: Response) => {
  clearHistory();
  res.json({ success: true });
});

export default router;
