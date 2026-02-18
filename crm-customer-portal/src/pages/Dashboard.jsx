import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle, CheckCircle, Clock, FileText, Plus } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        escalated: 0,
        resolved: 0
    });
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, ticketsRes] = await Promise.all([
                    api.get('/tickets/stats'),
                    api.get('/tickets') // Backend filters by user automatically
                ]);

                setStats(statsRes.data?.data || stats);
                // Take only the 5 most recent tickets
                const rawTickets = ticketsRes.data?.data || [];
                const sorted = rawTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentTickets(sorted.slice(0, 5));
            } catch (err) {
                console.error("Error fetching dashboard data", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${bgColor}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="text-lg font-medium text-gray-900">{value}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <Link
                    to="/tickets/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Ticket
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Tickets"
                    value={stats.total}
                    icon={FileText}
                    color="text-blue-600"
                    bgColor="bg-blue-100"
                />
                <StatCard
                    title="Open Tickets"
                    value={stats.open}
                    icon={Clock}
                    color="text-yellow-600"
                    bgColor="bg-yellow-100"
                />
                <StatCard
                    title="Escalated"
                    value={stats.escalated}
                    icon={AlertCircle}
                    color="text-red-600"
                    bgColor="bg-red-100"
                />
                <StatCard
                    title="Resolved/Closed"
                    value={stats.resolved}
                    icon={CheckCircle}
                    color="text-green-600"
                    bgColor="bg-green-100"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {recentTickets.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">No recent tickets</li>
                    ) : (
                        recentTickets.map((ticket) => (
                            <li key={ticket.id}>
                                <Link to={`/tickets/${ticket.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-blue-600 truncate">{ticket.title}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                                        ticket.status === 'ESCALATED' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    #{ticket.id}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                <p>
                                                    {new Date(ticket.createdAt || Date.now()).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 rounded-b-lg">
                    <Link to="/tickets" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        View all tickets <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
