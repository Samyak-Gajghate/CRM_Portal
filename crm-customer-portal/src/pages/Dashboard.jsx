import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { FileText, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import EmptyState from '../components/ui/EmptyState';

const Dashboard = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        escalated: 0,
        resolved: 0
    });
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, ticketsRes] = await Promise.all([
                    api.get('/tickets/stats'),
                    api.get('/tickets')
                ]);

                setStats(statsRes.data?.data || statsRes.data || stats);
                const rawTickets = ticketsRes.data?.data || ticketsRes.data || [];
                const sorted = rawTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentTickets(sorted.slice(0, 5));
            } catch (err) {
                toast.error("Failed to load dashboard. Refresh to try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return <div className="flex h-[50vh] items-center justify-center text-slate-500">Loading dashboard...</div>;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const todayDate = format(new Date(), 'EEEE, MMMM d, yyyy');

    const StatCard = ({ title, value, icon: Icon, colorClass, borderClass, bgClass, isEscalated }) => {
        const hasEscalated = isEscalated && value > 0;
        return (
            <div className={`relative overflow-hidden shadow-sm rounded-lg flex flex-col p-5 bg-white border border-slate-200 transition-colors ${hasEscalated ? 'bg-red-50/50 border-red-100' : ''}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasEscalated ? 'bg-red-500' : borderClass}`}></div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-md ${hasEscalated ? 'bg-red-100' : bgClass}`}>
                            <Icon className={`w-4 h-4 ${hasEscalated ? 'text-red-600' : colorClass}`} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            {title}
                            {hasEscalated && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                        </h3>
                    </div>
                </div>
                <div>
                    <p className={`text-3xl font-bold ${hasEscalated ? 'text-red-700' : 'text-slate-900'}`}>{value}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {getGreeting()}, {user?.username} <span className="text-xl">👋</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{todayDate}</p>
                </div>
                <Link
                    to="/tickets/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-[6px] hover:bg-teal-700 active:scale-[0.98] transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Ticket
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Tickets"
                    value={stats.total}
                    icon={FileText}
                    colorClass="text-teal-600"
                    bgClass="bg-teal-50"
                    borderClass="bg-teal-500"
                />
                <StatCard
                    title="Open Tickets"
                    value={stats.open}
                    icon={Clock}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50"
                    borderClass="bg-amber-500"
                />
                <StatCard
                    title="Escalated"
                    value={stats.escalated}
                    icon={AlertCircle}
                    colorClass="text-red-600"
                    bgClass="bg-red-50"
                    borderClass="bg-red-500"
                    isEscalated={true}
                />
                <StatCard
                    title="Resolved/Closed"
                    value={stats.resolved}
                    icon={CheckCircle}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                    borderClass="bg-emerald-500"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-base font-semibold text-slate-800">Recent Activity</h2>
                    <Link to="/tickets" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                        View all &rarr;
                    </Link>
                </div>
                
                {recentTickets.length === 0 ? (
                    <EmptyState 
                        icon={FileText}
                        title="No recent tickets"
                        description="You don't have any recent ticket activity to show."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">#</th>
                                    <th className="px-6 py-3 font-medium">Subject</th>
                                    <th className="px-6 py-3 font-medium">Priority</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <Link to={`/tickets/${ticket.id}`} className="font-mono text-slate-500 group-hover:text-teal-600 transition-colors">
                                                #{(ticket.id || '').toString().substring(0,6).toUpperCase()}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Link to={`/tickets/${ticket.id}`} className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors truncate block max-w-xs md:max-w-md">
                                                {ticket.title}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <PriorityBadge priority={ticket.priority || 'LOW'} />
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <StatusBadge status={ticket.status} />
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-slate-500 text-sm">
                                            {formatDistanceToNow(new Date(ticket.createdAt || Date.now()), { addSuffix: true })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
