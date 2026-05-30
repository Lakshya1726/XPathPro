'use client';

import { ExtractResponse } from '@/lib/types';
import { useEffect, useState } from 'react';

interface StatsBarProps {
  data: ExtractResponse;
}

function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <>{val.toLocaleString()}</>;
}

export default function StatsBar({ data }: StatsBarProps) {
  const invalidCount = data.totalElements - data.uniqueCount - data.multipleCount;
  const uniquePct = data.totalElements > 0 ? Math.round((data.uniqueCount / data.totalElements) * 100) : 0;

  const stats = [
    { label: 'Total Elements', value: data.totalElements, color: 'var(--accent-blue)', icon: '⊞' },
    { label: 'Unique XPaths', value: data.uniqueCount, color: 'var(--accent-green)', icon: '✅' },
    { label: 'Multiple Matches', value: data.multipleCount, color: '#f59e0b', icon: '⚠️' },
    { label: 'Unique Rate', value: uniquePct, color: 'var(--accent-purple)', icon: '📊', suffix: '%' },
  ];

  return (
    <div className="stats-bar" id="stats-bar">
      {stats.map((s) => (
        <div key={s.label} className="stat-card">
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-content">
            <div className="stat-value" style={{ color: s.color }}>
              <AnimatedNumber target={s.value} />
              {s.suffix}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
          <div className="stat-bar">
            <div
              className="stat-bar-fill"
              style={{
                width: `${s.suffix ? s.value : (s.value / data.totalElements) * 100}%`,
                background: s.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
