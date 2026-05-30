'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getHistory, clearHistory } from '@/lib/api';
import { ScanHistoryItem } from '@/lib/types';

const EXAMPLE_URLS = [
  { url: 'https://google.com', label: 'Google' },
  { url: 'https://github.com', label: 'GitHub' },
  { url: 'https://wikipedia.org', label: 'Wikipedia' },
  { url: 'https://example.com', label: 'Example' },
];

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    getHistory().then(setHistory).catch(() => {});
  }, []);

  const handleSubmit = async (targetUrl?: string) => {
    const finalUrl = (targetUrl || url).trim();
    if (!finalUrl) return;
    setLoading(true);
    setError(null);
    router.push(`/results?url=${encodeURIComponent(finalUrl)}`);
  };

  return (
    <main className="home-page">
      {/* Animated background grid */}
      <div className="bg-grid" aria-hidden="true"/>
      <div className="bg-glow-1" aria-hidden="true"/>
      <div className="bg-glow-2" aria-hidden="true"/>

      {/* Header */}
      <header className="home-header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h7"/>
              <circle cx="19" cy="18" r="3"/>
              <path d="M17 18h4M19 16v4"/>
            </svg>
          </div>
          <span className="logo-text">XPath<span className="logo-accent">Pro</span></span>
        </div>
        <div className="header-badge">
          <span className="badge-dot"/>
          QA Automation Tool
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-label">
          <span className="hero-label-dot"/>
          Powered by Playwright
        </div>

        <h1 className="hero-title">
          Extract Every <span className="gradient-text">XPath Selector</span>
          <br/>From Any Webpage
        </h1>

        <p className="hero-subtitle">
          A production-grade QA automation tool. Enter any URL and instantly extract all
          unique XPath expressions — similar to Chrome DevTools, SelectorsHub, and ChroPath.
        </p>

        {/* URL Input */}
        <div className="url-input-card" id="url-input-section">
          <div className="url-input-label">Enter URL to analyze</div>
          <div className="url-input-row">
            <div className="url-input-wrapper">
              <svg className="url-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="https://google.com"
                className="url-input"
                autoFocus
                spellCheck={false}
              />
            </div>
            <button
              id="extract-btn"
              className="btn-primary btn-large"
              onClick={() => handleSubmit()}
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-sm"/>
                  Extracting...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Extract XPaths
                </>
              )}
            </button>
          </div>

          {error && <div className="url-error">{error}</div>}

          {/* Example URLs */}
          <div className="example-urls">
            <span className="example-label">Try:</span>
            {EXAMPLE_URLS.map((ex) => (
              <button
                key={ex.url}
                id={`example-${ex.label.toLowerCase()}-btn`}
                className="example-chip"
                onClick={() => handleSubmit(ex.url)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div className="feature-grid">
          {[
            { icon: '⚡', title: 'JS-Rendered Pages', desc: 'Playwright handles dynamic content' },
            { icon: '🎯', title: '7 XPath Strategies', desc: 'ID, name, class, text, absolute, relative' },
            { icon: '✅', title: 'Uniqueness Validation', desc: 'Every XPath tested against live DOM' },
            { icon: '📸', title: 'Screenshot Highlight', desc: 'Visualize matched elements' },
            { icon: '🔍', title: 'XPath Console', desc: 'Test custom XPaths live' },
            { icon: '📤', title: 'Multi-format Export', desc: 'CSV, JSON, and TXT download' },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scan History */}
      {history.length > 0 && (
        <section className="history-section" id="scan-history">
          <div className="history-header">
            <h2 className="history-title">Recent Scans</h2>
            <button
              id="clear-history-btn"
              className="btn-ghost"
              onClick={() => clearHistory().then(() => setHistory([]))}
            >
              Clear history
            </button>
          </div>
          <div className="history-list">
            {history.slice(0, 6).map((item) => (
              <button
                key={item.id}
                className="history-item"
                onClick={() => handleSubmit(item.url)}
                id={`history-item-${item.id}`}
              >
                <div className="history-url">{item.url}</div>
                <div className="history-meta">
                  <span>{item.totalElements} elements</span>
                  <span>•</span>
                  <span>{item.uniqueCount} unique</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <footer className="home-footer">
        <p>XPath Extractor Pro — Built for QA Engineers & Web Automation</p>
      </footer>
    </main>
  );
}
