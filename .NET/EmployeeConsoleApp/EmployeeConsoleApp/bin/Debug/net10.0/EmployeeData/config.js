// config.js - Configuration constants and enums
const DEPARTMENTS = {
  1: { name: 'Sales',       color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.35)' },
  2: { name: 'Marketing',   color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.35)' },
  3: { name: 'Development', color: '#e2e8f0', bg: 'rgba(226,232,240,0.12)', border: 'rgba(226,232,240,0.3)' },
  4: { name: 'QA',          color: '#38bdf8', bg: 'rgba(56,189,248,0.15)',  border: 'rgba(56,189,248,0.35)' },
  5: { name: 'HR',          color: '#fb923c', bg: 'rgba(251,146,60,0.15)',  border: 'rgba(251,146,60,0.35)' },
  6: { name: 'SEO',         color: '#f472b6', bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.35)' },
};

// Extension method for Date formatting
Date.prototype.toCustomDateString = function() {
  try {
    const day = String(this.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[this.getMonth()];
    const year = this.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '—';
  }
};

const DateHelper = {
  MONTHS: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  format(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return '—';
      return d.toCustomDateString();
    } catch (error) {
      console.error('Error in DateHelper.format:', error);
      return '—';
    }
  }
};