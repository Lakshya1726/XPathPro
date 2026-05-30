import { XPathEntry } from './types';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCsv(entries: XPathEntry[], filename = 'xpath-export.csv'): void {
  const headers = ['Tag', 'Text', 'ID', 'Class', 'Best XPath', 'Absolute XPath', 'Relative XPath', 'Unique Status', 'Match Count'];
  const rows = entries.map((e) => [
    e.tag,
    e.text,
    e.id,
    e.className,
    e.bestXpath,
    e.absoluteXpath,
    e.relativeXpath,
    e.uniqueStatus,
    String(e.matchCount),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');

  downloadFile(csv, filename, 'text/csv');
}

export function exportToJson(entries: XPathEntry[], filename = 'xpath-export.json'): void {
  const data = entries.map((e) => ({
    tag: e.tag,
    text: e.text,
    id: e.id,
    class: e.className,
    bestXpath: e.bestXpath,
    absoluteXpath: e.absoluteXpath,
    relativeXpath: e.relativeXpath,
    idXpath: e.idXpath,
    nameXpath: e.nameXpath,
    classXpath: e.classXpath,
    textXpath: e.textXpath,
    containsTextXpath: e.containsTextXpath,
    uniqueStatus: e.uniqueStatus,
    matchCount: e.matchCount,
    attributes: e.attributes,
  }));
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
}

export function exportToTxt(entries: XPathEntry[], filename = 'xpath-export.txt'): void {
  const lines = entries.map((e, i) => {
    return [
      `--- Element ${i + 1}: <${e.tag}> ---`,
      `Text: ${e.text || '(none)'}`,
      `Best XPath: ${e.bestXpath}`,
      `Absolute: ${e.absoluteXpath}`,
      `Status: ${e.uniqueStatus}`,
      '',
    ].join('\n');
  });
  downloadFile(lines.join('\n'), filename, 'text/plain');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
