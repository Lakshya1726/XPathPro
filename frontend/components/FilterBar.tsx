'use client';

type FilterType = 'all' | 'a' | 'button' | 'input' | 'form' | 'table' | 'img' | 'div' | 'select' | 'textarea' | 'span' | 'li';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  counts: Record<string, number>;
}

const FILTERS: Array<{ key: FilterType; label: string; icon: string }> = [
  { key: 'all', label: 'All', icon: '⊞' },
  { key: 'a', label: 'Links', icon: '🔗' },
  { key: 'button', label: 'Buttons', icon: '🔘' },
  { key: 'input', label: 'Inputs', icon: '📝' },
  { key: 'form', label: 'Forms', icon: '📋' },
  { key: 'table', label: 'Tables', icon: '📊' },
  { key: 'img', label: 'Images', icon: '🖼️' },
  { key: 'div', label: 'Divs', icon: '▭' },
  { key: 'select', label: 'Selects', icon: '▾' },
  { key: 'span', label: 'Spans', icon: '≋' },
];

export default function FilterBar({ activeFilter, onFilterChange, counts }: FilterBarProps) {
  return (
    <div className="filter-bar" id="filter-bar">
      <div className="filter-label">Filter by Tag:</div>
      <div className="filter-chips">
        {FILTERS.map((f) => {
          const count = f.key === 'all'
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : (counts[f.key] || 0);

          return (
            <button
              key={f.key}
              id={`filter-${f.key}-btn`}
              className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
              onClick={() => onFilterChange(f.key)}
            >
              <span className="filter-icon">{f.icon}</span>
              <span className="filter-label-text">{f.label}</span>
              {count > 0 && <span className="filter-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
