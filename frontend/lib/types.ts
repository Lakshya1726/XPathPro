export interface XPathEntry {
  tag: string;
  text: string;
  id: string;
  className: string;
  name: string;
  href: string;
  src: string;
  type: string;
  placeholder: string;
  absoluteXpath: string;
  relativeXpath: string;
  idXpath: string;
  nameXpath: string;
  classXpath: string;
  textXpath: string;
  containsTextXpath: string;
  bestXpath: string;
  uniqueStatus: 'unique' | 'multiple' | 'invalid';
  matchCount: number;
  attributes: Record<string, string>;
  outerHTML: string;
  index: number;
}

export interface ExtractResponse {
  url: string;
  timestamp: string;
  totalElements: number;
  uniqueCount: number;
  multipleCount: number;
  entries: XPathEntry[];
}

export interface ScanHistoryItem {
  id: string;
  url: string;
  timestamp: string;
  totalElements: number;
  uniqueCount: number;
}

export interface TestXPathResponse {
  xpath: string;
  matchCount: number;
  status: 'unique' | 'multiple' | 'none';
  matches: Array<{
    tag: string;
    text: string;
    outerHTML: string;
  }>;
}

export interface ScreenshotResponse {
  imageBase64: string;
  matchCount: number;
}
