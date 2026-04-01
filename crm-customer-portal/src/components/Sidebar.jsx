import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, FileQuestion, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/Avatar';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-none text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#0d9488] text-white border-l-[3px] border-white/50'
        : 'text-[#94a3b8] hover:bg-[#2a3144] hover:text-[#e2e8f0] border-l-[3px] border-transparent'
    }`;

  const iconClass = ({ isActive }) =>
    `w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-60'}`;

  return (
    <aside className="fixed inset-y-0 left-0 w-[220px] bg-[#1e2433] flex flex-col z-40">
      <div className="flex items-center gap-3 h-[52px] px-5 border-b border-[#2a3144]">
        <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="text-white font-semibold text-sm tracking-wide truncate">CRM Portal</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="px-5 mb-2">
            <h3 className="text-[11px] font-semibold tracking-[0.07em] text-slate-500 uppercase">Support</h3>
          </div>
          <NavLink to="/" className={navItemClass} end>
            {(props) => (
              <>
                <LayoutDashboard className={iconClass(props)} />
                Dashboard
              </>
            )}
          </NavLink>
          <NavLink to="/tickets" className={navItemClass} end>
            {(props) => (
              <>
                <Ticket className={iconClass(props)} />
                Tickets
              </>
            )}
          </NavLink>
          <NavLink to="/tickets/new" className={navItemClass}>
            {(props) => (
              <>
                <PlusCircle className={iconClass(props)} />
                New Ticket
              </>
            )}
          </NavLink>
        </div>

        <div className="flex flex-col gap-1">
          <div className="px-5 mb-2">
            <h3 className="text-[11px] font-semibold tracking-[0.07em] text-slate-500 uppercase">Knowledge</h3>
          </div>
          <NavLink to="/faqs" className={navItemClass}>
            {(props) => (
              <>
                <FileQuestion className={iconClass(props)} />
                FAQs
              </>
            )}
          </NavLink>
        </div>
      </div>

      <div className="p-4 border-t border-[#2a3144]">
        <div className="flex items-center gap-3 w-full group">
          <Avatar username={user?.username} size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.username}</p>
            <p className="text-[11px] text-slate-500 capitalize truncate">{user?.role?.toLowerCase() || 'Customer'}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-[#2a3144] rounded transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
