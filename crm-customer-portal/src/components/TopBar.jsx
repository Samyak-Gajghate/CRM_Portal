import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/Avatar';

const TopBar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    let breadcrumbs = [];
    if (pathSegments.length === 0) {
        breadcrumbs = ['Dashboard'];
    } else {
        if (pathSegments[0] === 'tickets') {
            breadcrumbs.push('Tickets');
            if (pathSegments.length > 1) {
                if (pathSegments[1] === 'new') {
                    breadcrumbs.push('New');
                } else {
                    breadcrumbs.push(`#${pathSegments[1]}`);
                }
            }
        } else if (pathSegments[0] === 'faqs') {
            breadcrumbs.push('FAQs');
        } else {
            breadcrumbs.push(pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1));
        }
    }

    return (
        <header className="h-[52px] bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                        {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <span className={`${idx === breadcrumbs.length - 1 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                            {crumb}
                        </span>
                    </React.Fragment>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors">
                    <Search className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2" title={`Logged in as ${user?.username}`}>
                    <Avatar username={user?.username} size={28} />
                </div>
            </div>
        </header>
    );
};

export default TopBar;
