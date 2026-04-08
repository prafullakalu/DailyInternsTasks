import React from 'react';
import type { TaskStatusValue } from '../types/task';

interface StatItem {
  status: TaskStatusValue;
  count: number;
}

interface StatsOverviewProps {
  stats: {
    counts: StatItem[];
    overDue: number;
  };
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => (
  <div className="stats-grid">
    {stats.counts.map((item) => (
      <article key={item.status} className="stat-card">
        <div className="stat-label">
          <span className={`dot dot-${item.status.toLowerCase()}`} />
          <p>{item.status.replace('_', ' ').toUpperCase()}</p>
        </div>
        <h3>{item.count}</h3>
      </article>
    ))}
    <article className="stat-card">
      <div className="stat-label">
        <span className="dot dot-warning" />
        <p>Overdue</p>
      </div>
      <h3>{stats.overDue}</h3>
    </article>
  </div>
);

export default StatsOverview;
