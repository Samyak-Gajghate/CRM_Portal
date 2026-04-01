import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';
import { Plus, Filter, Ticket as TicketIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import SLATimer from '../components/ui/SLATimer';
import EmptyState from '../components/ui/EmptyState';

const TicketList = () => {
    const toast = useToast();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.get('/tickets');
                const fetchedTickets = response.data?.data || response.data || [];
                // Sort by newest first
                setTickets(fetchedTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (error) {
                toast.error("Failed to load tickets.");
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredTickets = tickets
        .filter(t => statusFilter === 'ALL' || t.status === statusFilter)
        .filter(t => priorityFilter === 'ALL' || t.priority === priorityFilter);

    if (loading) return <div className="flex h-[50vh] items-center justify-center text-slate-500">Loading tickets...</div>;

    const clearFilters = () => {
        setStatusFilter('ALL');
        setPriorityFilter('ALL');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">My Tickets</h1>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">Filters:</span>
                        </div>
                        
                        <div className="flex bg-white border border-slate-200 rounded-[6px] shadow-sm overflow-hidden">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-sm font-medium text-slate-700 bg-transparent py-1.5 pl-3 pr-8 border-none focus:ring-0 cursor-pointer hover:bg-slate-50 outline-none"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="ESCALATED">Escalated</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                            
                            <div className="w-[1px] bg-slate-200"></div>
                            
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="text-sm font-medium text-slate-700 bg-transparent py-1.5 pl-3 pr-8 border-none focus:ring-0 cursor-pointer hover:bg-slate-50 outline-none"
                            >
                                <option value="ALL">All Priorities</option>
                                <option value="CRITICAL">Critical</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Link
                    to="/tickets/new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-[6px] hover:bg-teal-700 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    New Ticket
                </Link>
            </div>

            {/* Active filters display */}
            {(statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Active:</span>
                    {statusFilter !== 'ALL' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-[4px] font-medium text-xs">
                            Status: {statusFilter}
                            <button onClick={() => setStatusFilter('ALL')} className="hover:text-slate-900 ml-1">×</button>
                        </span>
                    )}
                    {priorityFilter !== 'ALL' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-[4px] font-medium text-xs">
                            Priority: {priorityFilter}
                            <button onClick={() => setPriorityFilter('ALL')} className="hover:text-slate-900 ml-1">×</button>
                        </span>
                    )}
                    <button onClick={clearFilters} className="text-teal-600 hover:text-teal-700 font-medium text-xs ml-2">Clear all</button>
                </div>
            )}

            <div className="bg-white shadow-sm border border-slate-200 rounded-lg flex-1 flex flex-col overflow-hidden">
                {filteredTickets.length === 0 ? (
                    <EmptyState 
                        icon={TicketIcon}
                        title="No tickets found"
                        description={tickets.length === 0 ? "You haven't created any tickets yet." : "No tickets match your current filters."}
                        action={
                            tickets.length > 0 ? (
                                <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700">Clear filters</button>
                            ) : null
                        }
                    />
                ) : (
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 whitespace-nowrap sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 font-medium w-24">#</th>
                                    <th className="px-6 py-3 font-medium">Subject</th>
                                    <th className="px-6 py-3 font-medium w-32">Priority</th>
                                    <th className="px-6 py-3 font-medium w-32">Status</th>
                                    <th className="px-6 py-3 font-medium w-36">SLA</th>
                                    <th className="px-6 py-3 font-medium w-32 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTickets.map((ticket) => {
                                    const isResolved = ['RESOLVED', 'CLOSED'].includes(ticket.status);
                                    return (
                                        <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link to={`/tickets/${ticket.id}`} className="font-mono text-slate-500 group-hover:text-teal-600 transition-colors">
                                                    #{(ticket.id || '').toString().substring(0,6).toUpperCase()}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link to={`/tickets/${ticket.id}`} className={`font-semibold transition-colors truncate block max-w-xs md:max-w-md ${isResolved ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900 group-hover:text-teal-600'}`}>
                                                    {ticket.title}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <PriorityBadge priority={ticket.priority || 'LOW'} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={ticket.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <SLATimer dueTime={ticket.dueDate} status={ticket.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm text-right">
                                                {formatDistanceToNow(new Date(ticket.createdAt || Date.now()), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketList;
