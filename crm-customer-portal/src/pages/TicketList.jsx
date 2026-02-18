import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Filter } from 'lucide-react';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.get('/tickets');
                setTickets(response.data?.data || []);
            } catch (error) {
                console.error("Error fetching tickets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const filteredTickets = statusFilter === 'ALL'
        ? tickets
        : tickets.filter(t => t.status === statusFilter);

    if (loading) return <div className="text-center py-10">Loading tickets...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative rounded-md shadow-sm w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="ESCALATED">Escalated</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                    <Link
                        to="/tickets/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        New Ticket
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredTickets.length === 0 ? (
                        <li className="px-4 py-10 text-center text-gray-500">No tickets found</li>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <li key={ticket.id}>
                                <Link to={`/tickets/${ticket.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center truncate">
                                                <p className="font-medium text-blue-600 truncate">{ticket.title}</p>
                                                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                        ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {ticket.priority}
                                                </span>
                                            </div>
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
                                                <p>
                                                    Created: {new Date(ticket.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default TicketList;
