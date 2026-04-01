import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      {Icon && <Icon className="w-6 h-6 text-slate-400" />}
    </div>
    <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 mb-4 max-w-xs">{description}</p>
    {action}
  </div>
);

export default EmptyState;
