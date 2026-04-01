import React from 'react';

const priorityConfig = {
  CRITICAL: { color: 'text-red-600',    dot: 'bg-red-500',    label: 'CRITICAL' },
  HIGH:     { color: 'text-orange-600', dot: 'bg-orange-500', label: 'HIGH'     },
  MEDIUM:   { color: 'text-amber-600',  dot: 'bg-amber-500',  label: 'MEDIUM'   },
  LOW:      { color: 'text-slate-500',  dot: 'bg-slate-400',  label: 'LOW'      },
};

const PriorityBadge = ({ priority, chip = false }) => {
  const config = priorityConfig[priority] || priorityConfig.LOW;
  
  if (chip) {
      // Used in the ticket detail header
      let chipBg = '';
      if (priority === 'CRITICAL') chipBg = 'bg-red-50 text-red-700';
      if (priority === 'HIGH') chipBg = 'bg-orange-50 text-orange-700';
      if (priority === 'MEDIUM') chipBg = 'bg-amber-50 text-amber-700';
      if (priority === 'LOW') chipBg = 'bg-slate-50 text-slate-700';
      
      return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-sm font-semibold border ${chipBg} border-current border-opacity-20`}>
              <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
              {config.label}
          </span>
      )
  }

  // Used in tables
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

export default PriorityBadge;
