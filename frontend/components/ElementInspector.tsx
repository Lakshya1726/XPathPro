'use client';

import { useState } from 'react';
import { XPathEntry } from '@/lib/types';
import { takeScreenshot } from '@/lib/api';

interface ElementInspectorProps {
  entry: XPathEntry;
  url: string;
  onClose: () => void;
}

type XPathStrategy = {
  label: string;
  value: string;
  color: string;
};

export default function ElementInspector({ entry, url, onClose }: ElementInspectorProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'xpaths' | 'attrs' | 'screenshot'>('xpaths');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const handleScreenshot = async () => {
    setScreenshotLoading(true);
    setScreenshotError(null);
    try {
      const res = await takeScreenshot(url, entry.bestXpath);
      setScreenshot(res.imageBase64);
      setActiveTab('screenshot');
    } catch (e: any) {
      setScreenshotError(e.message);
    } finally {
      setScreenshotLoading(false);
    }
  };

  const strategies: XPathStrategy[] = [
    { label: 'Best XPath', value: entry.bestXpath, color: 'var(--accent-green)' },
    { label: 'Absolute XPath', value: entry.absoluteXpath, color: 'var(--accent-blue)' },
    { label: 'Relative XPath', value: entry.relativeXpath, color: 'var(--accent-purple)' },
    entry.idXpath ? { label: 'ID-based', value: entry.idXpath, color: '#f59e0b' } : null,
    entry.nameXpath ? { label: 'Name-based', value: entry.nameXpath, color: '#ec4899' } : null,
    entry.classXpath ? { label: 'Class-based', value: entry.classXpath, color: '#06b6d4' } : null,
    entry.textXpath ? { label: 'Text-based', value: entry.textXpath, color: '#84cc16' } : null,
    entry.containsTextXpath ? { label: 'Contains Text', value: entry.containsTextXpath, color: '#a78bfa' } : null,
  ].filter(Boolean) as XPathStrategy[];

  const statusIcon = entry.uniqueStatus === 'unique' ? '✅' : entry.uniqueStatus === 'multiple' ? '⚠️' : '❌';
  const statusLabel = entry.uniqueStatus === 'unique' ? 'Unique' : entry.uniqueStatus === 'multiple' ? `${entry.matchCount} Matches` : 'Invalid';

  const highlightHtml = (html: string) => {
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;(\/?[a-zA-Z][a-zA-Z0-9]*)/g, '<span class="html-tag">&lt;$1</span>')
      .replace(/(\s)([\w-]+)=/g, '$1<span class="html-attr">$2</span>=')
      .replace(/="([^"]*)"/g, '="<span class="html-value">$1</span>"');
  };

  return (
    <div className="inspector-panel" id="element-inspector">
      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title">
          <span className="inspector-tag-badge">&lt;{entry.tag}&gt;</span>
          <span className="inspector-title-text">Element Inspector</span>
          <span className={`status-badge status-${entry.uniqueStatus}`}>{statusIcon} {statusLabel}</span>
        </div>
        <div className="inspector-actions">
          <button
            id="screenshot-btn"
            className="btn-ghost"
            onClick={handleScreenshot}
            disabled={screenshotLoading}
          >
            {screenshotLoading ? (
              <span className="spinner-sm"/>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            )}
            Screenshot
          </button>
          <button id="close-inspector-btn" className="btn-icon" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* HTML Preview */}
      <div className="inspector-html">
        <div className="inspector-section-label">HTML Preview</div>
        <div
          className="html-preview"
          dangerouslySetInnerHTML={{ __html: highlightHtml(entry.outerHTML) }}
        />
      </div>

      {/* Tabs */}
      <div className="inspector-tabs">
        {(['xpaths', 'attrs', 'screenshot'] as const).map((tab) => (
          <button
            key={tab}
            id={`inspector-tab-${tab}`}
            className={`inspector-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'xpaths' ? 'XPath Strategies' : tab === 'attrs' ? 'Attributes' : 'Screenshot'}
          </button>
        ))}
      </div>

      <div className="inspector-body">
        {activeTab === 'xpaths' && (
          <div className="xpath-strategies">
            {strategies.map((s, i) => (
              <div key={i} className="xpath-strategy-row">
                <div className="xpath-strategy-label" style={{ color: s.color }}>{s.label}</div>
                <div className="xpath-strategy-value">
                  <code className="xpath-code">{s.value}</code>
                  <button
                    id={`copy-xpath-${i}-btn`}
                    className="copy-btn"
                    onClick={() => copyToClipboard(s.value, `${i}`)}
                  >
                    {copied === `${i}` ? '✓' : '⎘'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'attrs' && (
          <div className="attrs-table">
            {Object.entries(entry.attributes).length === 0 ? (
              <div className="no-data">No attributes</div>
            ) : (
              Object.entries(entry.attributes).map(([key, value]) => (
                <div key={key} className="attr-row">
                  <span className="attr-key">{key}</span>
                  <span className="attr-eq">=</span>
                  <span className="attr-value">"{value}"</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'screenshot' && (
          <div className="screenshot-view">
            {screenshotError && (
              <div className="error-msg">{screenshotError}</div>
            )}
            {screenshot ? (
              <img
                src={`data:image/jpeg;base64,${screenshot}`}
                alt="Element screenshot"
                className="screenshot-img"
                id="element-screenshot"
              />
            ) : screenshotLoading ? (
              <div className="screenshot-loading">
                <div className="spinner"/>
                <p>Taking screenshot & highlighting element...</p>
              </div>
            ) : (
              <div className="screenshot-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <p>Click "Screenshot" to capture the element</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
