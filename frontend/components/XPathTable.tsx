'use client';

import { useState, useMemo, useCallback } from 'react';
import { XPathEntry } from '@/lib/types';

interface XPathTableProps {
  entries: XPathEntry[];
  onSelectEntry: (entry: XPathEntry) => void;
  selectedEntry: XPathEntry | null;
}

type SortKey = 'tag' | 'text' | 'id' | 'uniqueStatus' | 'matchCount';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

/** Build a compact single-line HTML opening tag preview from outerHTML */
function buildElementTag(entry: XPathEntry): string {
  const tag = entry.tag;
  const parts: string[] = [`<${tag}`];

  if (entry.id) parts.push(`id="${entry.id}"`);
  if (entry.className) parts.push(`class="${entry.className}"`);
  if (entry.name) parts.push(`name="${entry.name}"`);
  if (entry.type) parts.push(`type="${entry.type}"`);
  if (entry.placeholder) parts.push(`placeholder="${entry.placeholder}"`);
  if (entry.href && entry.href !== '#') parts.push(`href="${entry.href.substring(0, 40)}"`);
  if (entry.src) parts.push(`src="${entry.src.substring(0, 30)}..."`);

  // Pull any extra attrs not already listed
  const alreadyListed = new Set(['id', 'class', 'name', 'type', 'placeholder', 'href', 'src']);
  for (const [k, v] of Object.entries(entry.attributes)) {
    if (!alreadyListed.has(k) && parts.length < 5) {
      parts.push(`${k}="${String(v).substring(0, 30)}"`);
    }
  }

  const selfClosing = ['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tag);
  const openTag = parts.join(' ') + (selfClosing ? ' />' : '>');

  // Append truncated inner text if leaf node
  if (!selfClosing && entry.text) {
    const txt = entry.text.substring(0, 30) + (entry.text.length > 30 ? '…' : '');
    return `${openTag}${txt}</${tag}>`;
  }

  return selfClosing ? openTag : `${openTag}</${tag}>`;
}

/** Syntax-highlight a raw HTML string for display */
function HighlightedTag({ raw }: { raw: string }) {
  // tokenize into: tag-name, attr-name, attr-value, text, bracket
  const html = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // opening < tagname
    .replace(/&lt;(\/?)([\w-]+)/g, '<span class="ht-bracket">&lt;$1</span><span class="ht-tag">$2</span>')
    // closing >
    .replace(/&gt;/g, '<span class="ht-bracket">&gt;</span>')
    // attr="value"
    .replace(/([\w-]+)="([^"]*)"/g,
      '<span class="ht-attr">$1</span><span class="ht-eq">=</span><span class="ht-val">"$2"</span>')
    // self-close /
    .replace(/( \/)(?=&gt;|<span class="ht-bracket">&gt;<\/span>)/g, '<span class="ht-bracket">$1</span>');

  return (
    <span
      className="element-tag-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function XPathTable({ entries, onSelectEntry, selectedEntry }: XPathTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('tag');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    });
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) =>
      e.tag.includes(q) ||
      e.text.toLowerCase().includes(q) ||
      e.bestXpath.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.className.toLowerCase().includes(q) ||
      e.outerHTML.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey] as string | number;
      let bv: string | number = b[sortKey] as string | number;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className={`sort-icon ${sortKey === col ? 'active' : ''}`}>
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="table-container" id="xpath-table">
      {/* Search Bar */}
      <div className="table-toolbar">
        <div className="table-search-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            id="table-search-input"
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tag, text, xpath, id, class, html..."
            className="table-search"
          />
          {search && (
            <button className="search-clear" onClick={() => { setSearch(''); setPage(1); }}>✕</button>
          )}
        </div>
        <div className="table-meta">
          Showing <strong>{sorted.length}</strong> of <strong>{entries.length}</strong> elements
        </div>
      </div>

      {/* Table */}
      <div className="table-scroll">
        <table className="xpath-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('tag')} className="th-sortable" style={{ width: '80px' }}>
                Tag <SortIcon col="tag"/>
              </th>
              <th style={{ minWidth: '260px' }}>Element Definition</th>
              <th style={{ minWidth: '220px' }}>XPath</th>
              <th onClick={() => handleSort('uniqueStatus')} className="th-sortable" style={{ width: '110px' }}>
                Status <SortIcon col="uniqueStatus"/>
              </th>
              <th style={{ width: '40px' }}>Copy</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  No elements match your search
                </td>
              </tr>
            ) : (
              paginated.map((entry, i) => {
                const isSelected = selectedEntry?.index === entry.index;
                const rowKey = `${entry.index}-${i}`;
                const elementTag = buildElementTag(entry);

                return (
                  <tr
                    key={rowKey}
                    id={`row-${entry.index}`}
                    className={`table-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectEntry(entry)}
                  >
                    {/* Tag */}
                    <td>
                      <span className="tag-badge">&lt;{entry.tag}&gt;</span>
                    </td>

                    {/* Element Definition */}
                    <td className="td-element">
                      <div className="element-def-cell">
                        <HighlightedTag raw={elementTag} />
                        {entry.text && entry.text.length > 0 && (
                          <div className="element-inner-text" title={entry.text}>
                            {entry.text.substring(0, 60)}{entry.text.length > 60 ? '…' : ''}
                          </div>
                        )}
                        {/* Attribute pills for key attrs */}
                        <div className="element-attr-pills">
                          {entry.id && (
                            <span className="attr-pill attr-pill-id" title={`id="${entry.id}"`}>
                              #{entry.id.substring(0, 18)}
                            </span>
                          )}
                          {entry.className && (
                            <span className="attr-pill attr-pill-class" title={`class="${entry.className}"`}>
                              .{entry.className.split(' ')[0].substring(0, 18)}
                            </span>
                          )}
                          {entry.name && (
                            <span className="attr-pill attr-pill-name" title={`name="${entry.name}"`}>
                              name={entry.name.substring(0, 15)}
                            </span>
                          )}
                          {entry.type && (
                            <span className="attr-pill attr-pill-type" title={`type="${entry.type}"`}>
                              {entry.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* XPath */}
                    <td className="td-xpath-combined">
                      <div className="xpath-combined-cell">
                        <code className="xpath-cell" title={entry.bestXpath}>
                          {entry.bestXpath}
                        </code>
                        {entry.absoluteXpath !== entry.bestXpath && (
                          <div className="xpath-absolute-preview" title={entry.absoluteXpath}>
                            <span className="xpath-abs-label">abs</span>
                            <code className="xpath-abs-value">{entry.absoluteXpath}</code>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`status-pill status-${entry.uniqueStatus}`}>
                        {entry.uniqueStatus === 'unique' ? '✅ Unique' :
                         entry.uniqueStatus === 'multiple' ? `⚠️ ${entry.matchCount}` :
                         '❌ Invalid'}
                      </span>
                    </td>

                    {/* Copy */}
                    <td>
                      <button
                        id={`copy-btn-${entry.index}`}
                        className="copy-btn"
                        onClick={(e) => copyToClipboard(entry.bestXpath, rowKey, e)}
                        title="Copy XPath"
                      >
                        {copied === rowKey ? (
                          <span className="copy-check">✓</span>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            id="pagination-prev"
            className="page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >← Prev</button>

          <div className="page-numbers">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (page <= 4) {
                p = i + 1;
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = page - 3 + i;
              }
              return (
                <button
                  key={p}
                  id={`page-btn-${p}`}
                  className={`page-num ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            id="pagination-next"
            className="page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Next →</button>

          <span className="page-info">Page {page} of {totalPages}</span>
        </div>
      )}
    </div>
  );
}
