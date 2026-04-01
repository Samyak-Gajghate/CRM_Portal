import React from 'react';

const statusConfig = {
  OPEN:        { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500', label: 'OPEN'  },
  IN_PROGRESS: { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500', label: 'IN PROGRESS'   },
  ESCALATED:   { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500', label: 'ESCALATED'    },
  RESOLVED:    { bg: 'bg-emerald-50', text: 'text-emerald-800',dot: 'bg-emerald-500', label: 'RESOLVED'},
  CLOSED:      { bg: 'bg-slate-100',  text: 'text-slate-600',  dot: 'bg-slate-400', label: 'CLOSED'  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.OPEN;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
