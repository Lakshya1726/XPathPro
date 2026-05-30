import { Page } from 'playwright';
import { XPathEntry } from '../types';

const SKIP_TAGS = new Set(['script', 'style', 'meta', 'link', 'head', '#comment', '#text']);

export async function extractXPaths(page: Page): Promise<XPathEntry[]> {
  const entries = await page.evaluate(() => {
    const results: any[] = [];
    const seenXpaths = new Set<string>();

    function getAbsoluteXPath(element: Element): string {
      if (element.tagName.toLowerCase() === 'html') return '/html';
      if (element === document.body) return '/html/body';

      const parent = element.parentElement;
      if (!parent) return '';

      const tagName = element.tagName.toLowerCase();
      const siblings = Array.from(parent.children).filter(
        (el) => el.tagName.toLowerCase() === tagName
      );

      const index = siblings.indexOf(element) + 1;
      const parentXPath = getAbsoluteXPath(parent);

      if (siblings.length === 1) {
        return `${parentXPath}/${tagName}`;
      }
      return `${parentXPath}/${tagName}[${index}]`;
    }

    function getRelativeXPath(element: Element): string {
      const id = element.getAttribute('id');
      if (id && /^[a-zA-Z][\w-]*$/.test(id)) {
        return `//*[@id='${id}']`;
      }

      const name = element.getAttribute('name');
      if (name) {
        return `//*[@name='${name}']`;
      }

      const tagName = element.tagName.toLowerCase();
      const textContent = element.textContent?.trim().substring(0, 50);
      if (textContent && textContent.length > 0 && textContent.length < 50 && element.children.length === 0) {
        const escaped = textContent.replace(/'/g, "\\'");
        return `//${tagName}[normalize-space(text())='${escaped}']`;
      }

      const className = element.getAttribute('class');
      if (className) {
        const firstClass = className.trim().split(/\s+/)[0];
        if (firstClass && /^[a-zA-Z][\w-]*$/.test(firstClass)) {
          return `//${tagName}[contains(@class,'${firstClass}')]`;
        }
      }

      return getAbsoluteXPath(element);
    }

    function getIdXPath(element: Element): string {
      const id = element.getAttribute('id');
      if (id) return `//*[@id='${id}']`;
      return '';
    }

    function getNameXPath(element: Element): string {
      const name = element.getAttribute('name');
      if (name) return `//*[@name='${name}']`;
      return '';
    }

    function getClassXPath(element: Element): string {
      const className = element.getAttribute('class');
      if (!className) return '';
      const firstClass = className.trim().split(/\s+/)[0];
      if (!firstClass) return '';
      return `//${element.tagName.toLowerCase()}[@class='${className.trim()}']`;
    }

    function getTextXPath(element: Element): string {
      const text = element.textContent?.trim().substring(0, 60);
      if (!text || element.children.length > 0) return '';
      const tag = element.tagName.toLowerCase();
      const escaped = text.replace(/'/g, "\\'");
      if (text.length < 40) {
        return `//${tag}[text()='${escaped}']`;
      }
      return '';
    }

    function getContainsTextXPath(element: Element): string {
      const text = element.textContent?.trim().substring(0, 30);
      if (!text || element.children.length > 0) return '';
      const tag = element.tagName.toLowerCase();
      const escaped = text.replace(/'/g, "\\'");
      return `//${tag}[contains(text(),'${escaped}')]`;
    }

    function getBestXPath(element: Element, absoluteXPath: string): string {
      const id = element.getAttribute('id');
      if (id && /^[a-zA-Z][\w-]*$/.test(id)) return `//*[@id='${id}']`;

      const name = element.getAttribute('name');
      if (name) return `//*[@name='${name}']`;

      const tag = element.tagName.toLowerCase();
      const text = element.textContent?.trim().substring(0, 30);
      if (text && text.length > 0 && text.length < 30 && element.children.length === 0) {
        const escaped = text.replace(/'/g, "\\'");
        return `//${tag}[contains(text(),'${escaped}')]`;
      }

      const placeholder = element.getAttribute('placeholder');
      if (placeholder) return `//${tag}[@placeholder='${placeholder}']`;

      const type = element.getAttribute('type');
      if (type && tag === 'input') return `//${tag}[@type='${type}']`;

      return absoluteXPath;
    }

    function countMatches(xpath: string): number {
      if (!xpath) return 0;
      try {
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        return result.snapshotLength;
      } catch {
        return -1;
      }
    }

    function getAttributes(element: Element): Record<string, string> {
      const attrs: Record<string, string> = {};
      for (const attr of Array.from(element.attributes)) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    }

    const skipTags = new Set(['script', 'style', 'meta', 'link', 'noscript', 'head']);

    function traverse(element: Element, index: { val: number }) {
      if (skipTags.has(element.tagName.toLowerCase())) return;

      const absoluteXPath = getAbsoluteXPath(element);
      if (seenXpaths.has(absoluteXPath)) return;
      seenXpaths.add(absoluteXPath);

      const bestXpath = getBestXPath(element, absoluteXPath);
      const matchCount = countMatches(bestXpath);
      const uniqueStatus = matchCount === 1 ? 'unique' : matchCount > 1 ? 'multiple' : 'invalid';

      const text = element.textContent?.trim().substring(0, 100) || '';
      const displayText = element.children.length === 0 ? text : '';

      results.push({
        tag: element.tagName.toLowerCase(),
        text: displayText,
        id: element.getAttribute('id') || '',
        className: element.getAttribute('class') || '',
        name: element.getAttribute('name') || '',
        href: element.getAttribute('href') || '',
        src: element.getAttribute('src') || '',
        type: element.getAttribute('type') || '',
        placeholder: element.getAttribute('placeholder') || '',
        absoluteXpath: absoluteXPath,
        relativeXpath: getRelativeXPath(element),
        idXpath: getIdXPath(element),
        nameXpath: getNameXPath(element),
        classXpath: getClassXPath(element),
        textXpath: getTextXPath(element),
        containsTextXpath: getContainsTextXPath(element),
        bestXpath: bestXpath,
        uniqueStatus,
        matchCount,
        attributes: getAttributes(element),
        outerHTML: element.outerHTML.substring(0, 500),
        index: index.val++,
      });

      for (const child of Array.from(element.children)) {
        traverse(child as Element, index);
      }
    }

    const indexCounter = { val: 0 };
    traverse(document.documentElement, indexCounter);

    return results;
  });

  return entries;
}
