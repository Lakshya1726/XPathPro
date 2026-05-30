'use client';

import { useState, useEffect } from 'react';
import { XPathEntry } from '@/lib/types';
import { exportToCsv, exportToJson, exportToTxt } from '@/lib/export';

interface ExportMenuProps {
  entries: XPathEntry[];
  url: string;
}

export default function ExportMenu({ entries, url }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exported, setExported] = useState<string | null>(null);

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const handleExport = (type: 'csv' | 'json' | 'txt') => {
    const hostname = (() => { try { return new URL(url).hostname; } catch { return 'xpath'; } })();
    const ts = new Date().toISOString().slice(0, 10);
    const filename = `${hostname}-${ts}.${type}`;

    switch (type) {
      case 'csv': exportToCsv(entries, filename); break;
      case 'json': exportToJson(entries, filename); break;
      case 'txt': exportToTxt(entries, filename); break;
    }
    setExported(type.toUpperCase());
    setTimeout(() => setExported(null), 2000);
    setOpen(false);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        id="export-menu-btn"
        onClick={() => setOpen(!open)}
        className="btn-secondary flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        {exported ? `✓ ${exported} Exported` : 'Export'}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="export-dropdown">
          {(['csv', 'json', 'txt'] as const).map((type) => (
            <button
              key={type}
              id={`export-${type}-btn`}
              onClick={() => handleExport(type)}
              className="export-item"
            >
              <span className="export-icon">
                {type === 'csv' ? '📊' : type === 'json' ? '📋' : '📄'}
              </span>
              <div>
                <div className="export-label">{type.toUpperCase()}</div>
                <div className="export-desc">
                  {type === 'csv' ? 'Spreadsheet format' :
                   type === 'json' ? 'Full data with all XPaths' :
                   'Plain text list'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
