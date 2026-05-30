import { ScanHistoryItem } from '../types';
import { randomUUID } from 'crypto';

const history: ScanHistoryItem[] = [];
const MAX_HISTORY = 50;

export function addToHistory(item: Omit<ScanHistoryItem, 'id'>): ScanHistoryItem {
  const entry: ScanHistoryItem = { id: randomUUID(), ...item };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) {
    history.pop();
  }
  return entry;
}

export function getHistory(): ScanHistoryItem[] {
  return history;
}

export function clearHistory(): void {
  history.length = 0;
}
