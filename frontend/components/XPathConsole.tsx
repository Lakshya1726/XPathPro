'use client';

import { useState } from 'react';
import { testXPath } from '@/lib/api';
import { TestXPathResponse } from '@/lib/types';

interface XPathConsoleProps {
  url: string;
}

export default function XPathConsole({ url }: XPathConsoleProps) {
  const [xpath, setXpath] = useState('');
  const [result, setResult] = useState<TestXPathResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleTest = async () => {
    if (!xpath.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await testXPath(url, xpath.trim());
      setResult(res);
      setExpanded(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor =
    result?.status === 'unique' ? 'var(--accent-green)' :
    result?.status === 'multiple' ? '#f59e0b' :
    '#ef4444';

  const statusIcon =
    result?.status === 'unique' ? '✅' :
    result?.status === 'multiple' ? '⚠️' : '❌';

  return (
    <div className="console-panel" id="xpath-console">
      <div className="console-header" onClick={() => setExpanded(!expanded)}>
        <div className="console-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
          XPath Test Console
          {result && (
            <span className="console-badge" style={{ color: statusColor }}>
              {statusIcon} {result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {expanded && (
        <div className="console-body">
          <div className="console-input-row">
            <input
              id="xpath-console-input"
              type="text"
              value={xpath}
              onChange={(e) => setXpath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTest()}
              placeholder="//button[contains(text(),'Login')]"
              className="console-input"
              spellCheck={false}
            />
            <button
              id="test-xpath-btn"
              className="btn-primary"
              onClick={handleTest}
              disabled={loading || !xpath.trim()}
            >
              {loading ? <span className="spinner-sm"/> : 'Test XPath'}
            </button>
          </div>

          <div className="console-examples">
            <span className="console-examples-label">Try:</span>
            {['//a', '//button', '//input', '//img', '//*[@id]'].map((ex) => (
              <button
                key={ex}
                className="console-example-chip"
                onClick={() => { setXpath(ex); }}
              >
                {ex}
              </button>
            ))}
          </div>

          {error && <div className="console-error">{error}</div>}

          {result && (
            <div className="console-result">
              <div className="console-result-header" style={{ borderColor: statusColor }}>
                <span style={{ color: statusColor }}>
                  {statusIcon} {result.matchCount === 0 ? 'No matches found' :
                    result.matchCount === 1 ? '1 Unique Match Found' :
                    `${result.matchCount} Matches Found`}
                </span>
                <span className="console-result-xpath">{result.xpath}</span>
              </div>

              {result.matches.length > 0 && (
                <div className="console-matches">
                  {result.matches.slice(0, 5).map((m, i) => (
                    <div key={i} className="console-match-item">
                      <span className="console-match-tag">&lt;{m.tag}&gt;</span>
                      {m.text && <span className="console-match-text">{m.text.substring(0, 80)}</span>}
                    </div>
                  ))}
                  {result.matchCount > 5 && (
                    <div className="console-more">+{result.matchCount - 5} more matches</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
