import React from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const Toaster = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;
    
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className={`flex items-start gap-3 p-4 bg-white rounded-[8px] shadow-lg border-l-4 pointer-events-auto transition-all animate-in slide-in-from-right-5 fade-in duration-300 ${toast.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
                    {toast.type === 'error' ? <XCircle className="w-5 h-5 text-red-500 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                    <div className="flex-1 text-sm font-medium text-slate-800">
                        {toast.message}
                    </div>
                    <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Toaster;
