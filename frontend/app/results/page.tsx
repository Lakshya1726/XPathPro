'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { extractXPaths } from '@/lib/api';
import { ExtractResponse, XPathEntry } from '@/lib/types';
import XPathTable from '@/components/XPathTable';
import FilterBar from '@/components/FilterBar';
import ElementInspector from '@/components/ElementInspector';
import XPathConsole from '@/components/XPathConsole';
import StatsBar from '@/components/StatsBar';
import ExportMenu from '@/components/ExportMenu';

type FilterType = 'all' | 'a' | 'button' | 'input' | 'form' | 'table' | 'img' | 'div' | 'select' | 'textarea' | 'span' | 'li';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url') || '';

  const [data, setData] = useState<ExtractResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<XPathEntry | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!url) { router.push('/'); return; }

    const start = Date.now();
    const interval = setInterval(() => setElapsedMs(Date.now() - start), 100);

    extractXPaths(url)
      .then((res) => {
        setData(res);
        clearInterval(interval);
        setElapsedMs(Date.now() - start);
      })
      .catch((e) => {
        setError(e.message);
        clearInterval(interval);
      })
      .finally(() => setLoading(false));

    return () => clearInterval(interval);
  }, [url, router]);

  const tagCounts = useMemo(() => {
    if (!data) return {};
    return data.entries.reduce((acc, e) => {
      acc[e.tag] = (acc[e.tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  const filteredEntries = useMemo(() => {
    if (!data) return [];
    if (activeFilter === 'all') return data.entries;
    return data.entries.filter((e) => e.tag === activeFilter);
  }, [data, activeFilter]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <div className="loading-spinner-ring"/>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h7"/>
              <circle cx="19" cy="18" r="3"/>
              <path d="M17 18h4M19 16v4"/>
            </svg>
          </div>

          <h2 className="loading-title">Extracting XPaths</h2>
          <p className="loading-url">{url}</p>

          <div className="loading-steps">
            {[
              { label: 'Launching headless Chromium', done: elapsedMs > 1000 },
              { label: 'Loading & rendering page', done: elapsedMs > 3000 },
              { label: 'Traversing DOM elements', done: elapsedMs > 5000 },
              { label: 'Generating XPath strategies', done: elapsedMs > 7000 },
              { label: 'Validating uniqueness', done: elapsedMs > 9000 },
            ].map((step, i) => (
              <div key={i} className={`loading-step ${step.done ? 'done' : elapsedMs > i * 2000 ? 'active' : ''}`}>
                <span className="loading-step-icon">{step.done ? '✓' : '○'}</span>
                {step.label}
              </div>
            ))}
          </div>

          <div className="loading-timer">{(elapsedMs / 1000).toFixed(1)}s elapsed</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2>Extraction Failed</h2>
          <p className="error-message">{error}</p>
          <p className="error-url">{url}</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
            <button className="btn-secondary" onClick={() => router.push('/')}>← Back Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="results-page">
      {/* Top bar */}
      <header className="results-header">
        <button id="back-btn" className="btn-ghost" onClick={() => router.push('/')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div className="results-url-display">
          <span className="results-url-label">Analyzing:</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="results-url-link">
            {url}
          </a>
        </div>
        <div className="results-actions">
          <span className="results-timing">⏱ {(elapsedMs / 1000).toFixed(2)}s</span>
          <ExportMenu entries={filteredEntries} url={url}/>
        </div>
      </header>

      {/* Stats */}
      <StatsBar data={data}/>

      {/* Filter Bar */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={(f) => { setActiveFilter(f); setSelectedEntry(null); }}
        counts={tagCounts}
      />

      {/* Main content */}
      <div className={`results-body ${selectedEntry ? 'inspector-open' : ''}`}>
        <div className="results-table-panel">
          <XPathTable
            entries={filteredEntries}
            onSelectEntry={setSelectedEntry}
            selectedEntry={selectedEntry}
          />
        </div>

        {selectedEntry && (
          <div className="results-inspector-panel">
            <ElementInspector
              entry={selectedEntry}
              url={url}
              onClose={() => setSelectedEntry(null)}
            />
          </div>
        )}
      </div>

      {/* XPath Console */}
      <XPathConsole url={url}/>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner-ring"/>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ResultsContent/>
    </Suspense>
  );
}
