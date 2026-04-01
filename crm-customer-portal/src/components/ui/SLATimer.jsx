import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const calculateTimeLeft = (dueTime) => {
    const now = new Date();
    const due = new Date(dueTime);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs <= 0) return null; // Overdue
    
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes };
}

const SLATimer = ({ dueTime, status }) => {
  const [timeLeft, setTimeLeft] = useState(dueTime ? calculateTimeLeft(dueTime) : { hours: 0, minutes: 0});

  useEffect(() => {
    if (!dueTime) return;
    if (['RESOLVED', 'CLOSED'].includes(status)) return;
    
    setTimeLeft(calculateTimeLeft(dueTime));
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(dueTime));
    }, 60000);
    return () => clearInterval(interval);
  }, [dueTime, status]);

  if (['RESOLVED', 'CLOSED'].includes(status)) return <span className="text-slate-400">—</span>;
  if (!dueTime) return <span className="text-slate-400">—</span>;

  const isOverdue = timeLeft === null;
  const isWarning = !isOverdue && timeLeft.hours < 2;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-medium
      ${isOverdue ? 'bg-red-100 text-red-700 animate-pulse' :
        isWarning ? 'bg-amber-100 text-amber-700' :
        'bg-green-100 text-green-700'}`}>
      <Clock className="w-3 h-3" />
      {isOverdue ? 'Overdue' : `${timeLeft.hours}h ${timeLeft.minutes}m`}
    </span>
  );
};

export default SLATimer;
